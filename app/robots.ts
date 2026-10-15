import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://everloop.live').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/dashboard', '/write', '/settings', '/quests', '/player-deck', '/roster', '/create', '/auth', '/welcome'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
