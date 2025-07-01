
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
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
    ],
  },
};

export default nextConfig;
