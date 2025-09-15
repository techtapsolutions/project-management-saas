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
}

module.exports = nextConfig