/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: '/:path*\\.(:ext(js|css|woff|woff2|ttf|otf|ico|png|jpg|jpeg|svg|webp))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache HTML pages for 5 minutes, allow stale while revalidating
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
}
module.exports = nextConfig
