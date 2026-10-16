/**
 * Large static media (maps, 3D terrain, audio, covers, game art, book PDFs)
 * lives in the public Supabase Storage bucket `site-assets` instead of git.
 * Paths mirror the old `public/` layout, so `/Maps/x.png` → `assetUrl('/Maps/x.png')`.
 * next.config.mjs also redirects the old `/Maps/*`-style URLs for stale links.
 */
export const ASSET_BUCKET = 'site-assets'

export function assetBaseUrl(): string {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
  return `${supabaseUrl}/storage/v1/object/public/${ASSET_BUCKET}`
}

export function assetUrl(path: string): string {
  const encoded = path
    .replace(/^\//, '')
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')
  return `${assetBaseUrl()}/${encoded}`
}
