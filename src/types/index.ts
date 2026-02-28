export type ApplicationStatus =
  | 'Research'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Final Round'
  | 'Offer'
  | 'Closed - No'
  | 'Closed - Withdrew'

export type OutreachStatus =
  | 'Not Started'
  | 'Connection Sent'
  | 'Connected'
  | 'Message Sent'
  | 'Responded'
  | 'Meeting Booked'

export interface Application {
  id: string
  companyId: string
  companyName: string
  role: string
  status: ApplicationStatus
  dateApplied?: string
  dateUpdated: string
  jobUrl?: string
  greenhouse?: boolean
  salary?: string
  notes?: string
  contacts: Contact[]
  outreachStatus: OutreachStatus
  nextStep?: string
  nextStepDate?: string
  recruiter?: string
}

export interface Contact {
  id: string
  name: string
  title: string
  linkedinUrl?: string
  email?: string
  outreachStatus: OutreachStatus
  lastContact?: string
  notes?: string
}

export interface JobPosting {
  id: string
  companyId: string
  companyName: string
  title: string
  location: string
  remote: boolean
  url: string
  datePosted?: string
  salary?: string
  description?: string
  isGreenhouse: boolean
  applied: boolean
  icpScore: number
}

export interface DashboardStats {
  totalTargetCompanies: number
  activeApplications: number
  interviews: number
  responseRate: number
  avgIcpScore: number
  thisWeekApplied: number
}
