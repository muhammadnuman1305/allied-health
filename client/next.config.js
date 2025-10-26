/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for stability
  experimental: {
    // Disable experimental features that might cause issues
    memoryBasedWorkersCount: false,
  },
  // Optimize images
  images: {
    domains: ["localhost"],
  },
  // Ensure proper module resolution
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
