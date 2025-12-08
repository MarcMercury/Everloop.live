'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type JSONContent } from '@tiptap/react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-colors',
        'hover:bg-charcoal-700 hover:text-gold',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? 'bg-charcoal-700 text-gold' : 'text-muted-foreground'
      )}
    >
      {children}
    </button>
  )
}

interface ToolbarProps {
  editor: Editor | null
}

function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b border-charcoal-700 bg-navy/50 rounded-t-lg flex-wrap">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-charcoal-700 mx-1" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-charcoal-700 mx-1" />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-charcoal-700 mx-1" />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}

interface TiptapEditorProps {
  content?: JSONContent
  onChange?: (content: JSONContent) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Begin your story...',
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert max-w-none',
          'prose-headings:font-serif prose-headings:text-foreground',
          'prose-p:text-foreground/90 prose-p:leading-relaxed',
          'prose-blockquote:border-l-gold prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-ul:text-foreground/90 prose-ol:text-foreground/90',
          'focus:outline-none min-h-[500px] p-4'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
  })

  return (
    <div
      className={cn(
        'rounded-lg border border-charcoal-700 bg-charcoal/50 overflow-hidden',
        'focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20',
        'transition-colors',
        className
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      
      {/* Editor styles */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(220 10% 40%);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        .tiptap:focus {
          outline: none;
        }
        
        .tiptap h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .tiptap h3 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .tiptap p {
          margin-bottom: 1rem;
        }
        
        .tiptap blockquote {
          margin: 1rem 0;
        }
        
        .tiptap ul, .tiptap ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .tiptap li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  )
}

export { type JSONContent }
