'use client'

import { useState } from 'react'
import { TARGET_COMPANIES } from '@/lib/companies'
import { ExternalLink, RefreshCw, Filter, CheckCircle, Clock, Send } from 'lucide-react'
import clsx from 'clsx'

// Mock job postings seeded from our company list
const MOCK_JOBS = [
  { id: '1', companyId: 'rippling', companyName: 'Rippling', title: 'Enterprise Account Executive', location: 'Remote', remote: true, url: 'https://www.rippling.com/careers', isGreenhouse: true, applied: true, icpScore: 94, salary: '$180K-$220K base / $360K-$440K OTE', datePosted: '2026-02-20' },
  { id: '2', companyId: 'glean', companyName: 'Glean', title: 'Enterprise Account Executive - West', location: 'Remote / SF', remote: true, url: 'https://www.glean.com/careers', isGreenhouse: true, applied: false, icpScore: 95, salary: '$200K-$250K base / $400K-$500K OTE', datePosted: '2026-02-24' },
  { id: '3', companyId: 'seismic', companyName: 'Seismic', title: 'Strategic Account Executive', location: 'San Diego, CA', remote: true, url: 'https://seismic.com/careers', isGreenhouse: false, applied: true, icpScore: 91, salary: '$175K-$210K base / $350K-$420K OTE', datePosted: '2026-02-18' },
  { id: '4', companyId: 'databricks', companyName: 'Databricks', title: 'Enterprise Account Executive - CPG', location: 'Remote', remote: true, url: 'https://databricks.com/company/careers', isGreenhouse: true, applied: false, icpScore: 93, salary: '$220K-$270K base / $440K-$540K OTE', datePosted: '2026-02-26' },
  { id: '5', companyId: 'tekion', companyName: 'Tekion', title: 'Enterprise Account Executive - Automotive', location: 'Remote', remote: true, url: 'https://tekion.com/careers', isGreenhouse: false, applied: false, icpScore: 87, salary: '$170K-$200K base / $340K-$400K OTE', datePosted: '2026-02-23' },
  { id: '6', companyId: 'gong', companyName: 'Gong.io', title: 'Strategic Account Executive', location: 'Remote', remote: true, url: 'https://gong.io/careers', isGreenhouse: true, applied: false, icpScore: 86, salary: '$180K-$220K base / $360K-$440K OTE', datePosted: '2026-02-21' },
  { id: '7', companyId: 'o9solutions', companyName: 'o9 Solutions', title: 'Enterprise AE - CPG & Retail', location: 'Remote', remote: true, url: 'https://o9solutions.com/careers', isGreenhouse: false, applied: false, icpScore: 88, salary: '$160K-$190K base / $320K-$380K OTE', datePosted: '2026-02-19' },
  { id: '8', companyId: 'project44', companyName: 'project44', title: 'Enterprise Account Executive', location: 'Remote', remote: true, url: 'https://project44.com/careers', isGreenhouse: true, applied: false, icpScore: 85, salary: '$160K-$195K base / $320K-$390K OTE', datePosted: '2026-02-22' },
  { id: '9', companyId: 'snowflake', companyName: 'Snowflake', title: 'Enterprise Account Executive - Retail & CPG', location: 'Remote', remote: true, url: 'https://careers.snowflake.com', isGreenhouse: false, applied: false, icpScore: 88, salary: '$200K-$240K base / $400K-$480K OTE', datePosted: '2026-02-15' },
  { id: '10', companyId: 'informatica', companyName: 'Informatica', title: 'Strategic Account Executive', location: 'Remote', remote: true, url: 'https://informatica.com/company/careers.html', isGreenhouse: false, applied: false, icpScore: 88, salary: '$175K-$210K base / $350K-$420K OTE', datePosted: '2026-02-17' },
]

export default function JobsPage() {
  const [filter, setFilter] = useState<'all' | 'applied' | 'not-applied'>('all')
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [refreshing, setRefreshing] = useState(false)

  const filtered = jobs.filter(j => {
    if (filter === 'applied') return j.applied
    if (filter === 'not-applied') return !j.applied
    return true
  })

  const handleApply = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applied: true } : j))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setRefreshing(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Job Openings</h1>
          <p className="text-muted text-sm mt-1">
            Live roles at your target companies · Updated daily
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Open Roles', val: jobs.length, color: 'text-accent' },
          { label: 'Applied', val: jobs.filter(j => j.applied).length, color: 'text-signal' },
          { label: 'Action Required', val: jobs.filter(j => !j.applied).length, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={clsx('text-3xl font-display font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Roles' },
          { key: 'not-applied', label: 'Not Applied' },
          { key: 'applied', label: 'Applied' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
              filter === f.key
                ? 'bg-accent text-obsidian border-accent'
                : 'bg-surface border-border text-muted hover:text-white hover:border-accent/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {filtered.map((job, i) => (
          <div
            key={job.id}
            className={clsx(
              'card flex items-center gap-4 transition-all duration-200',
              job.applied ? 'opacity-70 hover:opacity-90' : 'hover:border-accent/30'
            )}
          >
            {/* Company initials */}
            <div className="flex-shrink-0 w-10 h-10 bg-elevated rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs font-bold text-muted">
                {job.companyName.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-white">{job.title}</span>
                {job.isGreenhouse && (
                  <span className="badge badge-signal text-[10px]">Greenhouse</span>
                )}
                {job.applied && (
                  <span className="badge badge-accent text-[10px]">Applied ✓</span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {job.companyName} · {job.location}
              </div>
              {job.salary && (
                <div className="text-xs text-signal font-mono mt-1">{job.salary}</div>
              )}
            </div>

            {/* Score + Date */}
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div
                className="text-lg font-display font-bold"
                style={{ color: job.icpScore >= 90 ? '#00ff88' : job.icpScore >= 80 ? '#00d4ff' : '#ffaa00' }}
              >
                {job.icpScore}
              </div>
              <div className="text-[10px] text-muted">{job.datePosted}</div>
            </div>

            {/* Actions */}
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
                  onClick={() => handleApply(job.id)}
                  className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <Send size={12} />
                  Apply
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-signal font-medium">
                  <CheckCircle size={12} />
                  Applied
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual apply queue note */}
      <div className="card border-accent/20 bg-accent/5">
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white">Non-Greenhouse Roles — Action Required</div>
            <p className="text-xs text-muted mt-1">
              {jobs.filter(j => !j.isGreenhouse && !j.applied).length} roles above require manual application. 
              Click the external link icon to open the careers page directly. These are tracked in your pipeline automatically once you mark them applied.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
