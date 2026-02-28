import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { TARGET_COMPANIES } from '@/lib/companies'

const SERPAPI_KEY = process.env.SERPAPI_KEY

const TOP_COMPANY_IDS = [
  'glean', 'rippling', 'databricks', 'seismic', 'tekion',
  'gong', 'snowflake', 'samsara', 'braze', 'hubspot',
]

// Only these seniority levels
const RELEVANT_TITLES = [
  'enterprise account executive',
  'strategic account executive', 
  'senior account executive',
  'mid-market account executive',
  'enterprise ae',
  'enterprise sales representative',
]

// Block these title keywords — but allow sales-specific VP/Director roles
const BLOCKED_TITLE_KEYWORDS = [
  'ceo', 'cto', 'cfo', 'coo', 'chief',
  'intern', 'coordinator', 'analyst', 'engineer',
  'marketing', 'product manager', 'customer success',
  'software', 'data scientist', 'designer', 'operations',
]

// These sales leadership titles ARE allowed through even if they contain blocked words
const SALES_LEADERSHIP_EXCEPTIONS = [
  'vp of sales', 'vp, sales', 'vice president of sales', 'vice president, sales',
  'director of sales', 'director, sales', 'sales director',
  'regional vp', 'area vice president', 'regional director of sales',
  'vp enterprise', 'director enterprise',
]

// US locations only
const US_INDICATORS = [
  'united states', 'usa', 'us', 'remote', 'anywhere',
  'new york', 'san francisco', 'chicago', 'boston', 'austin',
  'seattle', 'los angeles', 'denver', 'atlanta', 'dallas',
  'san diego', 'miami', 'washington', 'philadelphia', 'houston',
  ', ca', ', ny', ', tx', ', wa', ', il', ', ma', ', co',
  ', ga', ', fl', ', az', ', nc', ', oh', ', va',
]

function isRelevantTitle(title: string): boolean {
  const lower = title.toLowerCase()
  if (SALES_LEADERSHIP_EXCEPTIONS.some(e => lower.includes(e))) return true
  if (BLOCKED_TITLE_KEYWORDS.some(b => lower.includes(b))) return false
  return RELEVANT_TITLES.some(r => lower.includes(r))
}

function isUSLocation(location: string): boolean {
  if (!location) return true // assume remote/US if no location
  const lower = location.toLowerCase()
  // Block clearly non-US
  const nonUS = ['uk', 'united kingdom', 'london', 'canada', 'toronto', 
    'australia', 'sydney', 'india', 'germany', 'france', 'singapore',
    'europe', 'apac', 'emea', 'latam', 'brazil', 'mexico']
  if (nonUS.some(n => lower.includes(n))) return false
  return US_INDICATORS.some(u => lower.includes(u)) || lower.includes('remote')
}

function isGreenhouseUrl(url: string): boolean {
  return url.includes('greenhouse.io') || url.includes('boards.greenhouse')
}

function getDefaultJobs() {
  return TARGET_COMPANIES
    .filter(c => TOP_COMPANY_IDS.includes(c.id))
    .map(company => ({
      company_id: company.id,
      company_name: company.name,
      title: company.targetRoles[0] || 'Enterprise Account Executive',
      location: 'Remote / US',
      remote: company.remoteOk,
      url: company.careersUrl,
      is_greenhouse: false,
      applied: false,
      icp_score: company.icpScore,
      source: 'seeded',
      salary: '$300K-$400K OTE',
    }))
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const refresh = searchParams.get('refresh') === 'true'

    // Return cached if fresh
    const { data: existing } = await supabase
      .from('job_postings')
      .select('*')
      .order('icp_score', { ascending: false })

    if (!refresh && existing && existing.length > 0) {
      const mostRecent = new Date(existing[0].created_at)
      const hoursSince = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        return NextResponse.json({ jobs: existing, cached: true, count: existing.length })
      }
    }

    // Try SerpApi
    if (SERPAPI_KEY) {
      const scrapedJobs: object[] = []
      const companies = TARGET_COMPANIES.filter(c => TOP_COMPANY_IDS.includes(c.id)).slice(0, 4)

      await Promise.all(companies.map(async company => {
        try {
          const q = encodeURIComponent(`Enterprise Account Executive ${company.name} USA`)
          const url = `https://serpapi.com/search.json?engine=google_jobs&q=${q}&api_key=${SERPAPI_KEY}&num=5&location=United+States`
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
          if (!res.ok) return
          const data = await res.json()
          const results = data.jobs_results || []

          for (const job of results) {
            const title = job.title || ''
            const location = job.location || ''
            if (!isRelevantTitle(title)) continue
            if (!isUSLocation(location)) continue

            scrapedJobs.push({
              company_id: company.id,
              company_name: company.name,
              title,
              location,
              remote: location.toLowerCase().includes('remote') || company.remoteOk,
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
        } catch {
          // skip failed company
        }
      }))

      if (scrapedJobs.length > 0) {
        await supabase.from('job_postings').delete().eq('source', 'serpapi')
        const { data: inserted } = await supabase.from('job_postings').insert(scrapedJobs).select()
        const seeded = existing?.filter(j => j.source === 'seeded') || []
        const allJobs = [...(inserted || scrapedJobs), ...seeded]
        return NextResponse.json({ jobs: allJobs, cached: false, count: allJobs.length, scraped: true })
      }
    }

    // Seed if DB empty
    if (!existing || existing.length === 0) {
      const defaultJobs = getDefaultJobs()
      const { data: seeded } = await supabase.from('job_postings').insert(defaultJobs).select()
      return NextResponse.json({ jobs: seeded || defaultJobs, cached: false, count: defaultJobs.length })
    }

    return NextResponse.json({ jobs: existing, cached: true, count: existing.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
