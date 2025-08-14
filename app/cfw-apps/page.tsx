import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import CfwAppsFilters from "@/components/cfw-apps-filters"
import { Pagination } from "@/components/pagination"

interface CfwApp {
  id: string
  slug: string
  app_name: string
  description: string | null
  category: string | null
  app_type: string | null
  image_url: string | null
  requirements: string | null
  last_updated: string | null
  created_at: string
}

async function getCfwApps({
  q,
  category,
  type,
  requirements,
  year,
  sort,
  page,
  limit,
}: {
  q?: string
  category?: string
  type?: string
  requirements?: string
  year?: string
  sort?: string
  page: number
  limit: number
}) {
  try {
    let query = supabase.from("cfw_apps").select("*", { count: "exact" })

    if (q && q.trim().length > 0) {
      const like = `%${q.trim()}%`
      query = query.or(
        `app_name.ilike.${like},description.ilike.${like},category.ilike.${like},app_type.ilike.${like},requirements.ilike.${like}`,
      )
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (type && type !== "all") {
      query = query.eq("app_type", type)
    }

    if (requirements && requirements !== "all") {
      query = query.ilike("requirements", `%${requirements}%`)
    }

    if (year && year !== "all") {
      const yearNum = Number.parseInt(year)
      if (!isNaN(yearNum)) {
        query = query.gte("last_updated", `${yearNum}-01-01`).lt("last_updated", `${yearNum + 1}-01-01`)
      }
    }

    switch (sort) {
      case "name-asc":
        query = query.order("app_name", { ascending: true })
        break
      case "name-desc":
        query = query.order("app_name", { ascending: false })
        break
      case "updated-desc":
        query = query.order("last_updated", { ascending: false, nullsLast: true })
        break
      case "updated-asc":
        query = query.order("last_updated", { ascending: true, nullsLast: true })
        break
      case "category":
        query = query.order("category", { ascending: true, nullsLast: true }).order("app_name", { ascending: true })
        break
      case "type":
        query = query.order("app_type", { ascending: true, nullsLast: true }).order("app_name", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error("Error fetching CFW apps:", error)
      return { apps: [] as CfwApp[], total: 0 }
    }
    return { apps: (data || []) as CfwApp[], total: count ?? 0 }
  } catch (error) {
    console.error("Error fetching CFW apps:", error)
    return { apps: [] as CfwApp[], total: 0 }
  }
}

function CfwAppCard({ app }: { app: CfwApp }) {
  return (
    <Link href={`/cfw-apps/${app.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md">
            <Image
              src={app.image_url || "/placeholder.svg?height=200&width=300&query=cfw-app"}
              alt={app.app_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-400 transition-colors text-white">
            {app.app_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {app.category && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200 border-slate-600">
                {app.category}
              </Badge>
            )}
            <Badge variant="default" className="text-xs bg-purple-600 text-white">
              Free
            </Badge>
          </div>
          {app.description && <p className="text-sm text-slate-300 line-clamp-3 mb-3">{app.description}</p>}
          {app.app_type && (
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {app.app_type}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

type PageSearchParams = {
  q?: string | string[]
  category?: string | string[]
  type?: string | string[]
  requirements?: string | string[]
  year?: string | string[]
  sort?: string | string[]
  page?: string | string[]
  limit?: string | string[]
}

export default async function CfwAppsPage({ searchParams }: { searchParams?: PageSearchParams } = {}) {
  const q =
    typeof searchParams?.q === "string" ? searchParams?.q : Array.isArray(searchParams?.q) ? searchParams?.q[0] : ""
  const category =
    typeof searchParams?.category === "string"
      ? searchParams?.category
      : Array.isArray(searchParams?.category)
        ? searchParams?.category[0]
        : "all"
  const type =
    typeof searchParams?.type === "string"
      ? searchParams?.type
      : Array.isArray(searchParams?.type)
        ? searchParams?.type[0]
        : "all"
  const requirements =
    typeof searchParams?.requirements === "string"
      ? searchParams?.requirements
      : Array.isArray(searchParams?.requirements)
        ? searchParams?.requirements[0]
        : "all"
  const year =
    typeof searchParams?.year === "string"
      ? searchParams?.year
      : Array.isArray(searchParams?.year)
        ? searchParams?.year[0]
        : "all"
  const sort =
    typeof searchParams?.sort === "string"
      ? searchParams?.sort
      : Array.isArray(searchParams?.sort)
        ? searchParams?.sort[0]
        : "newest"

  // Defaults: page 1, limit 12
  const pageRaw =
    typeof searchParams?.page === "string"
      ? searchParams.page
      : Array.isArray(searchParams?.page)
        ? searchParams.page[0]
        : "1"
  const limitRaw =
    typeof searchParams?.limit === "string"
      ? searchParams.limit
      : Array.isArray(searchParams?.limit)
        ? searchParams?.limit[0]
        : "12"

  let page = Number.parseInt(pageRaw || "1", 10)
  let limit = Number.parseInt(limitRaw || "12", 10)

  if (!Number.isFinite(page) || page < 1) page = 1
  const allowedLimits = new Set([6, 12, 24, 48, 96])
  if (!Number.isFinite(limit) || !allowedLimits.has(limit)) limit = 12

  const { apps, total } = await getCfwApps({ q, category, type, requirements, year, sort, page, limit })

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Custom Firmware Apps</h1>
              <p className="text-slate-300">Applications and homebrew for custom firmware systems</p>
            </div>
          </div>

          <CfwAppsFilters
            q={q || ""}
            category={category || "all"}
            type={type || "all"}
            requirements={requirements || "all"}
            year={year || "all"}
            sort={sort || "newest"}
          />
        </div>

        {/* Apps Grid */}
        {apps.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-400">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} CFW app
                {total !== 1 ? "s" : ""}
                {q ? ` for "${q}"` : ""}
                {category && category !== "all" ? ` in ${category}` : ""}
                {type && type !== "all" ? ` (${type})` : ""}
                {requirements && requirements !== "all" ? ` with ${requirements} requirements` : ""}
                {year && year !== "all" ? ` updated in ${year}` : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <CfwAppCard key={app.id} app={app} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination total={total} page={page} limit={limit} />
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No CFW Apps Found</h3>
            <p className="text-slate-400 mb-6">
              {q || category !== "all" || type !== "all" || requirements !== "all" || year !== "all"
                ? "Try adjusting your search or filters."
                : "No custom firmware applications are currently available in the database."}
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/admin/cfw-apps/new">Add CFW App</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
