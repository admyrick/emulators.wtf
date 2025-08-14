import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Gamepad2, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage Handhelds - Admin - Emulators.wtf",
  description: "Manage gaming handhelds in the database",
}

async function getHandhelds() {
  const { data: handhelds, error } = await supabase
    .from("handhelds")
    .select(`
      *,
      handheld_device_categories(
        device_categories(name)
      ),
      handheld_retailers(
        retailers(name),
        price
      )
    `)
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gamepad2 className="h-8 w-8" />
            Manage Handhelds
          </h1>
          <p className="text-muted-foreground">Add, edit, and manage gaming handhelds in the database</p>
        </div>
        <Button asChild>
          <Link href="/admin/handhelds/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Handheld
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Handhelds</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHandhelds}</div>
            <p className="text-xs text-muted-foreground">Gaming devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Device categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retailers</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search handhelds..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
                  <TableHead>Categories</TableHead>
                  <TableHead>Retailers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {handhelds.map((handheld) => {
                  const categories = handheld.handheld_device_categories?.map((hc) => hc.device_categories.name) || []
                  const retailers = handheld.handheld_retailers || []

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
                        <div className="flex flex-wrap gap-1">
                          {categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {retailers.length > 0 ? (
                            <span>
                              {retailers.length} retailer{retailers.length > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
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
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/handheld/${handheld.slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/handhelds/${handheld.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
              <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Handhelds Found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first gaming handheld.</p>
              <Button asChild>
                <Link href="/admin/handhelds/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Handheld
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
