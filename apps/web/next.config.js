/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@projectmgmt/ui', '@projectmgmt/shared'],
  images: {
    domains: ['localhost'],
  },
  // Enable standalone output for Vercel deployment
  output: 'standalone',
  // Optimize for Vercel edge functions
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Vercel-specific optimizations
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
}

module.exports = nextConfig