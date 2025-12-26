/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'www.rack2cloud.com',
          port: '',
          pathname: '/wp-content/uploads/**',
        },
      ],
    },
  };
  
  export default nextConfig;