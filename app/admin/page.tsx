"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DashboardStats {
  handhelds: number
  customFirmware: number
  emulators: number
  games: number
  consoles: number
  tools: number
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] AdminDashboard mounted successfully")
    setMounted(true)
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClientComponentClient()

      const [
        { count: handhelds },
        { count: customFirmware },
        { count: emulators },
        { count: games },
        { count: consoles },
        { count: tools },
      ] = await Promise.all([
        supabase.from("handhelds").select("*", { count: "exact", head: true }),
        supabase.from("custom_firmware").select("*", { count: "exact", head: true }),
        supabase.from("emulators").select("*", { count: "exact", head: true }),
        supabase.from("games").select("*", { count: "exact", head: true }),
        supabase.from("consoles").select("*", { count: "exact", head: true }),
        supabase.from("tools").select("*", { count: "exact", head: true }),
      ])

      setStats({
        handhelds: handhelds || 0,
        customFirmware: customFirmware || 0,
        emulators: emulators || 0,
        games: games || 0,
        consoles: consoles || 0,
        tools: tools || 0,
      })
    } catch (err) {
      console.error("[v0] Error fetching dashboard stats:", err)
      setError(`Database error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Admin Dashboard Error</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!mounted || loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">⏳ Loading Admin Dashboard...</h1>
        <p>Fetching database statistics...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📊 Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your emulation database content</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🎮 Handhelds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.handhelds || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">⚙️ Custom Firmware</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customFirmware || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🕹️ Emulators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.emulators || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🎯 Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.games || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📺 Consoles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.consoles || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🔧 Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tools || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔍 Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats && Object.values(stats).every((count) => count === 0) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ All tables appear to be empty. You may need to add sample data or run database migrations.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">✅ Database connection successful and tables contain data.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
