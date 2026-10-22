# Generate data/rent-ratio.ts from the file fetch.py wrote:
#   python3 -I gen.py <outdir>/fmr_fy2026.json > data/rent-ratio.ts
import json, sys

rows = {r["FMR_CODE"]: r for r in json.load(open(sys.argv[1]))}
# HUD FMR area code suffix -> (slug, display name). Display names are short
# labels for the HUD area; the HUD area name is kept for the citation.
PICK = {
    "MM7360": ("san-francisco", "San Francisco, CA"),
    "M41940": ("san-jose", "San Jose, CA"),
    "MM5945": ("orange-county", "Santa Ana-Anaheim-Irvine, CA"),
    "METRO14460MM1120": ("boston", "Boston, MA"),
    "MM5775": ("oakland", "Oakland, CA"),
    "MM5600": ("new-york", "New York, NY"),
    "MM4480": ("los-angeles", "Los Angeles, CA"),
    "MM7600": ("seattle", "Seattle, WA"),
    "MM5000": ("miami", "Miami, FL"),
    "M40900": ("sacramento", "Sacramento, CA"),
    "M47900": ("washington", "Washington, DC"),
    "M19100": ("dallas", "Dallas, TX"),
    "M39900": ("reno", "Reno, NV"),
    "M12060": ("atlanta", "Atlanta, GA"),
    "M16980": ("chicago", "Chicago, IL"),
    "M41620": ("salt-lake-city", "Salt Lake City, UT"),
    "M17820": ("colorado-springs", "Colorado Springs, CO"),
    "M34980": ("nashville", "Nashville, TN"),
    "M39300": ("providence", "Providence, RI"),
    "M47260": ("virginia-beach", "Virginia Beach-Norfolk, VA"),
    "M20500": ("durham", "Durham-Chapel Hill, NC"),
    "M33460": ("minneapolis", "Minneapolis-St. Paul, MN"),
    "M31540": ("madison", "Madison, WI"),
    "M16740": ("charlotte", "Charlotte, NC"),
    "M23420": ("fresno", "Fresno, CA"),
    "M27260": ("jacksonville", "Jacksonville, FL"),
    "M14260": ("boise", "Boise, ID"),
    "M40060": ("richmond", "Richmond, VA"),
    "M11260": ("anchorage", "Anchorage, AK"),
    "M26420": ("houston", "Houston, TX"),
    "M26900": ("indianapolis", "Indianapolis, IN"),
    "M18140": ("columbus", "Columbus, OH"),
    "M41700": ("san-antonio", "San Antonio, TX"),
    "M19820": ("detroit", "Detroit, MI"),
    "M36540": ("omaha", "Omaha, NE"),
    "M28140": ("kansas-city", "Kansas City, MO"),
    "M17140": ("cincinnati", "Cincinnati, OH"),
    "M35380": ("new-orleans", "New Orleans, LA"),
    "M19780": ("des-moines", "Des Moines, IA"),
    "M38300": ("pittsburgh", "Pittsburgh, PA"),
    "N17460": ("cleveland", "Cleveland, OH"),
    "M32820": ("memphis", "Memphis, TN"),
    "M31140": ("louisville", "Louisville, KY"),
    "M13820": ("birmingham", "Birmingham, AL"),
    "M36420": ("oklahoma-city", "Oklahoma City, OK"),
    "M41180": ("st-louis", "St. Louis, MO"),
    "M21340": ("el-paso", "El Paso, TX"),
    "M41740": ("san-diego", "San Diego, CA"),
    "M46520": ("honolulu", "Honolulu, HI"),
    "M19740": ("denver", "Denver, CO"),
    "M45300": ("tampa", "Tampa, FL"),
    "M36740": ("orlando", "Orlando, FL"),
    "M38900": ("portland", "Portland, OR"),
    "M12580": ("baltimore", "Baltimore, MD"),
    "M12420": ("austin", "Austin, TX"),
    "M38060": ("phoenix", "Phoenix, AZ"),
    "M37980": ("philadelphia", "Philadelphia, PA"),
    "M39580": ("raleigh", "Raleigh, NC"),
    "M29820": ("las-vegas", "Las Vegas, NV"),
    "M40140": ("riverside", "Riverside-San Bernardino, CA"),
    "M10740": ("albuquerque", "Albuquerque, NM"),
    "M46060": ("tucson", "Tucson, AZ"),
    "M33340": ("milwaukee", "Milwaukee, WI"),
    "M15380": ("buffalo", "Buffalo, NY"),
    "M16700": ("charleston", "Charleston, SC"),
}
out = []
for suffix, (slug, name) in PICK.items():
    # Key is a full FMR_CODE, or a unique suffix of one.
    hits = [r for c, r in rows.items() if c == suffix or (not suffix.startswith("METRO") and c.endswith(suffix))]
    assert len(hits) == 1, (suffix, [h["FMR_AREANAME"] for h in hits])
    r = hits[0]
    out.append({"id": slug, "name": name, "hudArea": r["FMR_AREANAME"].replace("  ", " ").strip(),
                "code": r["FMR_CODE"],
                "fmr": [r["FMR_0BDR"], r["FMR_1BDR"], r["FMR_2BDR"], r["FMR_3BDR"], r["FMR_4BDR"]]})
print("// GENERATED from HUD FY2026 Fair Market Rents (area level), HUD PDR feature service")
print("// https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Fair_Market_Rents/FeatureServer/0")
print("// (\"Date of Coverage: FY2026\"), fetched 2026-10-22 by scripts/rent-ratio/fetch.py.")
print("// HUD data is a U.S. federal government work and in the public domain.")
print("// fmr = monthly fair market rent in USD for [0BR, 1BR, 2BR, 3BR, 4BR]. Do not hand-edit numbers.")
print("import type { RentArea } from \"@/lib/rentratio\";\n")
print("export const RENT_AREAS: RentArea[] = " + json.dumps(out, indent=2) + ";")
