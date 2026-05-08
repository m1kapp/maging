/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/dist/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/docs', destination: '/llms.txt', permanent: false },
      { source: '/demo', destination: '/demo/dashboard/acme', permanent: true },
      // Legacy URL compat
      { source: '/dashboard/acme', destination: '/demo/dashboard/acme', permanent: true },
      { source: '/dashboard/sales', destination: '/demo/dashboard/sales', permanent: true },
      { source: '/landing/startup', destination: '/demo/landing/startup', permanent: true },
    ];
  },
};

export default nextConfig;
