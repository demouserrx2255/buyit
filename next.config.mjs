/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  typescript: {
    // Temporarily ignore type errors during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Disable some experimental features that might cause issues
    forceSwcTransforms: true,
  },
};

export default nextConfig;
