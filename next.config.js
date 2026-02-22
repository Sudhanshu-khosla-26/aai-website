/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'output: export' removed — incompatible with Next.js API Routes (server-side)
  images: {
    domains: ['maps.googleapis.com', 'lh3.googleusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
};

module.exports = nextConfig;
