'use client'

import { useState, useMemo } from 'react'
import { TARGET_COMPANIES, CompanyCategory } from '@/lib/companies'
import { Search, ExternalLink, Filter, Building2, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES: (CompanyCategory | 'All')[] = [
  'All',
  'AI/ML Platform',
  'Data Infrastructure',
  'Security & Identity',
  'GTM & Revenue Tech',
  'Logistics & Supply Chain',
  'Automotive Software',
  'Workflow Automation',
]

const CAT_COLORS: Record<string, string> = {
  'AI/ML Platform': 'text-accent border-accent/30 bg-accent/5',
  'Data Infrastructure': 'text-signal border-signal/30 bg-signal/5',
  'Security & Identity': 'text-danger border-danger/30 bg-danger/5',
  'GTM & Revenue Tech': 'text-warning border-warning/30 bg-warning/5',
  'Logistics & Supply Chain': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  'Automotive Software': 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  'Workflow Automation': 'text-pink-400 border-pink-400/30 bg-pink-400/5',
}

function IcpScore({ score }: { score: number }) {
  const color = score >= 90 ? '#00ff88' : score >= 80 ? '#00d4ff' : score >= 70 ? '#ffaa00' : '#6b6b8a'
  const label = score >= 90 ? 'Excellent' : score >= 80 ? 'Strong' : score >= 70 ? 'Good' : 'Fair'
  return (
    <div className="flex flex-col items-center">
      <div
        className="text-2xl font-display font-bold leading-none"
        style={{ color }}
      >
        {score}
      </div>
      <div className="text-[10px] font-mono mt-0.5" style={{ color, opacity: 0.7 }}>{label}</div>
    </div>
  )
}

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CompanyCategory | 'All'>('All')
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'stage'>('score')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...TARGET_COMPANIES]
    if (category !== 'All') list = list.filter(c => c.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.targetRoles.some(r => r.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'score') list.sort((a, b) => b.icpScore - a.icpScore)
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [search, category, sortBy])

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Company Intelligence</h1>
          <p className="text-muted text-sm mt-1">
            {TARGET_COMPANIES.length} target companies across 7 verticals
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-muted">Showing</div>
          <div className="text-lg font-display font-bold text-accent">{filtered.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search companies, roles, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="input appearance-none pr-8 cursor-pointer"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'score' | 'name' | 'stage')}
          >
            <option value="score">Sort: ICP Score</option>
            <option value="name">Sort: Name</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
              category === cat
                ? 'bg-accent text-obsidian border-accent'
                : 'bg-surface border-border text-muted hover:border-accent/40 hover:text-white'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((company, i) => (
          <div
            key={company.id}
            className="card hover:border-accent/30 transition-all duration-200 cursor-pointer"
            style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
          >
            <div
              className="flex items-center gap-4"
              onClick={() => setExpanded(expanded === company.id ? null : company.id)}
            >
              {/* Logo placeholder */}
              <div className="flex-shrink-0 w-10 h-10 bg-elevated rounded-xl flex items-center justify-center border border-border">
                <span className="text-sm font-bold text-muted">
                  {company.name.slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-semibold text-white">{company.name}</span>
                  <span className={clsx('badge text-[10px]', CAT_COLORS[company.category] || 'badge-muted')}>
                    {company.category}
                  </span>
                  <span className="badge badge-muted text-[10px]">{company.fundingStage}</span>
                  {company.notes && (
                    <span className="badge badge-signal text-[10px]">Priority</span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1 truncate">{company.description}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {company.totalRaised && (
                    <span className="text-[10px] font-mono text-muted">Raised: <span className="text-white">{company.totalRaised}</span></span>
                  )}
                  {company.arrEstimate && (
                    <span className="text-[10px] font-mono text-muted">ARR: <span className="text-signal">{company.arrEstimate}</span></span>
                  )}
                  {company.employees && (
                    <span className="text-[10px] font-mono text-muted">Employees: <span className="text-white">{company.employees}</span></span>
                  )}
                  {company.hq && (
                    <span className="text-[10px] font-mono text-muted">{company.hq}</span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 flex items-center gap-4">
                <IcpScore score={company.icpScore} />
                <ChevronDown
                  size={14}
                  className={clsx('text-muted transition-transform duration-200', expanded === company.id && 'rotate-180')}
                />
              </div>
            </div>

            {/* Expanded */}
            {expanded === company.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(company.icpBreakdown).map(([key, val]) => {
                    const labels: Record<string, string> = {
                      fundingStage: 'Funding Stage',
                      growthRate: 'Growth Rate',
                      activelyHiring: 'Actively Hiring',
                      categoryMatch: 'Category Match',
                      remoteOk: 'Remote OK',
                      fortune1000Buyers: 'F1000 Buyers',
                      compSize: 'Location Bonus',
                    }
                    const max: Record<string, number> = {
                      fundingStage: 20, growthRate: 20, activelyHiring: 20,
                      categoryMatch: 15, remoteOk: 10, fortune1000Buyers: 10, compSize: 9,
                    }
                    const pct = (val / (max[key] || 20)) * 100
                    return (
                      <div key={key} className="bg-surface rounded-lg p-2">
                        <div className="text-[10px] text-muted mb-1">{labels[key] || key}</div>
                        <div className="h-1 bg-border rounded-full">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-xs font-mono text-white mt-1">{val}/{max[key] || 20}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.targetRoles.map(role => (
                    <span key={role} className="badge badge-accent">{role}</span>
                  ))}
                </div>

                {company.notes && (
                  <div className="text-xs text-warning/80 bg-warning/5 border border-warning/20 rounded-lg p-3">
                    💡 {company.notes}
                  </div>
                )}

                <div className="flex gap-2">
                  <a
                    href={company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 text-xs"
                    onClick={e => e.stopPropagation()}
                  >
                    View Careers <ExternalLink size={12} />
                  </a>
                  {company.linkedinUrl && (
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2 text-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      LinkedIn <ExternalLink size={12} />
                    </a>
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
