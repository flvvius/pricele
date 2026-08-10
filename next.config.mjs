/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pinned rather than left to the default. Every canonical, sitemap entry and
  // internal link on the site is written without a trailing slash; flipping
  // this would make /about and /about/ both resolvable and turn the whole
  // sitemap into redirects, which is the shape of bug this codebase has already
  // paid for once.
  trailingSlash: false,
};

export default nextConfig;
