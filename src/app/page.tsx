'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, ExternalLink, Calendar, User, MessageSquare, Loader2, Save, Trash2 } from 'lucide-react'
import clsx from 'clsx'

type ApplicationStatus =
  | 'Research' | 'Applied' | 'Screening' | 'Interview'
  | 'Final Round' | 'Offer' | 'Closed - No' | 'Closed - Withdrew'

type App = {
  id: string
  company_id: string
  company_name: string
  role: string
  status: ApplicationStatus
  date_applied: string | null
  salary: string | null
  notes: string | null
  next_step: string | null
  recruiter: string | null
  score: number
  outreach_status: string
  contacts?: Contact[]
}

type Contact = {
  id: string
  name: string
  title: string | null
  linkedin_url: string | null
  outreach_status: string
}

const STATUSES: ApplicationStatus[] = [
  'Research', 'Applied', 'Screening', 'Interview',
  'Final Round', 'Offer', 'Closed - No', 'Closed - Withdrew'
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

const EMPTY_FORM = {
  company_name: '',
  company_id: '',
  role: '',
  status: 'Research' as ApplicationStatus,
  date_applied: '',
  salary: '',
  notes: '',
  next_step: '',
  recruiter: '',
  score: 0,
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()
      if (Array.isArray(data)) setApps(data)
    } catch (e) {
      console.error('Failed to fetch applications', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApps() }, [fetchApps])

  const filtered = apps.filter(a => filterStatus === 'All' || a.status === filterStatus)

  const activeCount = apps.filter(a => !a.status.startsWith('Closed') && a.status !== 'Research').length
  const interviewCount = apps.filter(a => a.status === 'Interview' || a.status === 'Final Round').length
  const appliedCount = apps.filter(a => a.date_applied).length
  const responseCount = apps.filter(a => a.status !== 'Research' && a.status !== 'Applied').length
  const responseRate = appliedCount > 0 ? Math.round((responseCount / appliedCount) * 100) : 0

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
  }

  const handleSaveNotes = async (id: string) => {
    const notes = editingNotes[id]
    if (notes === undefined) return
    setSaving(true)
    await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes }),
    })
    setApps(prev => prev.map(a => a.id === id ? { ...a, notes } : a))
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this application?')) return
    await fetch(`/api/applications?id=${id}`, { method: 'DELETE' })
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const handleAdd = async () => {
    if (!form.company_name || !form.role) return
    setSaving(true)
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        company_id: form.company_name.toLowerCase().replace(/\s+/g, '-'),
        date_applied: form.date_applied || null,
      }),
    })
    const newApp = await res.json()
    if (newApp.id) {
      setApps(prev => [newApp, ...prev])
      setForm(EMPTY_FORM)
      setShowAddForm(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-accent animate-spin" />
        <span className="ml-3 text-muted">Loading pipeline...</span>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pipeline CRM</h1>
          <p className="text-muted text-sm mt-1">Track applications, contacts, and next steps · Saved to database</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={14} />
          Add Application
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="card border-accent/30 space-y-3">
          <div className="section-label">New Application</div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Company name *" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
            <input className="input" placeholder="Role title *" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
            <input className="input" placeholder="Salary / OTE" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
            <input className="input" type="date" placeholder="Date applied" value={form.date_applied} onChange={e => setForm(p => ({ ...p, date_applied: e.target.value }))} />
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ApplicationStatus }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="input" placeholder="ICP Score (0-100)" type="number" value={form.score || ''} onChange={e => setForm(p => ({ ...p, score: parseInt(e.target.value) || 0 }))} />
          </div>
          <textarea className="input" placeholder="Notes..." rows={2} value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', val: appliedCount, color: 'text-accent' },
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

      {/* Pipeline bar */}
      <div className="card">
        <div className="section-label mb-3">Pipeline Stages</div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {(['Research', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer'] as ApplicationStatus[]).map(status => {
            const count = apps.filter(a => a.status === status).length
            const pct = apps.length > 0 ? (count / apps.length) * 100 : 0
            if (pct === 0) return null
            return (
              <div
                key={status}
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: STATUS_CONFIG[status].dot }}
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
            {s} ({s === 'All' ? apps.length : apps.filter(a => a.status === s).length})
          </button>
        ))}
      </div>

      {/* Applications */}
      <div className="space-y-2">
        {filtered.map(app => (
          <div key={app.id} className="card hover:border-accent/20 transition-all duration-200">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-elevated rounded-lg flex items-center justify-center border border-border">
                <span className="text-xs font-bold text-muted">
                  {app.company_name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">{app.company_name}</span>
                  <span className={clsx('badge text-[10px]', STATUS_CONFIG[app.status]?.color || 'badge-muted')}>
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-muted mt-0.5">{app.role}</div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                {app.salary && <span className="text-xs font-mono text-signal">{app.salary}</span>}
                {app.date_applied && <span className="text-[10px] text-muted">Applied {app.date_applied}</span>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="text-base font-display font-bold"
                  style={{ color: app.score >= 90 ? '#00ff88' : app.score >= 80 ? '#00d4ff' : '#ffaa00' }}
                >
                  {app.score}
                </div>
                <ChevronDown size={14} className={clsx('text-muted transition-transform', expanded === app.id && 'rotate-180')} />
              </div>
            </div>

            {expanded === app.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {app.recruiter && (
                      <div className="flex items-start gap-2">
                        <User size={13} className="text-muted mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-white">{app.recruiter}</div>
                          <div className="text-[10px] text-muted">Recruiter</div>
                        </div>
                      </div>
                    )}
                    {app.next_step && (
                      <div className="flex items-start gap-2">
                        <Calendar size={13} className="text-warning mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-warning">Next step</div>
                          <div className="text-[10px] text-white">{app.next_step}</div>
                        </div>
                      </div>
                    )}
                    {app.contacts?.map(c => (
                      <div key={c.id} className="flex items-start gap-2">
                        <MessageSquare size={13} className="text-accent mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-white">{c.name}</div>
                          <div className="text-[10px] text-muted">{c.title} · {c.outreach_status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface rounded-lg p-3">
                    <div className="section-label mb-2">Notes</div>
                    <textarea
                      className="input text-xs resize-none min-h-16"
                      placeholder="Add notes..."
                      value={editingNotes[app.id] !== undefined ? editingNotes[app.id] : (app.notes || '')}
                      onChange={e => setEditingNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                    />
                    {editingNotes[app.id] !== undefined && (
                      <button
                        onClick={() => handleSaveNotes(app.id)}
                        disabled={saving}
                        className="btn-primary text-xs mt-2 flex items-center gap-1"
                      >
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                        Save notes
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <select
                    className="input text-xs max-w-44"
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn-secondary text-xs flex items-center gap-1.5">
                    <ExternalLink size={12} /> View Job
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="btn-ghost text-xs text-danger/70 hover:text-danger flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-muted text-sm">No applications found</div>
            <button onClick={() => setShowAddForm(true)} className="btn-primary mt-4 text-sm">
              Add your first application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
