const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@projectmgmt/ui', '@projectmgmt/shared'],
  images: {
    domains: ['localhost'],
  },
  // Enable standalone output for Railway deployment
  output: 'standalone',
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Production optimizations
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  // Webpack configuration for path aliases
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path aliases for proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/store': path.resolve(__dirname, 'src/store'),
      '@projectmgmt/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@projectmgmt/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@projectmgmt/database': path.resolve(__dirname, '../../packages/database/src'),
    }
    
    return config
  },
}

module.exports = nextConfig