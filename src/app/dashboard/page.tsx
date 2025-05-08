import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="bg-black min-h-screen w-full">
      <main className="max-w-2xl mx-auto py-10 space-y-8">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-zinc-300">Update your display name and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-zinc-200">Display Name</Label>
                <Input id="displayName" placeholder="Your display name" disabled className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-zinc-200">Bio</Label>
                <Textarea id="bio" placeholder="A short bio (max 200 chars)" maxLength={200} disabled className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400" />
              </div>
              <Button type="submit" disabled className="bg-white text-black hover:bg-zinc-200">Save</Button>
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