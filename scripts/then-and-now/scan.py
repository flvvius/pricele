import collections, sys, json
D = sys.argv[1]
items = {l.split('\t')[0].strip(): l.split('\t')[1].strip() for l in open(D + '/ap.item').read().splitlines()[1:]}
d = collections.defaultdict(lambda: collections.defaultdict(list))
for l in open(D + '/ap.data.0.Current').read().splitlines()[1:]:
    s, y, p, v, *_ = [x.strip() for x in l.split('\t')]
    if s.startswith('APU0000') and p.startswith('M') and p != 'M13':
        try:
            d[s[7:]][int(y)].append(float(v))
        except ValueError:
            pass
if len(sys.argv) > 2:
    out = {}
    for c in sys.argv[2].split(','):
        ys = d[c]
        out[c] = {"name": items[c], "years": {y: round(sum(v) / len(v), 2) for y, v in sorted(ys.items()) if len(v) >= 10}}
    print(json.dumps(out))
else:
    for c, ys in sorted(d.items()):
        yrs = sorted(y for y in ys if len(ys[y]) >= 10)
        if yrs and yrs[0] <= 1995 and yrs[-1] >= 2025 and len(yrs) >= 26:
            print(c, yrs[0], yrs[-1], len(yrs), items.get(c))
