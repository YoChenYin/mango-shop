/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    isrMemoryCacheSize: 0,
  },
  serverExternalPackages: ['nodemailer'],
};

module.exports = nextConfig;
