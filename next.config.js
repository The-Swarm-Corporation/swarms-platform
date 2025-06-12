/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'epvxmjqxtlqhxrpcrldq.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'api.swarms.world',
            },
          ],
          destination: '/api/guard/api',
        },
        {
          source: '/api/v1/:path*',
          destination: '/api/guard/api',
        },
      ],
    };
  },
};

module.exports = nextConfig;
