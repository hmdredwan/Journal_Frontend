import type { NextConfig } from 'next';



const nextConfig: NextConfig = {
  //  output: 'export',
  //  allowedDevOrigins: [
  //   "http://192.168.0.108:3000",
  //   "http://localhost:3000",
  //   "http://127.0.0.1:3000"
  // ],
  // allowedDevOrigins: ["*"],

  images: {
    unoptimized: true,

    remotePatterns: [
      // Local dev (backend)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/media/**',     // ← changed or add this
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/media/**',
      },
      // Production (your live backend)
      {
        protocol: 'https',
        hostname: 'rri.websoftbd.net',
        pathname: '/media/**',
      },
      // If your API serves media under /api/media/ too
      {
        protocol: 'https',
        hostname: 'rri.websoftbd.net',
        pathname: '/api/media/**',
      },
    ],
  },

  // === Proxy media files through Next.js (fixes iframe "refused to connect") ===
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://127.0.0.1:8000/media/:path*',
      },
      {
        source: '/api/media/:path*',
        destination: 'http://127.0.0.1:8000/api/media/:path*',
      },
    ];
  },
  trailingSlash: true,

  
  reactStrictMode: true,
};

export default nextConfig;