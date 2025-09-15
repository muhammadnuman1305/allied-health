/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: "export" to support dynamic backend integration
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
