const KEY = "cc3d16b06a13ea4a25b6cc50fece9703";
const HOST = process.env.INDEXNOW_HOST ?? "www.pricele.online";

const sitemap = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const only = process.argv.slice(2);
const urlList = only.length ? urls.filter((u) => only.some((p) => u.includes(p))) : urls;

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});
console.log(`IndexNow: ${res.status} for ${urlList.length} URLs`);
