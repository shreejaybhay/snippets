/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }, images: {
    remotePatterns: [{
      protocol: 'https', hostname: 'i.postimg.cc'
    }, {
      protocol: 'https', hostname: 'i.pinimg.com'
    }]
  }
}

module.exports = nextConfig











