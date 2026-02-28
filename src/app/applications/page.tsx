'use client'

import { useState } from 'react'
import { ApplicationStatus } from '@/types'
import { Plus, ChevronDown, ExternalLink, Calendar, User, MessageSquare } from 'lucide-react'
import clsx from 'clsx'

type App = {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  dateApplied: string
  salary?: string
  contact?: string
  contactTitle?: string
  response?: string
  nextStep?: string
  score: number
  notes?: string
}

const MOCK_APPS: App[] = [
  { id: '1', company: 'Rippling', role: 'Enterprise Account Executive', status: 'Interview', dateApplied: '2026-02-10', salary: '$360-440K OTE', contact: 'Sarah Chen', contactTitle: 'Sr. Recruiter', response: '2026-02-15', nextStep: 'Panel interview Feb 28', score: 94, notes: 'Strong fit conversation with hiring manager. MEDDIC knowledge resonated.' },
  { id: '2', company: 'Seismic', role: 'Strategic Account Executive', status: 'Screening', dateApplied: '2026-02-14', salary: '$350-420K OTE', contact: 'Mike Torres', contactTitle: 'Talent Acquisition', response: '2026-02-19', nextStep: 'Phone screen scheduled', score: 91 },
  { id: '3', company: 'Glean', role: 'Enterprise Account Executive', status: 'Applied', dateApplied: '2026-02-20', salary: '$400-500K OTE', score: 95 },
  { id: '4', company: 'Databricks', role: 'Enterprise AE - CPG', status: 'Applied', dateApplied: '2026-02-19', salary: '$440-540K OTE', score: 93 },
  { id: '5', company: 'HubSpot', role: 'Enterprise Account Executive', status: 'Closed - No', dateApplied: '2026-01-28', salary: '$320-380K OTE', response: '2026-02-05', notes: 'Moved forward with a candidate with more HubSpot ecosystem experience.', score: 80 },
  { id: '6', company: 'Braze', role: 'Strategic Account Executive', status: 'Research', dateApplied: '', salary: '$340-420K OTE', score: 81 },
  { id: '7', company: 'Gong.io', role: 'Strategic Account Executive', status: 'Research', dateApplied: '', salary: '$360-440K OTE', score: 86 },
]

const STATUSES: ApplicationStatus[] = [
  'Research', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer', 'Closed - No', 'Closed - Withdrew'
]

const STATUS_CONFIG: Record<ApplicationStatus, { color: string; dot: string }> = {
  'Research': { color: 'badge-muted', dot: '#6b6b8a' },
  'Applied': { color: 'badge-accent', dot: '#00d4ff' },
  'Screening': { color: 'badge-warning', dot: '#ffaa00' },
  'Interview': { color: 'badge-signal', dot: '#00ff88' },
  'Final Round': { color: 'badge-signal', dot: '#00ff88' },
  'Offer': { color: 'badge-signal', dot: '#00ff88' },
  'Closed - No': { color: 'badge-danger', dot: '#ff4466' },
  'Closed - Withdrew': { color: 'badge-muted', dot: '#6b6b8a' },
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState(MOCK_APPS)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All')

  const filtered = apps.filter(a => filterStatus === 'All' || a.status === filterStatus)

  const activeCount = apps.filter(a => !a.status.startsWith('Closed') && a.status !== 'Research').length
  const interviewCount = apps.filter(a => a.status === 'Interview' || a.status === 'Final Round').length
  const responseRate = Math.round(
    (apps.filter(a => a.response).length / apps.filter(a => a.dateApplied).length) * 100
  ) || 0

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pipeline CRM</h1>
          <p className="text-muted text-sm mt-1">Track applications, contacts, and next steps</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          Add Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', val: apps.filter(a => a.dateApplied).length, color: 'text-accent' },
          { label: 'Active Pipeline', val: activeCount, color: 'text-signal' },
          { label: 'Interviews', val: interviewCount, color: 'text-signal' },
          { label: 'Response Rate', val: `${responseRate}%`, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={clsx('text-3xl font-display font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline stage bar */}
      <div className="card">
        <div className="section-label mb-3">Pipeline Stages</div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {(['Research', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer'] as ApplicationStatus[]).map(status => {
            const count = apps.filter(a => a.status === status).length
            const pct = (count / apps.length) * 100
            if (pct === 0) return null
            return (
              <div
                key={status}
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: STATUS_CONFIG[status].dot,
                }}
                title={`${status}: ${count}`}
              />
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {STATUSES.slice(0, 6).map(status => {
            const count = apps.filter(a => a.status === status).length
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CONFIG[status].dot }} />
                <span className="text-[10px] text-muted">{status}</span>
                <span className="text-[10px] font-mono text-white">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', ...STATUSES] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s as ApplicationStatus | 'All')}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200',
              filterStatus === s
                ? 'bg-accent text-obsidian border-accent'
                : 'bg-surface border-border text-muted hover:text-white'
            )}
          >
            {s}
            <span className="ml-1 opacity-60">
              ({s === 'All' ? apps.length : apps.filter(a => a.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-2">
        {filtered.map(app => (
          <div key={app.id} className="card hover:border-accent/20 transition-all duration-200">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-elevated rounded-lg flex items-center justify-center border border-border">
                <span className="text-xs font-bold text-muted">
                  {app.company.slice(0, 2).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">{app.company}</span>
                  <span className={clsx('badge text-[10px]', STATUS_CONFIG[app.status].color)}>
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-muted mt-0.5">{app.role}</div>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                {app.salary && <span className="text-xs font-mono text-signal">{app.salary}</span>}
                {app.dateApplied && (
                  <span className="text-[10px] text-muted">Applied {app.dateApplied}</span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="text-base font-display font-bold"
                  style={{ color: app.score >= 90 ? '#00ff88' : app.score >= 80 ? '#00d4ff' : '#ffaa00' }}
                >
                  {app.score}
                </div>
                <ChevronDown
                  size={14}
                  className={clsx('text-muted transition-transform', expanded === app.id && 'rotate-180')}
                />
              </div>
            </div>

            {expanded === app.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {app.contact && (
                      <div className="flex items-start gap-2">
                        <User size={13} className="text-muted mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-white">{app.contact}</div>
                          <div className="text-[10px] text-muted">{app.contactTitle}</div>
                        </div>
                      </div>
                    )}
                    {app.response && (
                      <div className="flex items-start gap-2">
                        <MessageSquare size={13} className="text-signal mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-signal">Response received</div>
                          <div className="text-[10px] text-muted">{app.response}</div>
                        </div>
                      </div>
                    )}
                    {app.nextStep && (
                      <div className="flex items-start gap-2">
                        <Calendar size={13} className="text-warning mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-warning">Next step</div>
                          <div className="text-[10px] text-white">{app.nextStep}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {app.notes && (
                    <div className="bg-surface rounded-lg p-3">
                      <div className="section-label mb-2">Notes</div>
                      <p className="text-xs text-white/80">{app.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <select
                    className="input text-xs max-w-40"
                    value={app.status}
                    onChange={e => setApps(prev =>
                      prev.map(a => a.id === app.id ? { ...a, status: e.target.value as ApplicationStatus } : a)
                    )}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn-secondary text-xs flex items-center gap-1.5">
                    <ExternalLink size={12} /> View Job
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
