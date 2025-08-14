"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Gamepad2, Joystick, Wrench, Smartphone, Plus, TrendingUp, Activity, Cpu, Package } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Stats {
  consoles: number
  emulators: number
  games: number
  tools: number
  handhelds: number
  customFirmware: number
  cfwApps: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    consoles: 0,
    emulators: 0,
    games: 0,
    tools: 0,
    handhelds: 0,
    customFirmware: 0,
    cfwApps: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          consolesResult,
          emulatorsResult,
          gamesResult,
          toolsResult,
          handheldsResult,
          customFirmwareResult,
          cfwAppsResult,
        ] = await Promise.all([
          supabase.from("consoles").select("id", { count: "exact", head: true }),
          supabase.from("emulators").select("id", { count: "exact", head: true }),
          supabase.from("games").select("id", { count: "exact", head: true }),
          supabase.from("tools").select("id", { count: "exact", head: true }),
          supabase.from("handhelds").select("id", { count: "exact", head: true }),
          supabase.from("custom_firmware").select("id", { count: "exact", head: true }),
          supabase.from("cfw_apps").select("id", { count: "exact", head: true }),
        ])

        setStats({
          consoles: consolesResult.count || 0,
          emulators: emulatorsResult.count || 0,
          games: gamesResult.count || 0,
          tools: toolsResult.count || 0,
          handhelds: handheldsResult.count || 0,
          customFirmware: customFirmwareResult.count || 0,
          cfwApps: cfwAppsResult.count || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Consoles",
      value: stats.consoles,
      icon: Monitor,
      href: "/admin/consoles",
      color: "text-blue-600",
    },
    {
      title: "Emulators",
      value: stats.emulators,
      icon: Gamepad2,
      href: "/admin/emulators",
      color: "text-green-600",
    },
    {
      title: "Games",
      value: stats.games,
      icon: Joystick,
      href: "/admin/games",
      color: "text-purple-600",
    },
    {
      title: "Tools",
      value: stats.tools,
      icon: Wrench,
      href: "/admin/tools",
      color: "text-orange-600",
    },
    {
      title: "Handhelds",
      value: stats.handhelds,
      icon: Smartphone,
      href: "/admin/handhelds",
      color: "text-pink-600",
    },
    {
      title: "Custom Firmware",
      value: stats.customFirmware,
      icon: Cpu,
      href: "/admin/custom-firmware",
      color: "text-indigo-600",
    },
    {
      title: "CFW Apps",
      value: stats.cfwApps,
      icon: Package,
      href: "/admin/cfw-apps",
      color: "text-teal-600",
    },
  ]

  const quickActions = [
    {
      title: "Add Console",
      description: "Add a new gaming console",
      href: "/admin/consoles/new",
      icon: Monitor,
    },
    {
      title: "Add Emulator",
      description: "Add a new emulator",
      href: "/admin/emulators/new",
      icon: Gamepad2,
    },
    {
      title: "Add Game",
      description: "Add a new game",
      href: "/admin/games/new",
      icon: Joystick,
    },
    {
      title: "Add Tool",
      description: "Add a new tool",
      href: "/admin/tools/new",
      icon: Wrench,
    },
    {
      title: "Add Handheld",
      description: "Add a new handheld device",
      href: "/admin/handhelds/new",
      icon: Smartphone,
    },
    {
      title: "Add Custom Firmware",
      description: "Add new custom firmware",
      href: "/admin/custom-firmware/new",
      icon: Cpu,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Emulators.wtf admin dashboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <Link href={stat.href} className="hover:underline">
                    View all →
                  </Link>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Content Items</span>
                <Badge variant="secondary">
                  {loading
                    ? "..."
                    : (
                        stats.consoles +
                        stats.emulators +
                        stats.games +
                        stats.tools +
                        stats.handhelds +
                        stats.customFirmware +
                        stats.cfwApps
                      ).toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hardware Items</span>
                <Badge variant="outline">{loading ? "..." : (stats.consoles + stats.handhelds).toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Software Items</span>
                <Badge variant="outline">
                  {loading
                    ? "..."
                    : (
                        stats.emulators +
                        stats.games +
                        stats.tools +
                        stats.customFirmware +
                        stats.cfwApps
                      ).toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">No recent activity to display</div>
              <div className="text-xs text-muted-foreground">
                Activity tracking will be implemented in a future update
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
