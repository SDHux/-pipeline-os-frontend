'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, RefreshCw, CheckCircle, Send, Loader2, Clock, MapPin, DollarSign } from 'lucide-react'
import clsx from 'clsx'

type Job = {
  id: string
  company_id: string
  company_name: string
  title: string
  location: string | null
  remote: boolean
  url: string
  date_posted: string | null
  salary: string | null
  is_greenhouse: boolean
  applied: boolean
  icp_score: number
  source: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [applying, setApplying] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'applied' | 'not-applied'>('all')
  const [locationFilter, setLocationFilter] = useState<'all' | 'remote' | 'onsite'>('all')

  const fetchJobs = useCallback(async (refresh = false) => {
    try {
      const res = await fetch(`/api/jobs-scrape${refresh ? '?refresh=true' : ''}`)
      const data = await res.json()
      if (data.jobs) setJobs(data.jobs)
    } catch (e) {
      console.error('Failed to fetch jobs', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchJobs(true)
  }

  const handleMarkApplied = async (jobId: string) => {
    // Only update the specific job
    const job = jobs.find(j => j.id === jobId)
    if (!job || job.applied) return
    
    setApplying(jobId)
    
    // Update only this job in state
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applied: true } : j))
    
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: job.company_id,
          company_name: job.company_name,
          role: job.title,
          status: 'Applied',
          date_applied: new Date().toISOString().split('T')[0],
          job_url: job.url,
          is_greenhouse: job.is_greenhouse,
          salary: job.salary,
          score: job.icp_score,
        }),
      })
    } catch (e) {
      console.error('Failed to log application', e)
      // Revert if API call failed
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applied: false } : j))
    } finally {
      setApplying(null)
    }
  }

  const filtered = jobs.filter(j => {
    if (filter === 'applied' && !j.applied) return false
    if (filter === 'not-applied' && j.applied) return false
    if (locationFilter === 'remote' && !j.remote) return false
    if (locationFilter === 'onsite' && j.remote) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-accent animate-spin" />
        <span className="ml-3 text-muted">Loading job postings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Job Openings</h1>
          <p className="text-muted text-sm mt-1">
            {jobs.length} roles · US only · AE level
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Scraping...' : 'Refresh Jobs'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Roles', val: jobs.length, color: 'text-accent' },
          { label: 'Applied', val: jobs.filter(j => j.applied).length, color: 'text-signal' },
          { label: 'To Apply', val: jobs.filter(j => !j.applied).length, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={clsx('text-3xl font-display font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'not-applied', label: 'Not Applied' },
            { key: 'applied', label: 'Applied' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                filter === f.key ? 'bg-accent text-obsidian' : 'text-muted hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {[
            { key: 'all', label: 'All Locations' },
            { key: 'remote', label: 'Remote' },
            { key: 'onsite', label: 'On-site' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setLocationFilter(f.key as typeof locationFilter)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                locationFilter === f.key ? 'bg-accent text-obsidian' : 'text-muted hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {filtered.map(job => (
          <div
            key={job.id}
            className={clsx(
              'card flex items-center gap-4 transition-all duration-200',
              job.applied ? 'opacity-60' : 'hover:border-accent/30'
            )}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-elevated rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs font-bold text-muted">
                {job.company_name.slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-white">{job.title}</span>
                {job.is_greenhouse && <span className="badge badge-signal text-[10px]">Greenhouse</span>}
                {job.applied && <span className="badge badge-accent text-[10px]">Applied ✓</span>}
                {job.remote && <span className="badge badge-muted text-[10px]">Remote</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-xs text-muted">{job.company_name}</span>
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <MapPin size={10} /> {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1 text-xs text-signal font-mono">
                    <DollarSign size={10} />{job.salary}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <div
                className="text-lg font-display font-bold"
                style={{ color: job.icp_score >= 90 ? '#34d399' : job.icp_score >= 80 ? '#38bdf8' : '#fbbf24' }}
              >
                {job.icp_score}
              </div>
              {job.date_posted && <div className="text-[10px] text-muted">{job.date_posted}</div>}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost p-2"
                title="Open job posting"
              >
                <ExternalLink size={14} />
              </a>
              {!job.applied ? (
                <button
                  onClick={() => handleMarkApplied(job.id)}
                  disabled={applying === job.id}
                  className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  {applying === job.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Send size={12} />
                  }
                  Apply
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-signal font-medium">
                  <CheckCircle size={12} /> Applied
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-muted text-sm">No jobs match your filters.</div>
            <button onClick={handleRefresh} disabled={refreshing} className="btn-primary mt-4 text-sm flex items-center gap-2 mx-auto">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh Jobs
            </button>
          </div>
        )}
      </div>

      <div className="card border-accent/20 bg-accent/5">
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white">Clicking Apply opens the role and logs it to Pipeline CRM</div>
            <p className="text-xs text-muted mt-1">
              One-click Greenhouse auto-apply coming soon. For now, the external link opens the application and your CRM is updated automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
