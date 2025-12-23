'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { useEffect, useRef, useState, useCallback } from 'react'
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
  Wand2,
  Shield,
  User,
  MessageSquarePlus,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type JSONContent } from '@tiptap/react'
import { CommentMark } from './extensions/comment-mark'
import { EntityLink } from './extensions/entity-link'
import { CommentPopover } from './comments/comment-popover'
import { EntityLinkPopover } from './entity-linker/entity-link-popover'
import { type StoryComment } from '@/lib/actions/comments'
import { type EntityMatch } from '@/lib/actions/entity-linker'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
  highlight?: boolean
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
  highlight,
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
        isActive ? 'bg-charcoal-700 text-gold' : 'text-muted-foreground',
        highlight && 'text-gold hover:bg-gold/10'
      )}
    >
      {children}
    </button>
  )
}

interface ToolbarProps {
  editor: Editor | null
  onMagicWand?: () => void
  onCanonCheck?: () => void
  onRosterOpen?: () => void
  onAddComment?: () => void
  onLinkEntity?: () => void
  hasSelection?: boolean
}

function Toolbar({ editor, onMagicWand, onCanonCheck, onRosterOpen, onAddComment, onLinkEntity, hasSelection }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b border-charcoal-700 bg-navy/50 rounded-t-lg flex-wrap">
      {/* AI Tools */}
      {(onMagicWand || onCanonCheck || onRosterOpen) && (
        <>
          {onMagicWand && (
            <ToolbarButton
              onClick={onMagicWand}
              title="Stream of Consciousness - Transform rough notes into prose"
              highlight
            >
              <Wand2 className="w-4 h-4" />
            </ToolbarButton>
          )}
          
          {onCanonCheck && (
            <ToolbarButton
              onClick={onCanonCheck}
              title="Check Canon - Verify lore consistency"
              highlight
            >
              <Shield className="w-4 h-4" />
            </ToolbarButton>
          )}
          
          {onRosterOpen && (
            <ToolbarButton
              onClick={onRosterOpen}
              title="Character Roster - Insert characters"
              highlight
            >
              <User className="w-4 h-4" />
            </ToolbarButton>
          )}
          
          {onAddComment && (
            <ToolbarButton
              onClick={onAddComment}
              title="Add Comment (select text first)"
              highlight
              disabled={!hasSelection}
            >
              <MessageSquarePlus className="w-4 h-4" />
            </ToolbarButton>
          )}
          
          {onLinkEntity && (
            <ToolbarButton
              onClick={onLinkEntity}
              title="Link to Canon Entity (select text first)"
              highlight
              disabled={!hasSelection}
            >
              <Link2 className="w-4 h-4" />
            </ToolbarButton>
          )}
          
          <div className="w-px h-6 bg-charcoal-700 mx-1" />
        </>
      )}

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
  onMagicWand?: () => void
  onCanonCheck?: () => void
  onRosterOpen?: () => void
  onEditorReady?: (editor: Editor) => void
  // Comment support
  storyId?: string
  chapterId?: string | null
  onCommentCreated?: (comment: StoryComment) => void
  comments?: StoryComment[]
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Begin your story...',
  className,
  onMagicWand,
  onCanonCheck,
  onRosterOpen,
  onEditorReady,
  storyId,
  chapterId,
  onCommentCreated,
  comments = [],
}: TiptapEditorProps) {
  // Comment popover state
  const [showCommentPopover, setShowCommentPopover] = useState(false)
  const [commentPopoverPosition, setCommentPopoverPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  
  // Entity link popover state
  const [showEntityPopover, setShowEntityPopover] = useState(false)
  const [entityPopoverPosition, setEntityPopoverPosition] = useState({ x: 0, y: 0 })
  
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
      CommentMark,
      EntityLink,
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
    onCreate: ({ editor }) => {
      onEditorReady?.(editor)
    },
  })
  
  // Track previous content to avoid unnecessary updates
  const contentRef = useRef(content)
  
  // Update editor content when prop changes (for chapter switching)
  useEffect(() => {
    if (editor && content !== contentRef.current) {
      // Only update if content actually changed (external update like chapter switch)
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(content)
      
      if (currentContent !== newContent) {
        editor.commands.setContent(content || '')
      }
      contentRef.current = content
    }
  }, [editor, content])
  
  // Track text selection for comments
  useEffect(() => {
    if (!editor) return
    
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      
      setHasSelection(from !== to && text.trim().length > 0)
      
      if (from !== to && text.trim().length > 0) {
        setSelectedText(text)
        setSelectionRange({ from, to })
      }
    }
    
    editor.on('selectionUpdate', handleSelectionUpdate)
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor])
  
  // Handle adding a comment
  const handleAddComment = useCallback(() => {
    if (!editor || !selectionRange || !selectedText) return
    
    // Get the cursor position for popover placement
    const { view } = editor
    const { from } = selectionRange
    const coords = view.coordsAtPos(from)
    
    setCommentPopoverPosition({ x: coords.left, y: coords.bottom })
    setShowCommentPopover(true)
  }, [editor, selectionRange, selectedText])
  
  // Handle comment created
  const handleCommentCreated = useCallback((comment: StoryComment) => {
    if (!editor || !selectionRange) return
    
    // Apply comment mark to selected text
    editor
      .chain()
      .focus()
      .setTextSelection(selectionRange)
      .setCommentMark({ 
        commentId: comment.id, 
        threadId: comment.thread_id || comment.id 
      })
      .run()
    
    onCommentCreated?.(comment)
    setShowCommentPopover(false)
  }, [editor, selectionRange, onCommentCreated])
  
  // Handle linking an entity
  const handleLinkEntity = useCallback(() => {
    if (!editor || !selectionRange || !selectedText) return
    
    // Get the cursor position for popover placement
    const { view } = editor
    const { from } = selectionRange
    const coords = view.coordsAtPos(from)
    
    setEntityPopoverPosition({ x: coords.left, y: coords.bottom })
    setShowEntityPopover(true)
  }, [editor, selectionRange, selectedText])
  
  // Handle entity link applied
  const handleEntityLinked = useCallback((entity: EntityMatch) => {
    if (!editor || !selectionRange) return
    
    // Apply entity link mark to selected text
    editor
      .chain()
      .focus()
      .setTextSelection(selectionRange)
      .setEntityLink({
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
      })
      .run()
    
    setShowEntityPopover(false)
  }, [editor, selectionRange])

  return (
    <div
      className={cn(
        'rounded-lg border border-charcoal-700 bg-charcoal/50 overflow-hidden',
        'focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20',
        'transition-colors relative',
        className
      )}
    >
      <Toolbar 
        editor={editor} 
        onMagicWand={onMagicWand}
        onCanonCheck={onCanonCheck}
        onRosterOpen={onRosterOpen}
        onAddComment={storyId ? handleAddComment : undefined}
        onLinkEntity={handleLinkEntity}
        hasSelection={hasSelection}
      />
      <EditorContent editor={editor} />
      
      {/* Comment Popover */}
      {showCommentPopover && storyId && (
        <CommentPopover
          storyId={storyId}
          chapterId={chapterId}
          selectedText={selectedText}
          selectionStart={selectionRange?.from}
          selectionEnd={selectionRange?.to}
          position={commentPopoverPosition}
          onClose={() => setShowCommentPopover(false)}
          onCommentCreated={handleCommentCreated}
        />
      )}
      
      {/* Entity Link Popover */}
      {showEntityPopover && editor && selectionRange && (
        <EntityLinkPopover
          editor={editor}
          position={entityPopoverPosition}
          selectedText={selectedText}
          selectionRange={selectionRange}
          onClose={() => setShowEntityPopover(false)}
          onLink={handleEntityLinked}
        />
      )}
      
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
        
        /* Comment highlight styles */
        .comment-highlight {
          background-color: rgba(234, 179, 8, 0.2);
          border-bottom: 2px solid rgba(234, 179, 8, 0.5);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .comment-highlight:hover {
          background-color: rgba(234, 179, 8, 0.3);
        }
        
        /* Entity link styles */
        .entity-link {
          border-bottom: 1px dotted currentColor;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .entity-link:hover {
          border-bottom-style: solid;
          opacity: 0.8;
        }
        
        .entity-link[data-entity-type="character"] {
          color: #60a5fa;
        }
        
        .entity-link[data-entity-type="location"] {
          color: #4ade80;
        }
        
        .entity-link[data-entity-type="artifact"] {
          color: #c084fc;
        }
        
        .entity-link[data-entity-type="event"] {
          color: #fb923c;
        }
        
        .entity-link[data-entity-type="faction"] {
          color: #f87171;
        }
        
        .entity-link[data-entity-type="concept"] {
          color: #22d3ee;
        }
        
        .entity-link[data-entity-type="creature"] {
          color: #facc15;
        }
      `}</style>
    </div>
  )
}

export { type JSONContent }
