const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  
  // Enhanced logging for Railway deployment
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  },

  // Custom webpack configuration for better Railway support
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Log build information for Railway debugging
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log('🚂 [RAILWAY-BUILD] Webpack configuration loaded', {
        buildId,
        dev,
        isServer,
        environment: process.env.RAILWAY_ENVIRONMENT
      });
    }

    // Optimize for Railway production builds
    if (!dev && isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },

  // Custom headers for better Railway logging
  async headers() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Railway-Environment',
              value: process.env.RAILWAY_ENVIRONMENT || 'unknown',
            },
            {
              key: 'X-Build-Version',
              value: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
            },
          ],
        },
      ];
    }
    return [];
  },

  // Better error handling for Railway
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
