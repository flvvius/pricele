// Reading a typed price on any keyboard.
//
// Half the players type "1,6" for one dollar sixty: a comma is the decimal
// separator across most of Europe and Latin America, and a phone set to one of
// those locales offers only a comma on its decimal keypad. Stripping commas as
// thousands separators turned that into 16, which is ten times the guess.
//
// So a comma is read as a decimal point unless it plainly groups thousands:
// "1,600" and "12,500,000" group, "1,6" and "4,99" are decimals. When both marks
// appear, whichever comes last is the decimal point ("1.234,56", "1,234.56").

/** Keep digits and separators only, so a stray "$" or space can't block typing. */
export function sanitizePrice(raw: string): string {
  return raw.replace(/[^0-9.,]/g, "").slice(0, 12);
}

// "1,600" groups; "0,500" is half a dollar written to three places.
function groupsThousands(groups: string[]): boolean {
  return /^[1-9]\d{0,2}$/.test(groups[0]) && groups.slice(1).every((g) => g.length === 3);
}

/** The typed figure as a number, or NaN when it doesn't read as a price. */
export function parsePrice(raw: string): number {
  let s = sanitizePrice(raw);
  if (!/\d/.test(s)) return NaN;
  const dot = s.lastIndexOf(".");
  const comma = s.lastIndexOf(",");
  if (dot !== -1 && comma !== -1) {
    const decimal = dot > comma ? "." : ",";
    const group = decimal === "." ? "," : ".";
    s = s.split(group).join("");
    if (decimal === ",") s = s.replace(",", ".");
  } else if (comma !== -1) {
    const groups = s.split(",");
    s = groupsThousands(groups) ? groups.join("") : groups.length === 2 ? groups.join(".") : "";
  } else if (dot !== -1 && s.indexOf(".") !== dot) {
    // "1.234.567" groups with dots; a single dot is always a decimal point.
    const groups = s.split(".");
    s = groupsThousands(groups) ? groups.join("") : "";
  }
  const n = Number(s);
  return s !== "" && Number.isFinite(n) ? n : NaN;
}
