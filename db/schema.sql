-- Pricele's server-side state. Run this once against a fresh Neon database.
--
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- Two features live here and they have different privacy shapes, which is why
-- the tables are kept apart rather than merged into one "results" table.
--
-- The crowd counters are pure aggregate. There is no row anywhere in them that
-- describes a person: no IP address, no user agent, no bid history, no account.
--
-- The classroom tables are not aggregate, and cannot be: a board that shows who
-- bid what is the entire feature. They hold a display name the player typed and
-- one day's bids, they are scoped to a room code, and they are deleted on a
-- timer. A room is a session, not a record.
--
-- Re-running the file is safe. Every statement is guarded.

-- ===========================================================================
-- Crowd statistics
-- ===========================================================================

-- Scalars for one day, one (item, country) pair, one audience.
--
-- player_country = '' is the everyone row. Any other value is the ISO code the
-- player told us they are from, which is what makes "players from Romania
-- underestimate Romania" answerable with the same table and no joins.
create table if not exists crowd_day (
  play_date      date    not null,
  item_id        text    not null,
  country        text    not null,
  player_country text    not null default '',

  plays          integer not null default 0,
  wins           integer not null default 0,

  -- Opening bids are summed in LOG space, not in dollars.
  --
  -- This is the one column here that is easy to get wrong and expensive to fix
  -- later. Prices in this game span four orders of magnitude, and the mean of a
  -- set of dollar guesses is dragged around by whoever typed the largest number.
  -- The mean of their logs is the geometric mean, which is the right centre for
  -- a quantity people misjudge multiplicatively: someone who guesses double and
  -- someone who guesses half cancel out, which is what "unbiased" should mean.
  first_log_sum  double precision not null default 0,
  first_over     integer not null default 0,

  -- Sum of |ln(best bid / price)|, for the day's mean accuracy.
  best_log_sum   double precision not null default 0,

  updated_at     timestamptz not null default now(),

  primary key (play_date, item_id, country, player_country)
);

-- Histogram of how close players got, in 5-percentage-point buckets from 0 to
-- 200% off. Bucket 39 is a catch-all for everything 195% and worse.
--
-- Rows rather than an array column, so a bucket increment is an ordinary upsert.
-- Subscripted assignment inside ON CONFLICT DO UPDATE is the kind of clever that
-- breaks quietly on a driver upgrade.
create table if not exists crowd_bucket (
  play_date date     not null,
  item_id   text     not null,
  country   text     not null,
  bucket    smallint not null check (bucket between 0 and 39),
  n         integer  not null default 0,

  primary key (play_date, item_id, country, bucket)
);

-- One row per browser per day. Its only job is the primary key: an insert that
-- conflicts means this browser already counted, and the aggregate writes are
-- skipped. Nothing reads player_id back out.
create table if not exists crowd_submission (
  play_date  date not null,
  player_id  text not null,
  created_at timestamptz not null default now(),

  primary key (play_date, player_id)
);

create index if not exists crowd_day_lookup
  on crowd_day (play_date, item_id, country);

-- ===========================================================================
-- Classroom rooms
-- ===========================================================================

-- A room is a code and a date. Nothing else about it is worth storing: there is
-- no owner, no password and no membership list, because a teacher reading a code
-- off a whiteboard to thirty people is the access control, and anything stronger
-- would mean accounts.
create table if not exists room (
  code       text primary key,
  play_date  date not null,
  label      text not null default '',
  created_at timestamptz not null default now()
);

-- One entry per player per room per day.
--
-- `bid_usd` is the player's OPENING bid, and it is the number the board ranks
-- on. The Price Is Right's One Bid round is won by the closest bid that does not
-- go over, and running that on the first guess is what makes it a game show
-- rather than a leaderboard: everyone commits once, blind, and the board is the
-- reveal.
create table if not exists room_entry (
  code        text not null references room(code) on delete cascade,
  player_id   text not null,
  play_date   date not null,
  name        text not null,
  bid_usd     double precision not null,
  best_pct    integer not null,
  won         boolean not null default false,
  num_guesses smallint not null default 0,
  score       integer not null default 0,
  created_at  timestamptz not null default now(),

  primary key (code, player_id, play_date)
);

create index if not exists room_entry_board
  on room_entry (code, play_date);

-- ===========================================================================
-- Housekeeping
-- ===========================================================================
--
-- Submission rows are dead weight the moment the day rolls over, and rooms are
-- lesson-length. Run these on whatever schedule suits; nothing breaks if you
-- never do, but the classroom tables are the ones holding typed names, so
-- deleting them promptly is the point rather than an optimisation.
--
--   delete from crowd_submission where play_date < current_date - 7;
--   delete from room where created_at < now() - interval '30 days';
