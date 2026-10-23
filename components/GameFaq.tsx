import Link from "next/link";
import JsonLd from "./JsonLd";
import { faqJsonLd } from "@/lib/seo";

interface GameQuestion {
  question: string;
  answer: string;
  link?: { phrase: string; href: string };
}

export function gameQuestions(name: string, description: string, source: string): GameQuestion[] {
  return [
    { question: `How do you play ${name}?`, answer: description },
    {
      question: `When does ${name} reset?`,
      answer: `A new ${name} puzzle starts at midnight in your own time zone. Everyone gets the same puzzle on the same date, so you can compare scores with friends.`,
    },
    {
      question: `Can I play yesterday's ${name}?`,
      answer: `Yes. The games archive replays every past ${name} puzzle. Archive plays are saved apart from today's game and never change your streak.`,
      link: { phrase: "games archive", href: "/games/archive" },
    },
    {
      question: `Where can I find past ${name} answers?`,
      answer: `The answers page lists every ${name} answer with the figures behind it. Each day goes up two days after it ends, so no puzzle that is still live anywhere gets spoiled.`,
      link: { phrase: "answers page", href: "/games/answers" },
    },
    {
      question: `Where do the ${name} numbers come from?`,
      answer: `${source}. Every figure is a published number with its source named on the page, and the methodology page lists each source and its licence.`,
      link: { phrase: "methodology page", href: "/methodology" },
    },
    {
      question: `Is ${name} free?`,
      answer:
        "Yes. There is no account, no download and no paywall. Your results stay in your own browser.",
    },
  ];
}

function Answer({ answer, link }: GameQuestion) {
  if (!link) return <>{answer}</>;
  const [before, after] = answer.split(link.phrase);
  return (
    <>
      {before}
      <Link
        href={link.href}
        className="underline decoration-rule underline-offset-2 hover:text-ink"
      >
        {link.phrase}
      </Link>
      {after}
    </>
  );
}

export default function GameFaq({
  name,
  description,
  source,
}: {
  name: string;
  description: string;
  source: string;
}) {
  const items = gameQuestions(name, description, source);
  return (
    <section
      aria-labelledby="game-faq"
      className="flex max-w-prose flex-col gap-3 text-[16px] leading-[1.7] text-ink-body"
    >
      <JsonLd data={faqJsonLd(items.map(({ question, answer }) => ({ question, answer })))} />
      <h2 id="game-faq" className="display text-[1.6rem] text-ink">
        Questions
      </h2>
      {items.map((item) => (
        <div key={item.question}>
          <h3 className="font-bold text-ink">{item.question}</h3>
          <p>
            <Answer {...item} />
          </p>
        </div>
      ))}
    </section>
  );
}
