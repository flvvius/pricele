import type { PriceEntry } from "@/lib/puzzle";
import type { GuessRecord } from "@/lib/storage";
import ShareCard from "./ShareCard";

interface Props {
  puzzleNumber: number;
  itemName: string;
  price: PriceEntry;
  guesses: GuessRecord[];
  won: boolean;
  streak: number;
  nextCountryName: string;
}

/** "You'd need to work N minutes to afford this" — the TIL hook (§5). */
function affordanceLine(price: PriceEntry): string {
  const minutes = (price.priceUSD / price.avgHourlyWageUSD) * 60;
  if (minutes < 1) {
    return `Under a minute of the average local wage buys one.`;
  }
  if (minutes < 90) {
    return `You'd need to work about ${Math.round(minutes)} minutes at the average local wage to afford one.`;
  }
  const hours = minutes / 60;
  return `You'd need to work about ${hours.toFixed(1)} hours at the average local wage to afford one.`;
}

function formatLocal(price: PriceEntry): string {
  const n = price.priceLocal.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  return `${n} ${price.localCurrency}`;
}

export default function Reveal({
  puzzleNumber,
  itemName,
  price,
  guesses,
  won,
  streak,
  nextCountryName,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-5 text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-400">
          Actual price
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          ${price.priceUSD.toFixed(2)}
        </p>
        <p className="text-neutral-400">{formatLocal(price)}</p>
        <p className="mt-3 text-sm text-neutral-300">{affordanceLine(price)}</p>
      </div>

      {won ? (
        <p className="text-center text-lg font-semibold text-green-400">
          Nice — got it in {guesses.length}/{5}. Streak: {streak} 🔥
        </p>
      ) : (
        <p className="text-center text-lg text-neutral-300">
          Out of guesses — the reveal&apos;s above. Closest you got was{" "}
          <span className="font-semibold">
            $
            {[...guesses]
              .sort(
                (a, b) =>
                  Math.abs(Math.log(a.value / price.priceUSD)) -
                  Math.abs(Math.log(b.value / price.priceUSD))
              )[0]
              ?.value.toFixed(2)}
          </span>
          .
        </p>
      )}

      <ShareCard
        puzzleNumber={puzzleNumber}
        itemName={itemName}
        countryName={price.countryName}
        flag={price.flag}
        guesses={guesses}
        won={won}
      />

      <p className="text-center text-sm text-neutral-500">
        Come back tomorrow for {nextCountryName}.
      </p>
    </div>
  );
}
