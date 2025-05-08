import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

function getSupabaseWithToken(token: string | undefined) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: token ? `Bearer ${token}` : '' } },
  })
  return supabase
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const accessToken = authHeader?.split(' ')[1]
  const supabase = getSupabaseWithToken(accessToken)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, bio, created_at, updated_at')
    .eq('id', user.id)
    .single()
  if (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const accessToken = authHeader?.split(' ')[1]
  const supabase = getSupabaseWithToken(accessToken)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  const body = await req.json()
  const { displayName, bio } = body
  if (bio && bio.length > 200) {
    return NextResponse.json({ error: 'Bio must be 200 characters or less' }, { status: 400 })
  }
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: displayName,
    bio,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
} 