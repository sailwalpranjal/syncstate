/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to prevent Y.js duplicate room errors in development
  reactStrictMode: false,

  // Reduce unnecessary re-compilations
  webpack: (config, { dev }) => {
    if (dev) {
      // Ignore certain file changes that shouldn't trigger rebuilds
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },

  // Suppress noisy warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
