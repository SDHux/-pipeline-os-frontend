'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  PieChart,
  Send,
  Bot,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  User,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { href: '/companies', icon: Building2, label: 'Companies', section: 'main' },
  { href: '/jobs', icon: Briefcase, label: 'Job Openings', section: 'main' },
  { href: '/applications', icon: PieChart, label: 'Pipeline CRM', section: 'main' },
  { href: '/outreach', icon: Send, label: 'Outreach', section: 'main' },
  { href: '/assistant', icon: Bot, label: 'AI Assistant', section: 'tools' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-obsidian overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col bg-void border-r border-border transition-all duration-300 ease-in-out relative z-20',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={clsx('flex items-center h-16 px-4 border-b border-border', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex-shrink-0 w-8 h-8 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center">
            <Target size={16} className="text-accent" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-display font-bold text-white leading-none">Pipeline OS</div>
              <div className="text-[10px] text-muted mt-0.5 font-mono">v1.0</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <div className="section-label px-3 pt-3 pb-2">Workspace</div>
          )}
          {NAV.filter(n => n.section === 'main').map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <div className={clsx(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                collapsed ? 'justify-center' : 'gap-3',
                pathname.startsWith(href)
                  ? 'bg-elevated text-white border-l-2 border-accent pl-[10px]'
                  : 'text-muted hover:bg-elevated hover:text-white'
              )}>
                <Icon size={16} className={pathname.startsWith(href) ? 'text-accent' : ''} />
                {!collapsed && <span>{label}</span>}
              </div>
            </Link>
          ))}

          {!collapsed && (
            <div className="section-label px-3 pt-5 pb-2">AI Tools</div>
          )}
          {collapsed && <div className="my-2 border-t border-border/50" />}
          {NAV.filter(n => n.section === 'tools').map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <div className={clsx(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                collapsed ? 'justify-center' : 'gap-3',
                pathname.startsWith(href)
                  ? 'bg-elevated text-white border-l-2 border-accent pl-[10px]'
                  : 'text-muted hover:bg-elevated hover:text-white'
              )}>
                <Icon size={16} className={clsx('flex-shrink-0', pathname.startsWith(href) ? 'text-accent' : '')} />
                {!collapsed && <span>{label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className={clsx('p-3 border-t border-border', collapsed && 'flex justify-center')}>
          {collapsed ? (
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <User size={14} className="text-accent" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-accent">MH</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">Mark Huckins</div>
                <div className="text-[10px] text-muted truncate">Enterprise AE</div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-elevated border border-border rounded-full flex items-center justify-center text-muted hover:text-white hover:border-accent/50 transition-all duration-200 z-30"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-grid bg-obsidian">
        {/* Top bar */}
        <div className="h-16 border-b border-border bg-void/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-accent" />
            <span className="text-xs font-mono text-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-signal/10 border border-signal/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse-slow" />
              <span className="text-xs font-mono text-signal">Live</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
