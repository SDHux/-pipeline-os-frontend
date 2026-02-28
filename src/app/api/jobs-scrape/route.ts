import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { TARGET_COMPANIES } from '@/lib/companies'

const SERPAPI_KEY = process.env.SERPAPI_KEY

const TARGET_ROLES = [
  'Enterprise Account Executive',
  'Strategic Account Executive',
  'Senior Account Executive',
  'Mid-Market Account Executive',
]

// Top companies to scrape (by ICP score)
const TOP_COMPANY_IDS = [
  'glean', 'rippling', 'databricks', 'seismic', 'o9solutions',
  'informatica', 'tekion', 'gong', 'project44', 'snowflake',
  'samsara', 'braze', 'hubspot', 'workato', 'netskope',
]

async function searchJobsForCompany(companyName: string, role: string) {
  if (!SERPAPI_KEY) return []

  const query = `${role} ${companyName} site:greenhouse.io OR site:lever.co OR site:linkedin.com/jobs`
  const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(`${role} at ${companyName}`)}&api_key=${SERPAPI_KEY}&num=5`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.jobs_results || []
  } catch {
    return []
  }
}

function isRelevantRole(title: string): boolean {
  const lower = title.toLowerCase()
  return (
    lower.includes('account executive') ||
    lower.includes('enterprise ae') ||
    lower.includes('strategic ae') ||
    lower.includes('enterprise sales')
  ) && !lower.includes('manager') && !lower.includes('director')
}

function isGreenhouseUrl(url: string): boolean {
  return url.includes('greenhouse.io') || url.includes('boards.greenhouse')
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const refresh = searchParams.get('refresh') === 'true'

    // If not forcing refresh, return cached jobs from DB
    if (!refresh) {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // If we have recent jobs (less than 24h old), return them
      if (data && data.length > 0) {
        const mostRecent = new Date(data[0].created_at)
        const hoursSince = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60)
        if (hoursSince < 24) {
          return NextResponse.json({ jobs: data, cached: true, count: data.length })
        }
      }
    }

    // No SerpApi key — return seeded jobs from DB or defaults
    if (!SERPAPI_KEY) {
      const { data } = await supabase.from('job_postings').select('*').order('icp_score', { ascending: false })
      if (data && data.length > 0) {
        return NextResponse.json({ jobs: data, cached: true, count: data.length })
      }

      // Seed default jobs if DB is empty
      const defaultJobs = TARGET_COMPANIES
        .filter(c => TOP_COMPANY_IDS.includes(c.id))
        .slice(0, 12)
        .map(company => ({
          company_id: company.id,
          company_name: company.name,
          title: company.targetRoles[0] || 'Enterprise Account Executive',
          location: company.hq || 'Remote',
          remote: company.remoteOk,
          url: company.careersUrl,
          is_greenhouse: false,
          applied: false,
          icp_score: company.icpScore,
          source: 'seeded',
          salary: '$300K-$400K OTE',
        }))

      const { data: seeded } = await supabase.from('job_postings').insert(defaultJobs).select()
      return NextResponse.json({ jobs: seeded || defaultJobs, cached: false, count: defaultJobs.length })
    }

    // Run scraping with SerpApi
    const scrapedJobs = []
    const targetCompanies = TARGET_COMPANIES.filter(c => TOP_COMPANY_IDS.includes(c.id))

    for (const company of targetCompanies.slice(0, 8)) {
      for (const role of TARGET_ROLES.slice(0, 2)) {
        const results = await searchJobsForCompany(company.name, role)
        for (const job of results) {
          if (isRelevantRole(job.title)) {
            scrapedJobs.push({
              company_id: company.id,
              company_name: company.name,
              title: job.title,
              location: job.location || 'Remote',
              remote: job.location?.toLowerCase().includes('remote') || company.remoteOk,
              url: job.apply_options?.[0]?.link || company.careersUrl,
              date_posted: job.detected_extensions?.posted_at || null,
              salary: job.detected_extensions?.salary || null,
              description: job.description?.slice(0, 500) || null,
              is_greenhouse: isGreenhouseUrl(job.apply_options?.[0]?.link || ''),
              applied: false,
              icp_score: company.icpScore,
              source: 'serpapi',
            })
          }
        }
        // Rate limit
        await new Promise(r => setTimeout(r, 500))
      }
    }

    if (scrapedJobs.length > 0) {
      // Clear old scraped jobs and insert new ones
      await supabase.from('job_postings').delete().eq('source', 'serpapi')
      const { data: inserted } = await supabase.from('job_postings').insert(scrapedJobs).select()
      return NextResponse.json({ jobs: inserted || scrapedJobs, cached: false, count: scrapedJobs.length, scraped: true })
    }

    return NextResponse.json({ jobs: [], cached: false, count: 0 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
