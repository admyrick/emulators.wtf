"use client"

import { useState } from "react"

import { useMemo } from "react"

import { useSearchParams } from "next/navigation"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { ToolCard } from "@/components/tool-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/pagination"

type Tool = any

async function getTools(opts: {
  searchQuery?: string
  category?: string
  developer?: string
  price?: string
  platform?: string
  feature?: string
  sortBy?: string
  sortOrder?: string
  page: number
  limit: number
}) {
  const { searchQuery, category, developer, price, platform, feature, sortBy, sortOrder, page, limit } = opts
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from("tools").select("*", { count: "exact" })

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,developer.ilike.%${searchQuery}%`)
  }

  if (category && category !== "all") {
    query = query.contains("category", [category])
  }

  if (developer && developer !== "all") {
    query = query.eq("developer", developer)
  }

  if (price && price !== "all") {
    if (price === "free") {
      query = query.eq("price", "Free")
    } else if (price === "paid") {
      query = query.neq("price", "Free")
    }
  }

  if (platform && platform !== "all") {
    query = query.contains("supported_platforms", [platform])
  }

  if (feature && feature !== "all") {
    query = query.contains("features", [feature])
  }

  if (sortBy) {
    const ascending = sortOrder === "asc"
    switch (sortBy) {
      case "name":
        query = query.order("name", { ascending })
        break
      case "developer":
        query = query.order("developer", { ascending })
        break
      case "updated":
        query = query.order("last_updated", { ascending: !ascending, nullsLast: true })
        break
      case "created":
        query = query.order("created_at", { ascending: !ascending })
        break
      default:
        query = query.order("name")
    }
  } else {
    query = query.order("name")
  }

  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { items: data as Tool[], total: count ?? 0 }
}

async function getFilterOptions() {
  const { data, error } = await supabase
    .from("tools")
    .select("category, developer, supported_platforms, features, price")
  if (error) throw error

  const categories = new Set<string>()
  const developers = new Set<string>()
  const platforms = new Set<string>()
  const features = new Set<string>()
  const prices = new Set<string>()
  ;(data as any[]).forEach((tool) => {
    tool.category?.forEach((cat: string) => categories.add(cat))
    if (tool.developer) developers.add(tool.developer)
    tool.supported_platforms?.forEach((platform: string) => platforms.add(platform))
    tool.features?.forEach((feature: string) => features.add(feature))
    if (tool.price) prices.add(tool.price)
  })

  return {
    categories: Array.from(categories).sort(),
    developers: Array.from(developers).sort(),
    platforms: Array.from(platforms).sort(),
    features: Array.from(features).sort(),
    prices: Array.from(prices).sort(),
  }
}

export default function ToolsPage() {
  const searchParams = useSearchParams()
  const page = useMemo(() => Math.max(1, Number(searchParams.get("page") || "1")), [searchParams])
  const limit = useMemo(() => Math.max(1, Number(searchParams.get("limit") || "12")), [searchParams])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("all")
  const [selectedPrice, setSelectedPrice] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<string>("asc")
  const [showFilters, setShowFilters] = useState(false)

  const { data: toolsResult, isLoading } = useQuery({
    queryKey: [
      "tools",
      searchQuery,
      selectedCategory,
      selectedDeveloper,
      selectedPrice,
      selectedPlatform,
      selectedFeature,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: () =>
      getTools({
        searchQuery,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        developer: selectedDeveloper === "all" ? undefined : selectedDeveloper,
        price: selectedPrice === "all" ? undefined : selectedPrice,
        platform: selectedPlatform === "all" ? undefined : selectedPlatform,
        feature: selectedFeature === "all" ? undefined : selectedFeature,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  })

  const { data: filterOptions } = useQuery({
    queryKey: ["tool-filter-options"],
    queryFn: getFilterOptions,
  })

  const tools = toolsResult?.items ?? []
  const total = toolsResult?.total ?? 0

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedDeveloper("all")
    setSelectedPrice("all")
    setSelectedPlatform("all")
    setSelectedFeature("all")
    setSortBy("name")
    setSortOrder("asc")
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategory !== "all") count++
    if (selectedDeveloper !== "all") count++
    if (selectedPrice !== "all") count++
    if (selectedPlatform !== "all") count++
    if (selectedFeature !== "all") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Tools & Utilities</h1>
        <p className="text-muted-foreground mb-6">Essential tools and utilities for emulation</p>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3 text-muted-foreground">🔍</span>
              <Input
                type="search"
                placeholder="Search tools..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Recently Added</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">{sortBy === "name" || sortBy === "developer" ? "A-Z" : "Oldest"}</SelectItem>
                  <SelectItem value="desc">{sortBy === "name" || sortBy === "developer" ? "Z-A" : "Newest"}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <span>🔽</span>
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterOptions?.categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
                <SelectTrigger>
                  <SelectValue placeholder="Developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Developers</SelectItem>
                  {filterOptions?.developers?.map((developer) => (
                    <SelectItem key={developer} value={developer}>
                      {developer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {filterOptions?.platforms?.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger>
                  <SelectValue placeholder="Feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  {filterOptions?.features?.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2 bg-transparent">
                  <span>✕</span>
                  Clear All
                </Button>
              )}
            </div>
          )}

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
              {selectedDeveloper !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Developer: {selectedDeveloper}
                  <button onClick={() => setSelectedDeveloper("all")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
              {selectedPrice !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {selectedPrice === "free" ? "Free" : "Paid"}
                  <button onClick={() => setSelectedPrice("all")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
              {selectedPlatform !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Platform: {selectedPlatform}
                  <button onClick={() => setSelectedPlatform("all")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
              {selectedFeature !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Feature: {selectedFeature}
                  <button onClick={() => setSelectedFeature("all")} className="ml-1 hover:bg-muted rounded">
                    ✕
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {tools.length} of {total} tools
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools?.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <Pagination total={total} page={page} limit={limit} />
        </>
      )}

      {tools && tools.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools found matching your criteria.</p>
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters} className="mt-4 bg-transparent">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
