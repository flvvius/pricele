# Download HUD FY2026 Fair Market Rents (area level) from HUD's official ArcGIS
# feature service into a scratch dir:  python3 -I fetch.py <outdir>
# (The huduser.gov xlsx sits behind a bot challenge; this layer is the same
# data, published by HUD PDR with "Date of Coverage: FY2026".)
import json, sys, urllib.request, urllib.parse

U = ("https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/"
     "Fair_Market_Rents/FeatureServer/0/query")
rows, off = [], 0
while True:
    q = urllib.parse.urlencode({
        "where": "1=1",
        "outFields": "FMR_CODE,FMR_AREANAME,FMR_0BDR,FMR_1BDR,FMR_2BDR,FMR_3BDR,FMR_4BDR",
        "returnGeometry": "false", "orderByFields": "OBJECTID",
        "resultOffset": off, "resultRecordCount": 1000, "f": "json"})
    d = json.load(urllib.request.urlopen(U + "?" + q))
    rows += [f["attributes"] for f in d["features"]]
    off += len(d["features"])
    if not d.get("exceededTransferLimit"):
        break
json.dump(rows, open(sys.argv[1] + "/fmr_fy2026.json", "w"))
print(len(rows), "areas")
