import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage Handhelds - Admin - Emulators.wtf",
  description: "Manage gaming handhelds in the database",
}

async function getHandhelds() {
  const { data: handhelds, error } = await supabase
    .from("handhelds")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching handhelds:", error)
    return []
  }

  return handhelds || []
}

async function getStats() {
  const [{ count: totalHandhelds }, { data: categories }, { data: retailers }] = await Promise.all([
    supabase.from("handhelds").select("*", { count: "exact", head: true }),
    supabase.from("device_categories").select("name"),
    supabase.from("retailers").select("name"),
  ])

  return {
    totalHandhelds: totalHandhelds || 0,
    totalCategories: categories?.length || 0,
    totalRetailers: retailers?.length || 0,
  }
}

export default async function AdminHandheldsPage() {
  const [handhelds, stats] = await Promise.all([getHandhelds(), getStats()])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">🎮 Manage Handhelds</h1>
          <p className="text-muted-foreground">Add, edit, and manage gaming handhelds in the database</p>
        </div>
        <Button asChild>
          <Link href="/admin/handhelds/new">➕ Add Handheld</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Handhelds</CardTitle>🎮
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHandhelds}</div>
            <p className="text-xs text-muted-foreground">Gaming devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>📂
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Device categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retailers</CardTitle>🏪
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRetailers}</div>
            <p className="text-xs text-muted-foreground">Retail partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
              <Input placeholder="Search handhelds..." className="pl-10" />
            </div>
            <Button variant="outline">📂 Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Handhelds Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Handhelds ({handhelds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {handhelds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Release Year</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {handhelds.map((handheld) => {
                  return (
                    <TableRow key={handheld.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{handheld.name}</div>
                          <div className="text-sm text-muted-foreground">{handheld.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>{handheld.manufacturer || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>
                        {handheld.price_range ? (
                          <Badge variant="outline">{handheld.price_range}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {handheld.release_year ? (
                          <Badge variant="secondary">{handheld.release_year}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(handheld.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/handheld/${handheld.slug}`}>👁️ View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/handhelds/${handheld.id}`}>✏️ Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">🗑️ Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-lg font-semibold mb-2">No Handhelds Found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first gaming handheld.</p>
              <Button asChild>
                <Link href="/admin/handhelds/new">➕ Add Handheld</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
