'use client'

import { useState } from 'react'
import { Send, Copy, Check, Linkedin, Mail, User, ChevronDown, Wand2 } from 'lucide-react'
import clsx from 'clsx'

const OUTREACH_QUEUE = [
  {
    id: '1',
    company: 'Glean',
    contact: 'Arvind Jain',
    title: 'CEO & Co-founder',
    type: 'linkedin' as const,
    priority: 'high',
    reason: 'Hiring manager for Enterprise AE expansion. Applied Feb 20.',
    template: `Hi Arvind — I recently applied for the Enterprise AE role at Glean and wanted to connect directly. I've spent 10+ years selling data management and AI platforms into Fortune 1000 accounts (P&G, Walmart, Microsoft), and Glean's Work AI vision maps directly to the buyer conversations I'm already having. Would love to be considered as you build out the West enterprise team.`,
    score: 95,
  },
  {
    id: '2',
    company: 'Seismic',
    contact: 'Doug Winter',
    title: 'CEO',
    type: 'linkedin' as const,
    priority: 'high',
    reason: 'Local San Diego company. Active screening conversation.',
    template: `Hi Doug — as a San Diego-based enterprise sales leader, Seismic is at the top of my list. I've built ARR across F1000 accounts in tech, CPG, and retail — exactly the verticals Seismic targets. Currently in conversation with your team and wanted to connect directly.`,
    score: 91,
  },
  {
    id: '3',
    company: 'Rippling',
    contact: 'Matt Plank',
    title: 'President',
    type: 'linkedin' as const,
    priority: 'medium',
    reason: 'Interview in progress. Connection reinforces pipeline.',
    template: `Hi Matt — currently interviewing for an Enterprise AE role at Rippling and excited about the platform's compound product strategy. My background is closing complex enterprise deals at Salsify, Akeneo, and CommerceIQ — all multi-stakeholder, technical sales against incumbent vendors. Happy to share more context.`,
    score: 94,
  },
  {
    id: '4',
    company: 'o9 Solutions',
    contact: 'Chakri Gottemukkala',
    title: 'CEO',
    type: 'linkedin' as const,
    priority: 'medium',
    reason: 'Strong vertical overlap: CPG, retail, automotive. No active application yet.',
    template: `Hi Chakri — I've spent years selling data management solutions into P&G, Walmart, and Ford — the exact accounts o9 serves. Your supply chain AI platform is a natural next step in my career trajectory. Would love to explore how I could contribute to your enterprise GTM team.`,
    score: 88,
  },
  {
    id: '5',
    company: 'Databricks',
    contact: 'Ali Ghodsi',
    title: 'CEO',
    type: 'email' as const,
    priority: 'low',
    reason: 'Applied Feb 19. Warm outreach to reinforce application.',
    template: `Hi Ali,\n\nI recently applied for the Enterprise AE – CPG role at Databricks and wanted to reach out directly. Over the past decade I've sold data and AI platforms into Fortune 1000 accounts across CPG, retail, and automotive — including P&G, Walmart, and Microsoft.\n\nDatabricks' lakehouse vision is exactly what those buyers need, and I believe my existing relationships and technical sales experience would accelerate your enterprise motion in those verticals.\n\nI'd welcome the chance to connect.\n\nBest,\nMark Huckins\nmarkhuckinsprofile.netlify.app`,
    score: 93,
  },
]

const PRIORITY_COLORS = {
  high: 'text-danger border-danger/30 bg-danger/5',
  medium: 'text-warning border-warning/30 bg-warning/5',
  low: 'text-muted border-border bg-surface',
}

export default function OutreachPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>('1')
  const [messages, setMessages] = useState<Record<string, string>>(
    Object.fromEntries(OUTREACH_QUEUE.map(o => [o.id, o.template]))
  )

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(messages[id])
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSent = (id: string) => {
    setSent(prev => new Set([...prev, id]))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Outreach</h1>
          <p className="text-muted text-sm mt-1">
            AI-drafted LinkedIn messages and emails · {OUTREACH_QUEUE.filter(o => !sent.has(o.id)).length} pending
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg">
          <Wand2 size={13} className="text-accent" />
          <span className="text-xs font-mono text-accent">AI Drafted</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', val: OUTREACH_QUEUE.filter(o => !sent.has(o.id)).length, color: 'text-warning' },
          { label: 'Sent This Week', val: sent.size, color: 'text-signal' },
          { label: 'Response Rate', val: '33%', color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={clsx('text-3xl font-display font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {OUTREACH_QUEUE.map(item => (
          <div
            key={item.id}
            className={clsx(
              'card transition-all duration-200',
              sent.has(item.id) ? 'opacity-50' : 'hover:border-accent/20',
            )}
          >
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-elevated rounded-lg flex items-center justify-center border border-border">
                {item.type === 'linkedin' ? (
                  <Linkedin size={14} className="text-[#0077b5]" />
                ) : (
                  <Mail size={14} className="text-muted" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">{item.contact}</span>
                  <span className={clsx('badge text-[10px]', PRIORITY_COLORS[item.priority])}>
                    {item.priority}
                  </span>
                  {sent.has(item.id) && (
                    <span className="badge badge-signal text-[10px]">Sent ✓</span>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">{item.title} · {item.company}</div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <span
                  className="text-sm font-mono font-bold"
                  style={{ color: item.score >= 90 ? '#00ff88' : '#00d4ff' }}
                >
                  {item.score}
                </span>
                <ChevronDown
                  size={14}
                  className={clsx('text-muted transition-transform', expanded === item.id && 'rotate-180')}
                />
              </div>
            </div>

            {expanded === item.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="text-xs text-muted bg-surface rounded-lg p-2">
                  💡 {item.reason}
                </div>

                <div>
                  <div className="section-label mb-2">Message</div>
                  <textarea
                    className="input text-xs font-mono min-h-28 resize-y leading-relaxed"
                    value={messages[item.id]}
                    onChange={e => setMessages(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  {item.type === 'linkedin' ? (
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center gap-2 text-xs"
                    >
                      <Linkedin size={13} />
                      Open LinkedIn
                    </a>
                  ) : (
                    <a
                      href={`mailto:?body=${encodeURIComponent(messages[item.id])}`}
                      className="btn-primary flex items-center gap-2 text-xs"
                    >
                      <Mail size={13} />
                      Open Email
                    </a>
                  )}
                  <button
                    onClick={() => handleCopy(item.id)}
                    className="btn-secondary flex items-center gap-2 text-xs"
                  >
                    {copied === item.id ? <Check size={13} className="text-signal" /> : <Copy size={13} />}
                    {copied === item.id ? 'Copied!' : 'Copy'}
                  </button>
                  {!sent.has(item.id) && (
                    <button
                      onClick={() => handleSent(item.id)}
                      className="btn-ghost flex items-center gap-2 text-xs"
                    >
                      <Send size={13} />
                      Mark Sent
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
