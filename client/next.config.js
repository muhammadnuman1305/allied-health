// client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // add your real domains later; "localhost" won't exist on Vercel
    domains: [],
  },
  // no experimental flags
  // no custom distDir
  // no webpack overrides
  // no aliases/transpile for recharts
};

module.exports = nextConfig;
