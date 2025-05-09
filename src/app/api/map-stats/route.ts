import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mapCode = searchParams.get('map_code')
  if (!mapCode) {
    return NextResponse.json({ error: 'Missing map_code parameter' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('map_stats')
    .select('date, peak_players, avg_players')
    .eq('map_code', mapCode)
    .order('date', { ascending: true })
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch map stats' }, { status: 500 })
  }
  return NextResponse.json({ data })
} 