/** @type {import('next').NextConfig} */
const nextConfig = {
  // The lore agent reads these hand-authored lore books from disk at runtime.
  outputFileTracingIncludes: {
    '/**': [
      './app/stories/narrative-history/page.tsx',
      './app/stories/four-loops-of-curiosities/page.tsx',
      './app/stories/known-wonders-of-the-everloop/page.tsx',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // Quest Unification (2026-05-22): the Everloop is now quest-based only.
      // The legacy /campaigns* URLs redirect to /quests* permanently. Internal
      // DB tables still use the `campaigns*` prefix pending the rename
      // migration in supabase/migrations/PENDING_quest_rename.sql.
      { source: '/campaigns', destination: '/quests', permanent: true },
      { source: '/campaigns/:path*', destination: '/quests/:path*', permanent: true },
      { source: '/create/monster/campaign', destination: '/create/monster/quest', permanent: true },
    ]
  },
}

export default nextConfig
