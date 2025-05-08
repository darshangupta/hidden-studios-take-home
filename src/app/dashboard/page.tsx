"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseBrowser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  // Profile state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

  async function handleSave(e: React.FormEvent) {
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
            <CardDescription className="text-zinc-300">Enter a map code to see stats and forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="mapCode" className="text-zinc-200">Map Code</Label>
                <Input id="mapCode" placeholder="e.g. 6155-1398-4059" disabled className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400" />
              </div>
              <Button type="submit" disabled className="bg-white text-black hover:bg-zinc-200">Fetch Stats</Button>
            </form>
            <Separator />
            <div className="mt-6 text-zinc-400 text-center">
              Map stats and forecast will appear here.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 