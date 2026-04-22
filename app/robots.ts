import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/order/result', '/api/'],
      },
    ],
    sitemap: 'https://resumerocket.co/sitemap.xml',
  }
}
