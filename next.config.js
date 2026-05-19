/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/dist/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
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
      { source: '/demo', destination: '/demo/dashboard/acme', permanent: false },
      // Legacy Vite URL compat (with or without .html)
      { source: '/dashboard/acme(.html)?', destination: '/demo/dashboard/acme', permanent: true },
      { source: '/dashboard/sales(.html)?', destination: '/demo/dashboard/sales', permanent: true },
      { source: '/dashboard/finance(.html)?', destination: '/demo/dashboard/finance', permanent: true },
      { source: '/dashboard/hr(.html)?', destination: '/demo/dashboard/hr', permanent: true },
      { source: '/slide/weekly-report(.html)?', destination: '/demo/slide/weekly', permanent: true },
      { source: '/slide/pitch-deck(.html)?', destination: '/demo/slide/pitch', permanent: true },
      { source: '/slide/proposal(.html)?', destination: '/demo/slide/proposal', permanent: true },
      { source: '/slide/strategy(.html)?', destination: '/demo/slide/strategy', permanent: true },
      { source: '/slide/ecommerce(.html)?', destination: '/demo/slide/ecommerce', permanent: true },
      { source: '/components.html', destination: '/components', permanent: true },
      { source: '/stack.html', destination: '/stack', permanent: true },
      { source: '/sales-dashboard', destination: '/demo/dashboard/sales', permanent: true },
    ];
  },
};

export default nextConfig;
