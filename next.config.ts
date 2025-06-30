
import type {NextConfig} from 'next';

const remotePatterns: NextConfig['images']['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
];

// Add Supabase storage hostname if the URL is set
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    remotePatterns.push({
      protocol: 'https',
      hostname: supabaseHostname,
      port: '',
      pathname: '/storage/v1/object/public/health-posts-images/**',
    });
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL in next.config.js:', error);
  }
}

const nextConfig: NextConfig = {
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

export default nextConfig;
