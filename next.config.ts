const withPWA = require('@ducanh2912/next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: ({ url }) => {
        return url.origin.startsWith('https://') && url.hostname.endsWith('supabase.co');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-data-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'pooariitfzfacjafwkkp.supabase.co',
    port: '',
    pathname: '/storage/v1/object/public/health-posts-images/**',
  },
];

// Add Supabase storage hostname if the URL is set
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    if (supabaseHostname !== 'pooariitfzfacjafwkkp.supabase.co') {
        remotePatterns.push({
          protocol: 'https',
          hostname: supabaseHostname,
          port: '',
          pathname: '/storage/v1/object/public/health-posts-images/**',
        });
    }
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL in next.config.js:', error);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
  },
};


module.exports = withPWA(nextConfig);
