'use server'

import { createClient } from '@/lib/supabase/server'
import { type JSONContent } from '@/components/editor/tiptap-editor'
import { type Chapter } from './chapters'

// Export format types
export type ExportFormat = 'pdf' | 'epub' | 'markdown' | 'txt' | 'html'

export interface ExportOptions {
  storyId: string
  format: ExportFormat
  includeTitle?: boolean
  includeChapterTitles?: boolean
  includeMetadata?: boolean
  chapterId?: string // For single chapter export
}

export interface ExportResult {
  success: boolean
  content?: string
  filename?: string
  mimeType?: string
  error?: string
}

/**
 * Convert TipTap JSON content to plain text
 */
function jsonToText(content: JSONContent | null): string {
  if (!content) return ''
  
  let text = ''
  
  function traverse(node: JSONContent) {
    if (node.type === 'text' && node.text) {
      text += node.text
    }
    
    if (node.type === 'paragraph' || node.type === 'heading') {
      if (node.content) {
        node.content.forEach(traverse)
      }
      text += '\n\n'
    } else if (node.type === 'hardBreak') {
      text += '\n'
    } else if (node.content) {
      node.content.forEach(traverse)
    }
  }
  
  if (content.content) {
    content.content.forEach(traverse)
  }
  
  return text.trim()
}

/**
 * Convert TipTap JSON content to Markdown
 */
function jsonToMarkdown(content: JSONContent | null): string {
  if (!content) return ''
  
  let markdown = ''
  
  function traverse(node: JSONContent, depth = 0) {
    if (node.type === 'text') {
      let text = node.text || ''
      
      // Apply marks
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `**${text}**`
          } else if (mark.type === 'italic') {
            text = `*${text}*`
          } else if (mark.type === 'strike') {
            text = `~~${text}~~`
          } else if (mark.type === 'code') {
            text = `\`${text}\``
          } else if (mark.type === 'link' && mark.attrs?.href) {
            text = `[${text}](${mark.attrs.href})`
          }
        }
      }
      
      markdown += text
    }
    
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1
      markdown += '#'.repeat(level) + ' '
      if (node.content) {
        node.content.forEach(child => traverse(child, depth))
      }
      markdown += '\n\n'
    } else if (node.type === 'paragraph') {
      if (node.content) {
        node.content.forEach(child => traverse(child, depth))
      }
      markdown += '\n\n'
    } else if (node.type === 'bulletList') {
      if (node.content) {
        node.content.forEach(child => traverse(child, depth))
      }
    } else if (node.type === 'orderedList') {
      if (node.content) {
        node.content.forEach((child, i) => {
          markdown += `${i + 1}. `
          if (child.content) {
            child.content.forEach(c => traverse(c, depth + 1))
          }
        })
      }
    } else if (node.type === 'listItem') {
      markdown += '- '
      if (node.content) {
        node.content.forEach(child => traverse(child, depth + 1))
      }
    } else if (node.type === 'blockquote') {
      markdown += '> '
      if (node.content) {
        node.content.forEach(child => traverse(child, depth))
      }
    } else if (node.type === 'codeBlock') {
      const lang = node.attrs?.language || ''
      markdown += '```' + lang + '\n'
      if (node.content) {
        node.content.forEach(child => traverse(child, depth))
      }
      markdown += '\n```\n\n'
    } else if (node.type === 'horizontalRule') {
      markdown += '\n---\n\n'
    } else if (node.type === 'hardBreak') {
      markdown += '  \n'
    } else if (node.content) {
      node.content.forEach(child => traverse(child, depth))
    }
  }
  
  if (content.content) {
    content.content.forEach(node => traverse(node))
  }
  
  return markdown.trim()
}

/**
 * Convert TipTap JSON content to styled HTML
 */
function jsonToHtml(content: JSONContent | null, title?: string): string {
  if (!content) return ''
  
  let html = ''
  
  function traverse(node: JSONContent) {
    if (node.type === 'text') {
      let text = escapeHtml(node.text || '')
      
      // Apply marks
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `<strong>${text}</strong>`
          } else if (mark.type === 'italic') {
            text = `<em>${text}</em>`
          } else if (mark.type === 'strike') {
            text = `<del>${text}</del>`
          } else if (mark.type === 'code') {
            text = `<code>${text}</code>`
          } else if (mark.type === 'underline') {
            text = `<u>${text}</u>`
          } else if (mark.type === 'link' && mark.attrs?.href) {
            text = `<a href="${escapeHtml(mark.attrs.href)}">${text}</a>`
          }
        }
      }
      
      html += text
    }
    
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1
      html += `<h${level}>`
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += `</h${level}>\n`
    } else if (node.type === 'paragraph') {
      html += '<p>'
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</p>\n'
    } else if (node.type === 'bulletList') {
      html += '<ul>\n'
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</ul>\n'
    } else if (node.type === 'orderedList') {
      html += '<ol>\n'
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</ol>\n'
    } else if (node.type === 'listItem') {
      html += '<li>'
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</li>\n'
    } else if (node.type === 'blockquote') {
      html += '<blockquote>'
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</blockquote>\n'
    } else if (node.type === 'codeBlock') {
      const lang = node.attrs?.language || ''
      html += `<pre><code class="language-${lang}">`
      if (node.content) {
        node.content.forEach(traverse)
      }
      html += '</code></pre>\n'
    } else if (node.type === 'horizontalRule') {
      html += '<hr />\n'
    } else if (node.type === 'hardBreak') {
      html += '<br />\n'
    } else if (node.content) {
      node.content.forEach(traverse)
    }
  }
  
  if (content.content) {
    content.content.forEach(traverse)
  }
  
  // Wrap in styled document
  const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || 'Everloop Story')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Crimson Pro', Georgia, serif;
      line-height: 1.8;
      color: #2c2c2c;
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem;
      background: #faf8f5;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin: 2rem 0 1rem;
      line-height: 1.3;
      color: #1a1a1a;
    }
    
    h1 { font-size: 2.5rem; text-align: center; margin-bottom: 2rem; }
    h2 { font-size: 1.8rem; border-bottom: 1px solid #d4af37; padding-bottom: 0.5rem; }
    h3 { font-size: 1.4rem; }
    
    p {
      margin: 1rem 0;
      text-align: justify;
      text-indent: 1.5rem;
    }
    
    p:first-of-type {
      text-indent: 0;
    }
    
    p:first-of-type::first-letter {
      font-size: 3rem;
      float: left;
      line-height: 1;
      margin-right: 0.5rem;
      color: #d4af37;
    }
    
    blockquote {
      margin: 1.5rem 2rem;
      padding-left: 1rem;
      border-left: 3px solid #d4af37;
      font-style: italic;
      color: #555;
    }
    
    hr {
      margin: 2rem auto;
      width: 50%;
      border: none;
      border-top: 1px solid #d4af37;
    }
    
    code {
      font-family: 'Courier New', monospace;
      background: #f0ede8;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }
    
    pre {
      background: #2c2c2c;
      color: #f0ede8;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    ul, ol {
      margin: 1rem 0 1rem 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    a {
      color: #d4af37;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .metadata {
      text-align: center;
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 3rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 1rem;
    }
    
    .chapter-break {
      text-align: center;
      margin: 3rem 0;
      font-size: 1.5rem;
      color: #d4af37;
    }
  </style>
</head>
<body>
  ${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
  ${html}
</body>
</html>`
  
  return styledHtml
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate EPUB content (simplified - returns HTML that can be converted)
 */
function generateEpubHtml(title: string, content: JSONContent | null, author?: string): string {
  const bodyHtml = content ? jsonToHtml(content, title) : ''
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Georgia, serif;
      line-height: 1.6;
      margin: 1em;
    }
    h1 { text-align: center; margin-bottom: 2em; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    p:first-of-type { text-indent: 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${author ? `<p style="text-align: center; font-style: italic;">by ${escapeHtml(author)}</p>` : ''}
  <hr/>
  ${bodyHtml}
</body>
</html>`
}

/**
 * Export a story in the specified format
 */
export async function exportStory(options: ExportOptions): Promise<ExportResult> {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }
  
  // Fetch the story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      content_text,
      author_id,
      scope,
      word_count,
      created_at,
      author:profiles!stories_author_id_fkey(username, display_name)
    `)
    .eq('id', options.storyId)
    .single() as {
      data: {
        id: string
        title: string | null
        content: JSONContent | null
        content_text: string | null
        author_id: string
        scope: string
        word_count: number | null
        created_at: string
        author: { username: string; display_name: string | null } | null
      } | null
      error: Error | null
    }
  
  if (storyError || !story) {
    return { success: false, error: 'Story not found' }
  }
  
  // Check access (author or collaborator)
  if (story.author_id !== user.id) {
    const { data: collab } = await supabase
      .from('story_collaborators')
      .select('role')
      .eq('story_id', options.storyId)
      .eq('user_id', user.id)
      .single()
    
    if (!collab) {
      return { success: false, error: 'Access denied' }
    }
  }
  
  const title = story.title || 'Untitled Story'
  const authorName = story.author?.display_name || story.author?.username || 'Unknown Author'
  const content = story.content as JSONContent
  
  // For Tomes, we might need to fetch chapters
  let chapters: Chapter[] = []
  if (story.scope === 'tome' && !options.chapterId) {
    const { data: chapterData } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', options.storyId)
      .order('chapter_order', { ascending: true })
    
    chapters = (chapterData || []) as Chapter[]
  }
  
  let exportContent = ''
  let filename = ''
  let mimeType = ''
  
  const safeTitle = title.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase()
  
  switch (options.format) {
    case 'txt':
      if (chapters.length > 0) {
        exportContent = chapters.map((ch, i) => {
          const chapterContent = jsonToText(ch.content as JSONContent)
          return `${'='.repeat(50)}\n${ch.title || `Chapter ${i + 1}`}\n${'='.repeat(50)}\n\n${chapterContent}`
        }).join('\n\n\n')
        
        if (options.includeTitle) {
          exportContent = `${title}\nby ${authorName}\n\n${'='.repeat(50)}\n\n${exportContent}`
        }
      } else {
        exportContent = jsonToText(content)
        if (options.includeTitle) {
          exportContent = `${title}\nby ${authorName}\n\n${'='.repeat(50)}\n\n${exportContent}`
        }
      }
      filename = `${safeTitle}.txt`
      mimeType = 'text/plain'
      break
      
    case 'markdown':
      if (chapters.length > 0) {
        exportContent = chapters.map((ch, i) => {
          const chapterContent = jsonToMarkdown(ch.content as JSONContent)
          return `## ${ch.title || `Chapter ${i + 1}`}\n\n${chapterContent}`
        }).join('\n\n---\n\n')
        
        if (options.includeTitle) {
          exportContent = `# ${title}\n\n*by ${authorName}*\n\n---\n\n${exportContent}`
        }
      } else {
        exportContent = jsonToMarkdown(content)
        if (options.includeTitle) {
          exportContent = `# ${title}\n\n*by ${authorName}*\n\n---\n\n${exportContent}`
        }
      }
      filename = `${safeTitle}.md`
      mimeType = 'text/markdown'
      break
      
    case 'html':
    case 'pdf':
      // For PDF, we export styled HTML that can be printed to PDF
      if (chapters.length > 0) {
        const chapterHtml = chapters.map((ch, i) => {
          const chapterContent = jsonToHtml(ch.content as JSONContent)
          return `<div class="chapter-break">✦ ✦ ✦</div>\n<h2>${escapeHtml(ch.title || `Chapter ${i + 1}`)}</h2>\n${chapterContent}`
        }).join('\n')
        
        exportContent = jsonToHtml({ type: 'doc', content: [] }, title).replace(
          '</body>',
          `<p class="metadata">by ${escapeHtml(authorName)}</p>\n${chapterHtml}</body>`
        )
      } else {
        exportContent = jsonToHtml(content, options.includeTitle ? title : undefined)
        if (options.includeTitle) {
          exportContent = exportContent.replace(
            '</h1>',
            `</h1>\n<p class="metadata">by ${escapeHtml(authorName)}</p>`
          )
        }
      }
      filename = `${safeTitle}.html`
      mimeType = options.format === 'pdf' ? 'text/html' : 'text/html'
      break
      
    case 'epub':
      // Generate EPUB-ready HTML
      if (chapters.length > 0) {
        const chapterHtml = chapters.map((ch, i) => {
          const chapterContent = jsonToHtml(ch.content as JSONContent)
          return `<h2>${escapeHtml(ch.title || `Chapter ${i + 1}`)}</h2>\n${chapterContent}`
        }).join('\n<hr/>\n')
        
        exportContent = generateEpubHtml(title, null, authorName).replace(
          '<hr/>',
          `<hr/>\n${chapterHtml}`
        )
      } else {
        exportContent = generateEpubHtml(title, content, authorName)
      }
      filename = `${safeTitle}.epub.html`
      mimeType = 'application/xhtml+xml'
      break
      
    default:
      return { success: false, error: 'Unsupported export format' }
  }
  
  return {
    success: true,
    content: exportContent,
    filename,
    mimeType
  }
}

/**
 * Export a single chapter
 */
export async function exportChapter(
  storyId: string, 
  chapterId: string, 
  format: ExportFormat
): Promise<ExportResult> {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }
  
  // Fetch the chapter with story info
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select(`
      id,
      title,
      content,
      story:stories!chapters_story_id_fkey(
        id,
        title,
        author_id,
        author:profiles!stories_author_id_fkey(username, display_name)
      )
    `)
    .eq('id', chapterId)
    .eq('story_id', storyId)
    .single() as {
      data: {
        id: string
        title: string | null
        content: JSONContent | null
        story: {
          id: string
          title: string | null
          author_id: string
          author: { username: string; display_name: string | null } | null
        } | null
      } | null
      error: Error | null
    }
  
  if (chapterError || !chapter || !chapter.story) {
    return { success: false, error: 'Chapter not found' }
  }
  
  const story = chapter.story
  
  // Check access
  if (story.author_id !== user.id) {
    const { data: collab } = await supabase
      .from('story_collaborators')
      .select('role')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single()
    
    if (!collab) {
      return { success: false, error: 'Access denied' }
    }
  }
  
  const chapterTitle = chapter.title || 'Untitled Chapter'
  const storyTitle = story.title || 'Untitled Story'
  const authorName = story.author?.display_name || story.author?.username || 'Unknown Author'
  const content = chapter.content as JSONContent
  
  let exportContent = ''
  let filename = ''
  let mimeType = ''
  
  const safeTitle = `${storyTitle}-${chapterTitle}`.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase()
  
  switch (format) {
    case 'txt':
      exportContent = `${storyTitle}\n${chapterTitle}\nby ${authorName}\n\n${'='.repeat(50)}\n\n${jsonToText(content)}`
      filename = `${safeTitle}.txt`
      mimeType = 'text/plain'
      break
      
    case 'markdown':
      exportContent = `# ${storyTitle}\n\n## ${chapterTitle}\n\n*by ${authorName}*\n\n---\n\n${jsonToMarkdown(content)}`
      filename = `${safeTitle}.md`
      mimeType = 'text/markdown'
      break
      
    case 'html':
    case 'pdf':
      exportContent = jsonToHtml(content, `${storyTitle} - ${chapterTitle}`)
      exportContent = exportContent.replace(
        '</h1>',
        `</h1>\n<p class="metadata">by ${escapeHtml(authorName)}</p>`
      )
      filename = `${safeTitle}.html`
      mimeType = 'text/html'
      break
      
    case 'epub':
      exportContent = generateEpubHtml(`${storyTitle} - ${chapterTitle}`, content, authorName)
      filename = `${safeTitle}.epub.html`
      mimeType = 'application/xhtml+xml'
      break
      
    default:
      return { success: false, error: 'Unsupported export format' }
  }
  
  return {
    success: true,
    content: exportContent,
    filename,
    mimeType
  }
}

// Re-export types for client usage
export type { JSONContent } from '@/components/editor/tiptap-editor'
