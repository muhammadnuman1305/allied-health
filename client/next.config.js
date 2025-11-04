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
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    // Fix for recharts SSR issues
    config.resolve.alias = {
      ...config.resolve.alias,
      recharts: require.resolve("recharts"),
    };

    // Ensure client reference manifest is generated correctly
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
      };
    }

    return config;
  },
  // Transpile recharts for better compatibility
  transpilePackages: ["recharts"],
  // Ensure proper output directory
  distDir: ".next",
};

module.exports = nextConfig;
