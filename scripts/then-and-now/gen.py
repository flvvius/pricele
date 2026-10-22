import json, sys
src = json.load(open(sys.argv[1]))
labels = {
    "708111": ("eggs", "A dozen large eggs", "per dozen, grade A large"),
    "702111": ("white-bread", "A pound of white bread", "per lb, white pan bread"),
    "74714": ("gasoline", "A gallon of regular gas", "per gallon, unleaded regular"),
    "703112": ("ground-beef", "A pound of ground beef", "per lb, 100% beef"),
    "704111": ("bacon", "A pound of sliced bacon", "per lb, sliced"),
    "711211": ("bananas", "A pound of bananas", "per lb"),
    "710212": ("cheddar", "A pound of cheddar", "per lb, natural cheddar"),
    "710411": ("ice-cream", "A half gallon of ice cream", "per 1/2 gal, prepackaged regular"),
    "717311": ("coffee", "A pound of ground coffee", "per lb, 100% ground roast"),
    "718311": ("potato-chips", "A 16 oz bag of potato chips", "per 16 oz"),
    "706111": ("whole-chicken", "A pound of whole chicken", "per lb, fresh whole"),
    "702421": ("cookies", "A pound of chocolate chip cookies", "per lb"),
    "712311": ("tomatoes", "A pound of tomatoes", "per lb, field grown"),
    "715211": ("sugar", "A pound of white sugar", "per lb"),
    "713111": ("orange-juice", "Frozen orange juice concentrate", "per 16 oz, 12 oz can basis"),
}
out = []
for code, (slug, name, unit) in labels.items():
    s = src[code]
    out.append({"id": slug, "name": name, "unit": unit, "blsItem": s["name"],
                "series": "APU0000" + code,
                "prices": {int(y): v for y, v in s["years"].items()}})
print("// GENERATED from BLS Average Price Data (series APU0000*, U.S. city average),")
print("// file https://download.bls.gov/pub/time.series/ap/ap.data.0.Current, fetched 2026-10-22.")
print("// Each value is the mean of the monthly averages published for that calendar year")
print("// (years with fewer than 10 published months are left out). BLS data is a U.S.")
print("// federal government work and in the public domain. Do not hand-edit numbers.")
print("import type { ThenNowItem } from \"@/lib/thenandnow\";\n")
print("export const THEN_NOW_ITEMS: ThenNowItem[] = " + json.dumps(out, indent=2) + ";")
