// Server-rendered footer. Deliberately does not link out to any per-country
// price listing — those were removed so players can't look up the day's answer.
export default function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-3 pt-10 text-xs text-neutral-500">
      <p className="text-center">
        Prices are rough estimates for a daily game, not shopping advice.
      </p>
    </footer>
  );
}
