import Game from "@/components/Game";

// Statically generated (SSG): this renders to real HTML at build time for SEO,
// then <Game/> hydrates and takes over client-side.
export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight">Pricele</h1>
        <p className="text-sm text-neutral-400">
          Guess the price. New country daily.
        </p>
      </div>

      <Game />

      <footer className="mt-auto pt-8 text-center text-xs text-neutral-600">
        Prices are estimates for a fun daily puzzle — not shopping advice.
      </footer>
    </main>
  );
}
