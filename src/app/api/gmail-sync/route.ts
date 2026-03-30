// @ts-nocheck
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'

const anthropic = new Anthropic()

export async function POST() {
  try {
    const supabase = createServerClient()

    // Get all active applications with company names
    const { data: apps, error: appsError } = await supabase
      .from('pipeline_applications')
      .select('id, company_name, stage, contact_email')
      .not('stage', 'in', '("Closed - No","Closed - Withdrew")')

    if (appsError) throw appsError
    if (!apps || apps.length === 0) {
      return NextResponse.json({ updated: 0, message: 'No active applications to sync' })
    }

    // Build search query for Gmail — look for emails from/about these companies
    const companyNames = apps.map((a: { company_name: string }) => a.company_name)
    const searchQuery = companyNames
      .map((name: string) => `from:*${name.toLowerCase().replace(/\s+/g, '')}* OR subject:"${name}"`)
      .join(' OR ')

    // Use Claude with Gmail MCP to search emails
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are a job search assistant. Search Gmail for emails related to job applications and return structured JSON only. No explanation, just JSON.`,
      messages: [{
        role: 'user',
        content: `Search my Gmail inbox for any emails in the last 60 days related to job applications at these companies: ${companyNames.join(', ')}.

For each relevant email thread found, return JSON like this:
{
  "emails": [
    {
      "company_name": "exact company name from list",
      "subject": "email subject",
      "from": "sender email",
      "date": "ISO date string",
      "classification": "interview_request|rejection|follow_up|offer|ghosted|screening",
      "summary": "1-2 sentence plain English summary of what the email says",
      "next_step": "specific next step if any, or null",
      "suggested_stage": "Research|Applied|Screening|Interview|Final Round|Offer|Closed - No"
    }
  ]
}

Search for emails from these companies or with these company names in the subject. If no relevant emails found, return {"emails": []}.`
      }],
      mcp_servers: [{
        type: 'url' as const,
        url: 'https://gmail.mcp.claude.com/mcp',
        name: 'gmail'
      }]
    })

    // Parse Claude's response
    const content = response.content.find((b: { type: string }) => b.type === 'text')
    if (!content || content.type !== 'text') {
      return NextResponse.json({ updated: 0, message: 'No email data returned' })
    }

    let emailData: { emails: Array<{
      company_name: string
      subject: string
      from: string
      date: string
      classification: string
      summary: string
      next_step: string | null
      suggested_stage: string
    }> }

    try {
      const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim()
      emailData = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ updated: 0, message: 'Could not parse email data' })
    }

    if (!emailData.emails || emailData.emails.length === 0) {
      return NextResponse.json({ updated: 0, message: 'No relevant emails found' })
    }

    // Update pipeline applications based on emails found
    let updatedCount = 0
    for (const email of emailData.emails) {
      // Find matching application
      const app = apps.find((a: { company_name: string }) =>
        a.company_name.toLowerCase() === email.company_name.toLowerCase()
      )
      if (!app) continue

      // Only update stage if it's a progression (don't downgrade)
      const stageOrder = ['Research', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer', 'Closed - No', 'Closed - Withdrew']
      const currentIdx = stageOrder.indexOf(app.stage)
      const suggestedIdx = stageOrder.indexOf(email.suggested_stage)
      const newStage = suggestedIdx > currentIdx ? email.suggested_stage : app.stage

      const { error: updateError } = await supabase
        .from('pipeline_applications')
        .update({
          stage: newStage,
          last_email_date: email.date,
          last_email_subject: email.subject,
          last_email_summary: email.summary,
          next_step: email.next_step || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', app.id)

      if (!updateError) updatedCount++
    }

    return NextResponse.json({
      updated: updatedCount,
      emailsFound: emailData.emails.length,
      message: `Found ${emailData.emails.length} relevant email(s), updated ${updatedCount} application(s)`
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Gmail sync error:', message)
    return NextResponse.json({ error: message, updated: 0 }, { status: 500 })
  }
}
