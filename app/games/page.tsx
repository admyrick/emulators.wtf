"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { GameCard } from "@/components/game-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/pagination"

type Game = any

async function getGames(opts: {
  searchQuery?: string
  consoleId?: string
  emulatorId?: string
  releaseYear?: string
  sortBy?: string
  page: number
  limit: number
}) {
  const { searchQuery, consoleId, emulatorId, releaseYear, sortBy, page, limit } = opts
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from("games").select("*", { count: "exact" })

  // Apply filters
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  if (consoleId && consoleId !== "all") {
    query = query.contains("console_ids", [consoleId])
  }

  if (emulatorId && emulatorId !== "all") {
    query = query.contains("emulator_ids", [emulatorId])
  }

  if (releaseYear && releaseYear !== "all") {
    if (releaseYear.includes("-")) {
      // Decade filter (e.g., "1990-1999")
      const [startYear, endYear] = releaseYear.split("-").map(Number)
      query = query.gte("release_year", startYear).lte("release_year", endYear)
    } else {
      // Specific year
      query = query.eq("release_year", Number.parseInt(releaseYear))
    }
  }

  // Apply sorting
  switch (sortBy) {
    case "name-desc":
      query = query.order("name", { ascending: false })
      break
    case "release-year-desc":
      query = query.order("release_year", { ascending: false, nullsFirst: false })
      break
    case "release-year-asc":
      query = query.order("release_year", { ascending: true, nullsFirst: false })
      break
    case "recently-added":
      query = query.order("created_at", { ascending: false })
      break
    case "recently-updated":
      query = query.order("updated_at", { ascending: false })
      break
    default:
      query = query.order("name")
  }

  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { items: data as Game[], total: count ?? 0 }
}

async function getConsoles() {
  const { data, error } = await supabase.from("consoles").select("id, name").order("name")
  if (error) throw error
  return data as { id: string; name: string }[]
}

async function getEmulators() {
  const { data, error } = await supabase.from("emulators").select("id, name").order("name")
  if (error) throw error
  return data as { id: string; name: string }[]
}

export default function GamesPage() {
  const searchParams = useSearchParams()
  const initialPage = Number(searchParams.get("page") || "1")
  const initialLimit = Number(searchParams.get("limit") || "12")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConsole, setSelectedConsole] = useState<string>("all")
  const [selectedEmulator, setSelectedEmulator] = useState<string>("all")
  const [selectedReleaseYear, setSelectedReleaseYear] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Keep URL-driven pagination reactive without duplicating state
  const page = useMemo(() => Math.max(1, initialPage), [initialPage])
  const limit = useMemo(() => Math.max(1, initialLimit), [initialLimit])

  const { data: gamesResult, isLoading } = useQuery({
    queryKey: ["games", searchQuery, selectedConsole, selectedEmulator, selectedReleaseYear, sortBy, page, limit],
    queryFn: () =>
      getGames({
        searchQuery,
        consoleId: selectedConsole === "all" ? undefined : selectedConsole,
        emulatorId: selectedEmulator === "all" ? undefined : selectedEmulator,
        releaseYear: selectedReleaseYear === "all" ? undefined : selectedReleaseYear,
        sortBy,
        page,
        limit,
      }),
  })

  const { data: consoles } = useQuery({
    queryKey: ["consoles-list"],
    queryFn: getConsoles,
  })

  const { data: emulators } = useQuery({
    queryKey: ["emulators-list"],
    queryFn: getEmulators,
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    // This effect is here in case you later wire search to URL; for now noop.
  }, [searchQuery, selectedConsole, selectedEmulator, selectedReleaseYear, sortBy])

  const games = gamesResult?.items ?? []
  const total = gamesResult?.total ?? 0

  const activeFilters = [
    searchQuery && { type: "search", value: searchQuery, label: `Search: "${searchQuery}"` },
    selectedConsole !== "all" && {
      type: "console",
      value: selectedConsole,
      label: `Console: ${consoles?.find((c) => c.id === selectedConsole)?.name || selectedConsole}`,
    },
    selectedEmulator !== "all" && {
      type: "emulator",
      value: selectedEmulator,
      label: `Emulator: ${emulators?.find((e) => e.id === selectedEmulator)?.name || selectedEmulator}`,
    },
    selectedReleaseYear !== "all" && {
      type: "year",
      value: selectedReleaseYear,
      label: `Year: ${selectedReleaseYear.includes("-") ? selectedReleaseYear.replace("-", "s") : selectedReleaseYear}`,
    },
  ].filter(Boolean)

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedConsole("all")
    setSelectedEmulator("all")
    setSelectedReleaseYear("all")
    setSortBy("name")
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        setSearchQuery("")
        break
      case "console":
        setSelectedConsole("all")
        break
      case "emulator":
        setSelectedEmulator("all")
        break
      case "year":
        setSelectedReleaseYear("all")
        break
    }
  }

  const releaseYearOptions = [
    { value: "all", label: "All Years" },
    { value: "2020-2029", label: "2020s" },
    { value: "2010-2019", label: "2010s" },
    { value: "2000-2009", label: "2000s" },
    { value: "1990-1999", label: "1990s" },
    { value: "1980-1989", label: "1980s" },
    { value: "1970-1979", label: "1970s" },
  ]

  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "release-year-desc", label: "Newest Release" },
    { value: "release-year-asc", label: "Oldest Release" },
    { value: "recently-added", label: "Recently Added" },
    { value: "recently-updated", label: "Recently Updated" },
  ]

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Games & Ports</h1>
        <p className="text-muted-foreground mb-6">Discover games, homebrew, and ports for various systems</p>

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">🔍</div>
              <Input
                type="search"
                placeholder="Search games..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Console</label>
                      <Select value={selectedConsole} onValueChange={setSelectedConsole}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Consoles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Consoles</SelectItem>
                          {consoles?.map((console) => (
                            <SelectItem key={console.id} value={console.id}>
                              {console.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Emulator</label>
                      <Select value={selectedEmulator} onValueChange={setSelectedEmulator}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Emulators" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Emulators</SelectItem>
                          {emulators?.map((emulator) => (
                            <SelectItem key={emulator.id} value={emulator.id}>
                              {emulator.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Release Year</label>
                      <Select value={selectedReleaseYear} onValueChange={setSelectedReleaseYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseYearOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.type} variant="secondary" className="gap-1">
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {games.length} of {total} games
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games?.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          <Pagination total={total} page={page} limit={limit} />
        </>
      )}

      {games && games.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No games found matching your criteria.</p>
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearAllFilters} className="mt-4 bg-transparent">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
