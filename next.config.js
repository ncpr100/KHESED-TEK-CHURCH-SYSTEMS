const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
    // Railway optimization: reduce memory usage during build
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    // Railway optimization: prevent image optimization timeouts
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Railway optimization: webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling issues with Prisma on Railway
      config.externals = [...(config.externals || []), '@prisma/client'];
    }
    
    // Reduce bundle size for Railway deployment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },
  // Railway optimization: compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Railway optimization: output file tracing
  outputFileTracing: true,
};

module.exports = nextConfig;
