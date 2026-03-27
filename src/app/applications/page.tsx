'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronDown, Calendar, User, MessageSquare, Mail } from 'lucide-react'
import clsx from 'clsx'

type Stage =
  | 'Research' | 'Applied' | 'Screening' | 'Interview'
  | 'Final Round' | 'Offer' | 'Closed - No' | 'Closed - Withdrew'

type Application = {
  id: string
  company_name: string
  role: string
  stage: Stage
  date_applied: string | null
  salary: string | null
  contact_name: string | null
  contact_title: string | null
  last_email_date: string | null
  last_email_subject: string | null
  last_email_summary: string | null
  next_step: string | null
  icp_score: number | null
  notes: string | null
  updated_at: string
}

const STAGES: Stage[] = [
  'Research', 'Applied', 'Screening', 'Interview',
  'Final Round', 'Offer', 'Closed - No', 'Closed - Withdrew'
]

const STAGE_CONFIG: Record<Stage, { color: string; dot: string }> = {
  'Research':          { color: 'text-gray-400 bg-gray-400/10 border border-gray-400/20',        dot: '#6b7280' },
  'Applied':           { color: 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20',         dot: '#22d3ee' },
  'Screening':         { color: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',   dot: '#facc15' },
  'Interview':         { color: 'text-green-400 bg-green-400/10 border border-green-400/20',      dot: '#4ade80' },
  'Final Round':       { color: 'text-green-400 bg-green-400/10 border border-green-400/20',      dot: '#4ade80' },
  'Offer':             { color: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',dot: '#34d399' },
  'Closed - No':       { color: 'text-red-400 bg-red-400/10 border border-red-400/20',            dot: '#f87171' },
  'Closed - Withdrew': { color: 'text-gray-400 bg-gray-400/10 border border-gray-400/20',         dot: '#6b7280' },
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStage, setFilterStage] = useState<Stage | 'All'>('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApp, setNewApp] = useState({ company_name: '', role: '', stage: 'Research' as Stage, salary: '', notes: '' })

  useEffect(() => { loadApps() }, [])

  async function loadApps() {
    setLoading(true)
    try {
      const res = await fetch('/api/pipeline')
      const data = await res.json()
      setApps(data.applications || [])
    } catch (e) {
      console.error('Failed to load applications', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStage(id: string, stage: Stage) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, stage } : a))
    await fetch('/api/pipeline', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
    })
  }

  async function addApplication() {
    if (!newApp.company_name || !newApp.role) return
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newApp,
        date_applied: newApp.stage !== 'Research' ? new Date().toISOString().split('T')[0] : null,
      }),
    })
    const data = await res.json()
    if (data.application) {
      setApps(prev => [data.application, ...prev])
      setNewApp({ company_name: '', role: '', stage: 'Research', salary: '', notes: '' })
      setShowAddForm(false)
    }
  }

  async function syncEmails() {
    setSyncing(true)
    setSyncMessage('Scanning Gmail...')
    try {
      const res = await fetch('/api/gmail-sync', { method: 'POST' })
      const data = await res.json()
      if (data.updated > 0) await loadApps()
      setSyncMessage(data.message || 'Sync complete')
      setTimeout(() => setSyncMessage(''), 5000)
    } catch {
      setSyncMessage('Sync failed')
      setTimeout(() => setSyncMessage(''), 5000)
    } finally {
      setSyncing(false)
    }
  }

  const filtered = apps.filter(a => filterStage === 'All' || a.stage === filterStage)
  const appliedCount = apps.filter(a => a.date_applied).length
  const activeCount = apps.filter(a => !a.stage.startsWith('Closed') && a.stage !== 'Research').length
  const interviewCount = apps.filter(a => a.stage === 'Interview' || a.stage === 'Final Round').length
  const responseRate = appliedCount > 0 ? Math.round((apps.filter(a => a.last_email_date).length / appliedCount) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted text-sm animate-pulse">Loading pipeline...</div>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pipeline CRM</h1>
          <p className="text-muted text-sm mt-1">Track applications, contacts, and next steps</p>
        </div>
        <div className="flex items-center gap-2">
          {syncMessage && <span className="text-xs text-cyan-400 animate-pulse">{syncMessage}</span>}
          <button onClick={syncEmails} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm">
            <Mail size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Emails'}
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary flex items-center gap-2">
            <Plus size={14} />Add Application
          </button>
        </div>
      </div>
      {showAddForm && (
        <div className="card space-y-3">
          <div className="section-label">New Application</div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Company name *" value={newApp.company_name} onChange={e => setNewApp(p => ({ ...p, company_name: e.target.value }))} />
            <input className="input" placeholder="Role / title *" value={newApp.role} onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))} />
            <select className="input" value={newApp.stage} onChange={e => setNewApp(p => ({ ...p, stage: e.target.value as Stage }))}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="input" placeholder="Salary (optional)" value={newApp.salary} onChange={e => setNewApp(p => ({ ...p, salary: e.target.value }))} />
          </div>
          <textarea className="input w-full" rows={2} placeholder="Notes (optional)" value={newApp.notes} onChange={e => setNewApp(p => ({ ...p, notes: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={addApplication} className="btn-primary text-sm">Save</button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', val: appliedCount, color: 'text-accent' },
          { label: 'Active Pipeline', val: activeCount, color: 'text-signal' },
          { label: 'Interviews', val: interviewCount, color: 'text-signal' },
          { label: 'Response Rate', val: responseRate + '%', color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={clsx('text-3xl font-display font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-label mb-3">Pipeline Stages</div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {STAGES.slice(0, 6).map(stage => {
            const count = apps.filter(a => a.stage === stage).length
            const pct = apps.length > 0 ? (count / apps.length) * 100 : 0
            if (pct === 0) return null
            return <div key={stage} className="h-full rounded-full" style={{ width: pct + '%', backgroundColor: STAGE_CONFIG[stage].dot }} />
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {STAGES.slice(0, 6).map(stage => {
            const count = apps.filter(a => a.stage === stage).length
            return (
              <div key={stage} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_CONFIG[stage].dot }} />
                <span className="text-[10px] text-muted">{stage}</span>
                <span className="text-[10px] font-mono text-white">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['All', ...STAGES]).map(s => (
          <button key={s} onClick={() => setFilterStage(s as Stage | 'All')}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
              filterStage === s ? 'bg-accent text-obsidian border-accent' : 'bg-surface border-border text-muted hover:text-white')}>
            {s} <span className="opacity-60">({s === 'All' ? apps.length : apps.filter(a => a.stage === s).length})</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center text-muted text-sm py-10">
            {apps.length === 0 ? 'No applications yet - click Add Application to get started.' : 'No applications in this stage.'}
          </div>
        )}
        {filtered.map(app => (
          <div key={app.id} className="card hover:border-accent/20 transition-all">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
              <div className="w-9 h-9 bg-elevated rounded-lg flex items-center justify-center border border-border flex-shrink-0">
                <span className="text-xs font-bold text-muted">{app.company_name.slice(0,2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">{app.company_name}</span>
                  <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium', STAGE_CONFIG[app.stage].color)}>{app.stage}</span>
                  {app.last_email_date && <span className="text-[10px] text-cyan-400 flex items-center gap-1"><Mail size={10} /> Email</span>}
                </div>
                <div className="text-xs text-muted mt-0.5">{app.role}</div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                {app.salary && <span className="text-xs font-mono text-signal">{app.salary}</span>}
                {app.date_applied && <span className="text-[10px] text-muted">Applied {app.date_applied}</span>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {app.icp_score && <div className="text-base font-display font-bold" style={{ color: app.icp_score >= 90 ? '#4ade80' : app.icp_score >= 80 ? '#22d3ee' : '#facc15' }}>{app.icp_score}</div>}
                <ChevronDown size={14} className={clsx('text-muted transition-transform', expanded === app.id && 'rotate-180')} />
              </div>
            </div>
            {expanded === app.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {app.contact_name && (<div className="flex items-start gap-2"><User size={13} className="text-muted mt-0.5" /><div><div className="text-xs font-medium text-white">{app.contact_name}</div>{app.contact_title && <div className="text-[10px] text-muted">{app.contact_title}</div>}</div></div>)}
                    {app.last_email_summary && (<div className="flex items-start gap-2"><MessageSquare size={13} className="text-cyan-400 mt-0.5" /><div><div className="text-xs font-medium text-cyan-400">Latest email</div><div className="text-[10px] text-white/80 mt-0.5">{app.last_email_summary}</div>{app.last_email_date && <div className="text-[10px] text-muted mt-0.5">{new Date(app.last_email_date).toLocaleDateString()}</div>}</div></div>)}
                    {app.next_step && (<div className="flex items-start gap-2"><Calendar size={13} className="text-warning mt-0.5" /><div><div className="text-xs font-medium text-warning">Next step</div><div className="text-[10px] text-white">{app.next_step}</div></div></div>)}
                  </div>
                  {app.notes && (<div className="bg-surface rounded-lg p-3"><div className="section-label mb-2">Notes</div><p className="text-xs text-white/80">{app.notes}</p></div>)}
                </div>
                <div className="flex gap-2 mt-4">
                  <select className="input text-xs max-w-44" value={app.stage} onChange={e => updateStage(app.id, e.target.value as Stage)}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
