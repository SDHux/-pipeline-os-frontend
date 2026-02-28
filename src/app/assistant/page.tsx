'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Target, Building2, FileText, Zap } from 'lucide-react'
import clsx from 'clsx'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { icon: Target, label: 'ICP Analysis', prompt: 'Based on my target company list, which 5 companies should I prioritize applying to this week and why?' },
  { icon: Building2, label: 'Company Research', prompt: 'Give me a detailed breakdown of Rippling — their GTM motion, ideal candidate profile for Enterprise AE, and what I should emphasize in my application.' },
  { icon: FileText, label: 'Cover Letter', prompt: 'Write a targeted cover letter for the Enterprise AE role at Glean, positioning my PIM/MDM background and F1000 relationships as differentiators.' },
  { icon: Zap, label: 'Outreach Message', prompt: 'Draft a LinkedIn connection request message to a VP of Sales at Seismic who I have no prior connection with.' },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi Mark — I'm your Pipeline OS AI assistant, powered by Claude.\n\nI have full context on your target company list, your ICP scoring model, your background at Salsify, CommerceIQ, Akeneo, 1WorldSync, and Gartner, and your $300K-$350K OTE target.\n\nHow can I help you today? You can ask me to research a company, draft outreach, write a cover letter, analyze your pipeline, or think through interview strategy.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.content || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. Please check your API key configuration and try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-9 h-9 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-center">
            <Bot size={16} className="text-accent" />
          </div>
          AI Sales Assistant
        </h1>
        <p className="text-muted text-sm mt-1 ml-12">
          Powered by Claude · Full context on your pipeline, companies, and background
        </p>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              onClick={() => sendMessage(prompt)}
              className="card text-left hover:border-accent/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className="text-accent" />
                <span className="text-xs font-medium text-white">{label}</span>
              </div>
              <p className="text-[10px] text-muted line-clamp-2 group-hover:text-white/70 transition-colors">
                {prompt}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className={clsx(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
              msg.role === 'user'
                ? 'bg-accent/20 text-accent'
                : 'bg-surface border border-border text-muted'
            )}>
              {msg.role === 'user' ? 'MH' : <Bot size={14} className="text-accent" />}
            </div>
            <div className={clsx(
              'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-accent/10 border border-accent/20 text-white'
                : 'bg-surface border border-border text-white/90'
            )}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
              <div className={clsx(
                'text-[10px] mt-2',
                msg.role === 'user' ? 'text-accent/50 text-right' : 'text-muted'
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 relative">
          <textarea
            className="input resize-none py-3 pr-12 min-h-[52px] max-h-32"
            placeholder="Ask about companies, get cover letters, draft outreach, analyze your pipeline..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            rows={1}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1">
            <span className="text-[10px] text-muted">⏎</span>
          </div>
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className={clsx(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
            input.trim() && !loading
              ? 'bg-accent text-obsidian shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)]'
              : 'bg-surface border border-border text-muted cursor-not-allowed'
          )}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
