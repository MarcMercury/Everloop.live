import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Canonical story statuses surfaced to the public library.
 * A story is publicly visible only when canon_status === 'canonical'
 * AND is_published === true. The intermediate `approved` state is no
 * longer used as a destination — admin approval writes `canonical`
 * directly (see lib/actions/admin.ts:approveStory).
 *
 * Valid story_canon_status enum values:
 *   draft, submitted, under_review, revision_requested, rejected, canonical
 *   (legacy: approved — kept for backwards compatibility, never written)
 */
export const CANON_STORY_STATUSES = ['canonical'] as const

/**
 * Human-readable label for a story's canon_status. Used by the
 * dashboard, write client and admin views so terminology stays
 * consistent across the app.
 */
export function getStoryStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'submitted':
      return 'Submitted for Review'
    case 'under_review':
      return 'Under Review'
    case 'revision_requested':
      return 'Revisions Requested'
    case 'approved':
      // Legacy state — surfaced as Published for any pre-existing rows.
      return 'Published'
    case 'rejected':
      return 'Rejected'
    case 'canonical':
      return 'Published'
    default:
      return status
  }
}

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Calculates reading time based on word count
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Generates a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
