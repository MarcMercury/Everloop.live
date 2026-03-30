'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'What should I do on my turn?',
  'What spells should I use?',
  'How should I roleplay this?',
  'Help me with this combat',
  'What skill check should I try?',
]

export function CelestialAdvisor({ 
  characterId, 
  characterName,
  onClose 
}: { 
  characterId: string
  characterName: string
  onClose: () => void 
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showContext, setShowContext] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return
    
    const userMsg: Message = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/player-deck/celestial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          question,
          context: context || undefined,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      // Read the streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      let assistantContent = ''
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        // Parse the streamed data - Vercel AI SDK uses a specific format
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Text chunk from Vercel AI SDK stream
            try {
              const text = JSON.parse(line.slice(2))
              assistantContent += text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                return updated
              })
            } catch {
              // Ignore parse errors from non-text chunks
            }
          }
        }
      }
    } catch {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'The celestial connection falters... Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="bg-charcoal-900/95 backdrop-blur-xl border-blue-500/20 shadow-2xl flex flex-col max-h-[70vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-blue-500/10 bg-blue-500/5">
        <h3 className="text-sm font-serif text-blue-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Ask a Celestial
          <span className="text-[10px] text-parchment-muted font-sans">for {characterName}</span>
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-parchment-muted h-7 w-7 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Situation Context (collapsible) */}
      <div className="px-3 pt-2">
        <button 
          onClick={() => setShowContext(!showContext)}
          className="text-[10px] text-parchment-muted hover:text-parchment transition-colors"
        >
          {showContext ? '▾' : '▸'} Set situation context
        </button>
        {showContext && (
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe the current situation (e.g. 'In a dungeon room with 3 goblins, one is behind cover, my ally is down...')"
            className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-lg px-3 py-2 text-xs text-parchment placeholder:text-parchment-muted/40 focus-glow resize-none"
            rows={2}
          />
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 mx-auto text-blue-400/30 mb-3" />
            <p className="text-xs text-parchment-muted italic">
              &ldquo;Mortal, I am here to guide your path. Ask your question.&rdquo;
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-teal-rich border border-gold-500/10 text-parchment' 
                : 'bg-blue-500/5 border border-blue-500/10 text-blue-100'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed celestial-response">
                {msg.content || (isLoading && i === messages.length - 1 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : '')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((prompt, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-[10px] border-blue-500/10 text-blue-300 hover:bg-blue-500/10 h-7 px-2"
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-blue-500/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask your Celestial advisor..."
            className="flex-1 bg-charcoal-950 border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/40 focus:border-blue-500/30 focus:outline-none"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}
