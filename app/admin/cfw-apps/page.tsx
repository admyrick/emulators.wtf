"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ExternalLink, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CfwApp {
  id: string
  slug: string
  app_name: string
  app_url: string | null
  description: string | null
  requirements: string | null
  app_type: string | null
  category: string | null
  image_url: string | null
  last_updated: string | null
  created_at: string
}

export default function CfwAppsAdminPage() {
  const { toast } = useToast()
  const [apps, setApps] = useState<CfwApp[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    recentlyUpdated: 0,
  })

  useEffect(() => {
    loadApps()
    loadStats()
  }, [])

  async function loadApps() {
    try {
      const { data, error } = await supabase.from("cfw_apps").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setApps(data || [])
    } catch (error: any) {
      console.error("Error loading CFW apps:", error)
      toast({
        title: "Error",
        description: "Failed to load CFW apps",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const { data, error } = await supabase.from("cfw_apps").select("category, last_updated")

      if (error) throw error

      const categories = new Set(data?.map((app) => app.category).filter(Boolean))
      const recentlyUpdated =
        data?.filter((app) => {
          if (!app.last_updated) return false
          const lastUpdated = new Date(app.last_updated)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return lastUpdated > thirtyDaysAgo
        }).length || 0

      setStats({
        total: data?.length || 0,
        categories: categories.size,
        recentlyUpdated,
      })
    } catch (error: any) {
      console.error("Error loading stats:", error)
    }
  }

  async function deleteApp(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const { error } = await supabase.from("cfw_apps").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "CFW app deleted successfully",
      })

      loadApps()
      loadStats()
    } catch (error: any) {
      console.error("Error deleting CFW app:", error)
      toast({
        title: "Error",
        description: "Failed to delete CFW app",
        variant: "destructive",
      })
    }
  }

  const filteredApps = apps.filter(
    (app) =>
      app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CFW Apps</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage custom firmware applications</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/cfw-apps/new">
            <Plus className="w-4 h-4 mr-2" />
            Add CFW App
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Badge variant="secondary">{stats.categories}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <Badge variant="outline">{stats.recentlyUpdated}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search CFW apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {app.image_url ? (
                    <Image
                      src={app.image_url || "/placeholder.svg"}
                      alt={app.app_name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=48&width=48&text=${app.app_name.charAt(0)}`
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {app.app_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{app.app_name}</CardTitle>
                    {app.category && (
                      <Badge variant="secondary" className="mt-1">
                        {app.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {app.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{app.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/cfw-apps/${app.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  {app.app_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={app.app_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteApp(app.id, app.app_name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {app.last_updated && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">Updated: {new Date(app.last_updated).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No CFW apps found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first CFW app"}
          </p>
          <Button asChild>
            <Link href="/admin/cfw-apps/new">
              <Plus className="w-4 h-4 mr-2" />
              Add CFW App
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
