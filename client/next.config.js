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
    // Fix for recharts SSR issues
    config.resolve.alias = {
      ...config.resolve.alias,
      recharts: require.resolve("recharts"),
    };
    return config;
  },
  // Transpile recharts for better compatibility
  transpilePackages: ["recharts"],
};

module.exports = nextConfig;
