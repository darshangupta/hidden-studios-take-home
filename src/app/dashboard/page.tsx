"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseBrowser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  linearRegressionForecast,
  movingAverageForecast,
  seasonalNaiveForecast,
} from "@/lib/forecast"

type MapStat = {
  date: string;
  peak_players: number;
  avg_players: number;
};

export default function DashboardPage() {
  // Profile state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Fortnite map stats state
  const [mapCode, setMapCode] = useState("")
  const [mapStats, setMapStats] = useState<MapStat[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState("")
  const [forecasts, setForecasts] = useState<{
    linear: number[];
    moving: number[];
    seasonal: number[];
  } | null>(null)

  const [showHistorical, setShowHistorical] = useState(false)

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ""
  }

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError("")
      setSuccess(false)
      try {
        const accessToken = await getAccessToken()
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Failed to load profile")
        } else {
          const data = await res.json()
          setDisplayName(data.display_name || "")
          setBio(data.bio || "")
        }
      } catch (e) {
        setError("Failed to load profile")
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)
    const accessToken = await getAccessToken()
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ displayName, bio }),
    })
    if (!res.ok) {
      let errorMsg = "Failed to save profile"
      try {
        const data = await res.json()
        errorMsg = data.error || errorMsg
      } catch {
        // If parsing fails, keep the generic error
      }
      setError(errorMsg)
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  async function handleFetchStats(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatsLoading(true)
    setStatsError("")
    setMapStats([])
    setForecasts(null)
    try {
      const res = await fetch(`/api/map-stats?map_code=${encodeURIComponent(mapCode)}`)
      const json = await res.json()
      if (!res.ok) {
        setStatsError(json.error || "Failed to fetch map stats")
      } else if (!json.data || json.data.length === 0) {
        setStatsError("Invalid Map Code")
      } else {
        setMapStats(json.data)
        // Extract peak_players for forecasting
        const history = json.data.map((row: MapStat) => row.peak_players)
        setForecasts({
          linear: linearRegressionForecast(history, 30),
          moving: movingAverageForecast(history, 30),
          seasonal: seasonalNaiveForecast(history, 30),
        })
      }
    } catch {
      setStatsError("Failed to fetch map stats")
    }
    setStatsLoading(false)
  }

  function ForecastChart({ forecastData }: { forecastData: any[] }) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Forecast Chart (next 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={600} height={300} data={forecastData} style={{ maxWidth: "100%" }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="linear" stroke="#8884d8" name="Linear Regression" />
            <Line type="monotone" dataKey="moving" stroke="#82ca9d" name="Moving Avg" />
            <Line type="monotone" dataKey="seasonal" stroke="#ffc658" name="Seasonal Naive" />
          </LineChart>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="bg-black min-h-screen w-full">
      <main className="max-w-2xl mx-auto py-10 space-y-8">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-zinc-300">Update your display name and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-zinc-200">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Your display name"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-zinc-200">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="A short bio (max 200 chars)"
                  maxLength={200}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  disabled={loading || saving}
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {success && <div className="text-green-400 text-sm">Profile saved!</div>}
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200" disabled={loading || saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Fortnite Map Insights</CardTitle>
            <CardDescription className="text-zinc-300">Enter a map code to see stats and forecast. Data is synthetic/mock.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 mb-6" onSubmit={handleFetchStats}>
              <div className="space-y-2">
                <Label htmlFor="mapCode" className="text-zinc-200">Map Code</Label>
                <Input
                  id="mapCode"
                  placeholder="e.g. 6155-1398-4059"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  value={mapCode}
                  onChange={e => setMapCode(e.target.value)}
                  disabled={statsLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-white text-black hover:bg-zinc-200" disabled={statsLoading || !mapCode}>
                  {statsLoading ? "Fetching..." : "Fetch Stats"}
                </Button>
                <Button type="button" className="bg-white text-black hover:bg-zinc-200" disabled={statsLoading || !mapStats.length} onClick={() => setShowHistorical(v => !v)}>
                  {showHistorical ? "Hide Historical Data" : "Fetch Historical Data"}
                </Button>
              </div>
            </form>
            <Separator />
            {statsError && <div className="text-red-400 text-sm mt-4">{statsError}</div>}
            {/* Historical Data Table (toggle) */}
            {showHistorical && mapStats.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-zinc-300 text-sm">Historical Peak Players (last {mapStats.length} days):</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-zinc-400">Date</TableHead>
                      <TableHead className="text-zinc-400">Peak Players</TableHead>
                      <TableHead className="text-zinc-400">Avg Players</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mapStats.slice().reverse().map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.peak_players}</TableCell>
                        <TableCell>{row.avg_players}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {forecasts && (
              <div className="mt-8">
                <div className="mb-2 text-zinc-300 text-sm">
                  <span className="font-semibold">Forecast (next 30 days):</span>
                  <ul className="list-disc ml-6 mt-2 text-xs text-zinc-400 space-y-1">
                    <li><b>Linear Regression:</b> Captures the overall trend in player counts. If the map is gaining or losing popularity, this method will show a rising or falling forecast based on the best-fit line through the historical data.</li>
                    <li><b>Moving Average:</b> Smooths out short-term fluctuations by averaging the last 7 days. This produces a flat forecast, representing a &quot;typical&quot; value, but ignores trends and seasonality.</li>
                    <li><b>Seasonal Naive:</b> Repeats the last week&apos;s pattern for the next 30 days, capturing weekly cycles (e.g., weekends). Useful for maps with strong weekly seasonality.</li>
                  </ul>
                  <div className="mt-1 text-xs text-zinc-500">Data is synthetic/mock for demonstration only.</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-zinc-400">Day</TableHead>
                      <TableHead className="text-zinc-400">Linear Regression</TableHead>
                      <TableHead className="text-zinc-400">Moving Avg</TableHead>
                      <TableHead className="text-zinc-400">Seasonal Naive</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts.linear.map((val, i) => (
                      <TableRow key={i}>
                        <TableCell>Day {i + 1}</TableCell>
                        <TableCell>{val}</TableCell>
                        <TableCell>{forecasts.moving[i]}</TableCell>
                        <TableCell>{forecasts.seasonal[i]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Forecast Chart below the table */}
                <ForecastChart
                  forecastData={forecasts.linear.map((val, i) => ({
                    day: `Day ${i + 1}`,
                    linear: val,
                    moving: forecasts.moving[i],
                    seasonal: forecasts.seasonal[i],
                  }))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 