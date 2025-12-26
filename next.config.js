/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.rack2cloud.com',
      },
    ],
  },
}

module.exports = nextConfig