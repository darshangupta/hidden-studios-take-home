import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-[400px] bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Welcome back</CardTitle>
          <CardDescription className="text-zinc-300">
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
              />
            </div>
            <Button className="w-full bg-white text-black hover:bg-zinc-200" type="submit">
              Sign in with Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 