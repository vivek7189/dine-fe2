/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
  env: {
    // STAGING BRANCH: Hardcoded staging backend URL (removed env var to prevent override)
    NEXT_PUBLIC_API_URL: 'https://dine-backend-git-staging-kapils-projects-bfc8fbae.vercel.app',
  },
  // Ensure proper handling of client-side features
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
