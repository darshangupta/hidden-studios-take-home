import { NextRequest, NextResponse } from 'next/server'

// Helper to extract numeric ID from Fortnite.gg island page
async function getNumericId(mapCode: string): Promise<string> {
  const res = await fetch(`https://fortnite.gg/island?code=${encodeURIComponent(mapCode)}`)
  if (!res.ok) throw new Error('Failed to fetch island page')
  const html = await res.text()
  // Try to find data-id="..." in the HTML (e.g., <div id='chart-week' ... data-id='16'>)
  const match = html.match(/data-id=['"]?(\d+)["']?/) // first numeric data-id
  if (match) return match[1]
  throw new Error('Could not find numeric ID for map code')
}

// Helper to fetch and aggregate Fortnite.gg data using numeric ID
async function fetchFortniteMapStatsById(numericId: string) {
  const url = `https://fortnite.gg/player-count-graph?range=1m&id=${numericId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch from Fortnite.gg')
  const json = await res.json()
  if (!json.success || !json.data) throw new Error('Invalid response from Fortnite.gg')
  const { start, step, values } = json.data
  // Group by day
  const dayBuckets: Record<string, number[]> = {}
  values.forEach((count: number, i: number) => {
    const timestamp = start + i * step
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10) // YYYY-MM-DD
    if (!dayBuckets[date]) dayBuckets[date] = []
    dayBuckets[date].push(count)
  })
  // Aggregate
  const result = Object.entries(dayBuckets).map(([date, counts]) => ({
    date,
    peak_players: Math.max(...counts),
    avg_players: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length),
  }))
  // Sort by date ascending
  result.sort((a, b) => a.date.localeCompare(b.date))
  return result
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mapCode = searchParams.get('map_code')
  if (!mapCode) {
    return NextResponse.json({ error: 'Missing map_code parameter' }, { status: 400 })
  }
  try {
    const numericId = await getNumericId(mapCode)
    const data = await fetchFortniteMapStatsById(numericId)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch map stats' }, { status: 500 })
  }
} 