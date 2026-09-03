import type { Metadata } from "next";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import ClassroomSetup from "@/components/ClassroomSetup";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/classroom",
  title: "Classroom",
  description:
    "Play Pricele as a class. One code, no accounts, no sign-up. Everyone guesses today's price and the board shows the spread, scored on the old game-show rule: closest without going over.",
});

/**
 * The page teachers land on, and the one that most needs to survive being read
 * on a projector at the back of a room.
 *
 * Statically rendered except for the form, because the copy below it is the part
 * that has to rank: "daily game for the classroom" is the search a teacher
 * actually makes, and no amount of game code answers it.
 */
export default function ClassroomPage() {
  return (
    <ContentPage
      title="Play it as a class"
      intro={
        <p>
          One code, no accounts, no sign-up, nothing to install. You open a room,
          read the code out, and everyone plays today&apos;s puzzle on their own
          phone. The board shows the whole spread of guesses.
        </p>
      }
    >
      <ClassroomSetup />

      <Section heading="How the board works">
        <Prose>
          <p>
            It is scored on The Price Is Right&apos;s One Bid rule, which is
            fifty years old and which everybody&apos;s parents already know:{" "}
            <strong className="font-semibold text-ink">
              closest without going over
            </strong>
            . Everyone&apos;s opening guess is their bid. They commit once,
            blind, and the board is the reveal.
          </p>
          <p>
            A room where every single bid went over has no winner at all. That
            happens more often than you would expect, and it is the best moment
            the mode produces: the entire class assumed something cost more than
            it does, and the board is the proof.
          </p>
          <p>
            Nobody sees the board until they have bid, including you. A room full
            of guesses brackets the real price between the highest bid under it
            and the lowest bid over it, and with thirty students that bracket is
            tight enough to be the answer. So play first, then project it.
          </p>
        </Prose>
      </Section>

      <Section heading="What it is good for">
        <Prose>
          <p>
            The spread is the lesson, not the answer. Ask why the guesses
            clustered where they did before you show the real figure, and you
            have a discussion about exchange rates, wages and what people assume
            about a country they have never been to.
          </p>
          <p>
            Three questions that work on almost any day&apos;s puzzle. Why would
            this cost more here than at home? Who decides that price, a market or
            a government? And how long would someone there work to buy one, which
            is the figure the reveal gives you and the only one that needs no
            exchange rate to understand.
          </p>
          <p>
            Every price in the game names its source, and the{" "}
            <a
              href="/methodology"
              className="underline underline-offset-2 hover:text-ink"
            >
              methodology page
            </a>{" "}
            says plainly which numbers are solid and which are ballpark. That is
            worth showing a class too.
          </p>
        </Prose>
      </Section>

      <Section heading="What we store">
        <Prose>
          <p>
            A room is a four-character code and a date. There is no roster, no
            email address, no password and no account. The board holds the
            display name each person typed and that day&apos;s bids, and rooms
            are deleted on a timer.
          </p>
          <p>
            Names are typed by students and shown to the room. There is no
            profanity filter, deliberately: a word list would fail at policing
            thirty teenagers across every language this site is read in, and
            would break real names while failing. You can see the whole board,
            and a room lasts one lesson.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
