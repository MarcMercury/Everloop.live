'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2, X, BookOpen, Minimize2, Maximize2 } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  entities?: Array<{ id: string; name: string; type: string; similarity: number }>
}

interface LoreChatProps {
  /** Campaign context for scoped queries */
  campaignId?: string
}

export function LoreChat({ campaignId }: LoreChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingEntities, setStreamingEntities] = useState<ChatMessage['entities']>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)
    setStreamingContent('')
    setStreamingEntities(undefined)

    abortRef.current = new AbortController()

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/lore-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, campaignId }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to query lore')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let fullContent = ''
      let entities: ChatMessage['entities']

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'meta') {
              entities = parsed.entities
              setStreamingEntities(parsed.entities)
            } else if (parsed.type === 'text') {
              fullContent += parsed.content
              setStreamingContent(fullContent)
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fullContent, entities },
      ])
      setStreamingContent('')
      setStreamingEntities(undefined)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${message}` },
      ])
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    setIsLoading(false)
    if (streamingContent) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: streamingContent, entities: streamingEntities },
      ])
      setStreamingContent('')
      setStreamingEntities(undefined)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-105 hover:shadow-purple-900/50"
      >
        <BookOpen className="h-4 w-4" />
        Ask the Lore Oracle
      </button>
    )
  }

  return (
    <div
      className={`fixed z-50 flex flex-col border border-purple-500/20 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 transition-all duration-300 ${
        isExpanded
          ? 'inset-4 rounded-2xl'
          : 'bottom-6 right-6 h-[500px] w-[400px] rounded-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-200">Lore Oracle</span>
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400">
            RAG
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 text-parchment-muted hover:bg-white/5 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { setIsOpen(false); handleCancel() }}
            className="rounded p-1 text-parchment-muted hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <MessageCircle className="h-8 w-8 text-purple-500/40" />
            <div>
              <p className="text-sm font-medium text-purple-300">Ask anything about Everloop</p>
              <p className="mt-1 text-xs text-parchment-muted">
                &quot;Who is the Vaultkeeper?&quot; &middot; &quot;What are the 13 Shards?&quot; &middot; &quot;Tell me about the Fray&quot;
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600/20 text-purple-100'
                  : 'bg-zinc-800/80 text-zinc-200'
              }`}
            >
              {msg.role === 'assistant' && msg.entities && msg.entities.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {msg.entities.map(e => (
                    <span
                      key={e.id}
                      className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400"
                    >
                      {e.name}
                      <span className="ml-1 opacity-50">{e.type}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-zinc-800/80 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-200">
              {streamingEntities && streamingEntities.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {streamingEntities.map(e => (
                    <span
                      key={e.id}
                      className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400"
                    >
                      {e.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">{streamingContent}</div>
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-purple-400 animate-pulse" />
            </div>
          </div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-purple-500/20 p-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Oracle..."
            className="flex-1 border-purple-500/20 bg-zinc-900/50 text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/30"
            disabled={isLoading}
            maxLength={2000}
          />
          {isLoading ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
