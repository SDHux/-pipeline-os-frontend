import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Database types
export interface DBApplication {
  id: string
  company_id: string
  company_name: string
  role: string
  status: string
  date_applied: string | null
  date_updated: string
  job_url: string | null
  is_greenhouse: boolean
  salary: string | null
  notes: string | null
  outreach_status: string
  next_step: string | null
  next_step_date: string | null
  recruiter: string | null
  score: number
  created_at: string
}

export interface DBContact {
  id: string
  application_id: string
  name: string
  title: string | null
  linkedin_url: string | null
  email: string | null
  outreach_status: string
  last_contact: string | null
  notes: string | null
}

export interface DBJobPosting {
  id: string
  company_id: string
  company_name: string
  title: string
  location: string | null
  remote: boolean
  url: string
  date_posted: string | null
  salary: string | null
  description: string | null
  is_greenhouse: boolean
  applied: boolean
  icp_score: number
  source: string
}

export interface DBOutreachLog {
  id: string
  application_id: string | null
  company: string
  contact_name: string | null
  contact_title: string | null
  type: string
  message: string | null
  status: string
  sent_at: string | null
  response_at: string | null
}
