const withPWA = require('@ducanh2912/next-pwa').default({
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
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
  },
  async headers() {
    const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname 
      : 'pooariitfzfacjafwkkp.supabase.co';

    // Note: 'unsafe-eval' is required for Next.js in development mode.
    // 'unsafe-inline' is needed for next-themes and some UI libraries.
    // For a production build, these could be tightened using a nonce with middleware.
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https://placehold.co', `https://${supabaseHostname}`],
      'connect-src': ["'self'", `https://${supabaseHostname}`, `wss://${supabaseHostname}`],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    };

    const csp = Object.entries(cspDirectives)
      .map(([key, value]) => `${key} ${value.join(' ')}`)
      .join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};


module.exports = withPWA(nextConfig);
