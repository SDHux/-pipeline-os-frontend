'use client'

import { TARGET_COMPANIES, getTopCompanies } from '@/lib/companies'
import {
  Building2,
  TrendingUp,
  Send,
  Target,
  Clock,
  ArrowRight,
  Zap,
  ChevronRight,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

const MOCK_STATS = {
  targetCompanies: TARGET_COMPANIES.length,
  applied: 8,
  interviews: 3,
  responseRate: 37,
  avgScore: Math.round(TARGET_COMPANIES.reduce((s, c) => s + c.icpScore, 0) / TARGET_COMPANIES.length),
  thisWeek: 4,
}

const MOCK_PIPELINE = [
  { company: 'Rippling', role: 'Enterprise AE', status: 'Interview', date: '2026-02-25', score: 94 },
  { company: 'Seismic', role: 'Strategic AE', status: 'Screening', date: '2026-02-22', score: 91 },
  { company: 'Glean', role: 'Enterprise AE', status: 'Applied', date: '2026-02-20', score: 95 },
  { company: 'Databricks', role: 'Enterprise AE', status: 'Applied', date: '2026-02-19', score: 93 },
  { company: 'Gong.io', role: 'Strategic AE', status: 'Research', date: '2026-02-17', score: 86 },
]

const STATUS_COLORS: Record<string, string> = {
  Research: 'badge-muted',
  Applied: 'badge-accent',
  Screening: 'badge-warning',
  Interview: 'badge-signal',
  'Final Round': 'badge-signal',
  Offer: 'badge-signal',
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#00ff88' : score >= 80 ? '#00d4ff' : score >= 70 ? '#ffaa00' : '#6b6b8a'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-6" style={{ color }}>{score}</span>
    </div>
  )
}

export default function DashboardPage() {
  const topCompanies = getTopCompanies(5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          Good morning, Mark.
        </h1>
        <p className="text-muted text-sm mt-1">
          {TARGET_COMPANIES.length} target companies · {MOCK_STATS.applied} applications · {MOCK_STATS.interviews} active interviews
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Target Companies',
            value: MOCK_STATS.targetCompanies,
            icon: Building2,
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20',
            sub: '6 verticals',
          },
          {
            label: 'Active Pipeline',
            value: MOCK_STATS.applied,
            icon: Send,
            color: 'text-signal',
            bg: 'bg-signal/10',
            border: 'border-signal/20',
            sub: `${MOCK_STATS.interviews} in interviews`,
          },
          {
            label: 'Response Rate',
            value: `${MOCK_STATS.responseRate}%`,
            icon: TrendingUp,
            color: 'text-warning',
            bg: 'bg-warning/10',
            border: 'border-warning/20',
            sub: 'Above 25% target',
          },
          {
            label: 'Avg ICP Score',
            value: MOCK_STATS.avgScore,
            icon: Target,
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20',
            sub: 'Out of 100',
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={clsx('card border hover:border-opacity-60 transition-all duration-200', stat.border)}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="section-label mb-2">{stat.label}</div>
                <div className={clsx('text-3xl font-display font-bold', stat.color)}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted mt-1">{stat.sub}</div>
              </div>
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-label mb-1">Active Pipeline</div>
              <h2 className="text-base font-display font-semibold text-white">Recent Applications</h2>
            </div>
            <Link href="/applications" className="btn-ghost flex items-center gap-1 text-xs">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {MOCK_PIPELINE.map((app, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-border hover:border-accent/30 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-elevated rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-muted group-hover:text-accent transition-colors">
                    {app.company.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{app.company}</span>
                    <span className={clsx('badge text-[10px]', STATUS_COLORS[app.status] || 'badge-muted')}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">{app.role}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <ScoreBar score={app.score} />
                  <div className="text-[10px] text-muted mt-1">{app.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top ICP Companies */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="section-label">Top ICP Matches</div>
              <Link href="/companies" className="text-[10px] text-accent hover:text-accent-dim font-mono">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {topCompanies.map((co, i) => (
                <div key={co.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{co.name}</div>
                    <div className="text-[10px] text-muted truncate">{co.category}</div>
                  </div>
                  <div
                    className="text-xs font-mono font-bold"
                    style={{ color: co.icpScore >= 90 ? '#00ff88' : co.icpScore >= 80 ? '#00d4ff' : '#ffaa00' }}
                  >
                    {co.icpScore}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="card border-warning/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-warning" />
              <div className="section-label text-warning">Action Required</div>
            </div>
            <div className="space-y-2">
              {[
                { text: 'Follow up: Rippling screening', icon: Clock, urgent: true },
                { text: 'Apply: Tekion Enterprise AE', icon: Send, urgent: false },
                { text: 'Connect: VP Sales at Seismic', icon: Send, urgent: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-lg">
                  <item.icon size={12} className={item.urgent ? 'text-warning' : 'text-muted'} />
                  <span className="text-xs text-white/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="section-label mb-3">This Week</div>
            <div className="space-y-2">
              {[
                { label: 'Applied', val: `${MOCK_STATS.thisWeek} roles`, icon: CheckCircle2, color: 'text-signal' },
                { label: 'Responses', val: '2 received', icon: BarChart3, color: 'text-accent' },
                { label: 'Outreach', val: '6 messages', icon: Send, color: 'text-warning' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon size={13} className={item.color} />
                  <span className="text-xs text-muted flex-1">{item.label}</span>
                  <span className="text-xs font-mono text-white">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
