import type { MetadataRoute } from 'next'
import { PROFESSIONS } from '@/lib/professions'

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = 'https://resumerocket.co'

  const corePages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const professionPages: MetadataRoute.Sitemap = PROFESSIONS.map(p => ({
    url: `${BASE_URL}/resume-builder/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...corePages, ...professionPages]
}
