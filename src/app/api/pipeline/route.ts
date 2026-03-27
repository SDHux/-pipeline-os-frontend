import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('pipeline_applications')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ applications: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('pipeline_applications')
      .insert({
        company_name: body.company_name,
        role: body.role,
        stage: body.stage || 'Research',
        date_applied: body.date_applied || null,
        salary: body.salary || null,
        notes: body.notes || null,
        icp_score: body.icp_score || null,
        contact_name: body.contact_name || null,
        contact_title: body.contact_title || null,
        contact_email: body.contact_email || null,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ application: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('pipeline_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ application: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const supabase = createServerClient()
    const { error } = await supabase.from('pipeline_applications').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
