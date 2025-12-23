// Writing stats formatting utilities

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function formatWordCount(words: number): string {
  if (words < 1000) return words.toString()
  if (words < 10000) return `${(words / 1000).toFixed(1)}k`
  return `${Math.round(words / 1000)}k`
}
