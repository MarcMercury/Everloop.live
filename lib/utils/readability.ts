// Readability and text analysis utilities

export interface ReadabilityMetrics {
  fleschKincaidGrade: number
  fleschReadingEase: number
  gunningFog: number
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  readabilityLevel: 'elementary' | 'middle-school' | 'high-school' | 'college' | 'graduate'
}

export interface SentenceMetrics {
  totalSentences: number
  shortSentences: number // < 10 words
  mediumSentences: number // 10-20 words
  longSentences: number // 20-30 words
  veryLongSentences: number // > 30 words
  averageLength: number
  longestSentence: number
  shortestSentence: number
  lengthVariance: number // Higher = more varied
}

/**
 * Count syllables in a word (English approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  
  // Remove silent e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

/**
 * Split text into sentences
 */
function getSentences(text: string): string[] {
  // Split on sentence-ending punctuation, but be careful with abbreviations
  return text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0 && /[a-zA-Z]/.test(s))
}

/**
 * Get words from text
 */
function getWords(text: string): string[] {
  return text
    .replace(/[^a-zA-Z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0)
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Lower = easier to read
 * 0-5: Elementary, 6-8: Middle School, 9-12: High School, 13-16: College, 16+: Graduate
 */
function fleschKincaidGrade(
  totalWords: number,
  totalSentences: number,
  totalSyllables: number
): number {
  if (totalSentences === 0 || totalWords === 0) return 0
  
  const grade = 
    0.39 * (totalWords / totalSentences) +
    11.8 * (totalSyllables / totalWords) -
    15.59
  
  return Math.max(0, Math.round(grade * 10) / 10)
}

/**
 * Calculate Flesch Reading Ease Score
 * 0-30: Very Difficult, 30-50: Difficult, 50-60: Fairly Difficult,
 * 60-70: Standard, 70-80: Fairly Easy, 80-90: Easy, 90-100: Very Easy
 */
function fleschReadingEase(
  totalWords: number,
  totalSentences: number,
  totalSyllables: number
): number {
  if (totalSentences === 0 || totalWords === 0) return 0
  
  const score =
    206.835 -
    1.015 * (totalWords / totalSentences) -
    84.6 * (totalSyllables / totalWords)
  
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10))
}

/**
 * Calculate Gunning Fog Index
 * Estimates years of formal education needed to understand text
 */
function gunningFogIndex(
  totalWords: number,
  totalSentences: number,
  complexWords: number
): number {
  if (totalSentences === 0 || totalWords === 0) return 0
  
  const index =
    0.4 * ((totalWords / totalSentences) + 100 * (complexWords / totalWords))
  
  return Math.round(index * 10) / 10
}

/**
 * Get readability level description
 */
function getReadabilityLevel(grade: number): ReadabilityMetrics['readabilityLevel'] {
  if (grade <= 5) return 'elementary'
  if (grade <= 8) return 'middle-school'
  if (grade <= 12) return 'high-school'
  if (grade <= 16) return 'college'
  return 'graduate'
}

/**
 * Calculate comprehensive readability metrics
 */
export function calculateReadabilityMetrics(text: string): ReadabilityMetrics {
  const sentences = getSentences(text)
  const words = getWords(text)
  
  const totalSentences = sentences.length
  const totalWords = words.length
  
  // Count syllables and complex words (3+ syllables)
  let totalSyllables = 0
  let complexWords = 0
  
  for (const word of words) {
    const syllables = countSyllables(word)
    totalSyllables += syllables
    if (syllables >= 3) complexWords++
  }
  
  const fkGrade = fleschKincaidGrade(totalWords, totalSentences, totalSyllables)
  const fkEase = fleschReadingEase(totalWords, totalSentences, totalSyllables)
  const fog = gunningFogIndex(totalWords, totalSentences, complexWords)
  
  return {
    fleschKincaidGrade: fkGrade,
    fleschReadingEase: fkEase,
    gunningFog: fog,
    averageWordsPerSentence: totalSentences > 0 
      ? Math.round((totalWords / totalSentences) * 10) / 10 
      : 0,
    averageSyllablesPerWord: totalWords > 0 
      ? Math.round((totalSyllables / totalWords) * 100) / 100 
      : 0,
    readabilityLevel: getReadabilityLevel(fkGrade),
  }
}

/**
 * Calculate sentence length distribution metrics
 */
export function calculateSentenceMetrics(text: string): SentenceMetrics {
  const sentences = getSentences(text)
  
  if (sentences.length === 0) {
    return {
      totalSentences: 0,
      shortSentences: 0,
      mediumSentences: 0,
      longSentences: 0,
      veryLongSentences: 0,
      averageLength: 0,
      longestSentence: 0,
      shortestSentence: 0,
      lengthVariance: 0,
    }
  }
  
  const lengths = sentences.map(s => getWords(s).length)
  
  let short = 0, medium = 0, long = 0, veryLong = 0
  
  for (const len of lengths) {
    if (len < 10) short++
    else if (len <= 20) medium++
    else if (len <= 30) long++
    else veryLong++
  }
  
  const total = lengths.reduce((a, b) => a + b, 0)
  const avg = total / lengths.length
  
  // Calculate variance for rhythm analysis
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length
  const normalizedVariance = Math.min(100, Math.round(Math.sqrt(variance) * 5))
  
  return {
    totalSentences: sentences.length,
    shortSentences: short,
    mediumSentences: medium,
    longSentences: long,
    veryLongSentences: veryLong,
    averageLength: Math.round(avg * 10) / 10,
    longestSentence: Math.max(...lengths),
    shortestSentence: Math.min(...lengths),
    lengthVariance: normalizedVariance,
  }
}

/**
 * Get a human-readable description of reading ease
 */
export function getReadingEaseDescription(score: number): string {
  if (score >= 90) return 'Very Easy'
  if (score >= 80) return 'Easy'
  if (score >= 70) return 'Fairly Easy'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  if (score >= 30) return 'Difficult'
  return 'Very Difficult'
}

/**
 * Get grade level as human-readable text
 */
export function getGradeLevelDescription(grade: number): string {
  if (grade <= 5) return `Grade ${Math.round(grade)} (Elementary)`
  if (grade <= 8) return `Grade ${Math.round(grade)} (Middle School)`
  if (grade <= 12) return `Grade ${Math.round(grade)} (High School)`
  if (grade <= 16) return `Year ${Math.round(grade - 12)} (College)`
  return 'Graduate Level'
}
