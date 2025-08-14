"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConsoleCard } from "@/components/console-card"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/pagination"

type ConsoleRow = any

async function getConsoles(searchQuery?: string) {
  let query = supabase.from("consoles").select("*").order("name")

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ConsoleRow[]
}

async function getConsolesPaged(opts: {
  searchQuery?: string
  manufacturer?: string | null
  page: number
  limit: number
}) {
  const { searchQuery, manufacturer, page, limit } = opts
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from("consoles").select("*", { count: "exact" })

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%`)
  }
  if (manufacturer) {
    query = query.eq("manufacturer", manufacturer)
  }

  query = query.order("release_year", { ascending: false }).order("name", { ascending: true }).range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data as ConsoleRow[]) ?? [], total: count ?? 0 }
}

function groupConsolesByManufacturer(consoles: ConsoleRow[]) {
  const grouped = consoles.reduce(
    (acc, row) => {
      const manufacturer = row.manufacturer || "Unknown"
      if (!acc[manufacturer]) {
        acc[manufacturer] = []
      }
      acc[manufacturer].push(row)
      return acc
    },
    {} as Record<string, ConsoleRow[]>,
  )

  Object.keys(grouped).forEach((manufacturer) => {
    grouped[manufacturer].sort((a, b) => {
      const yearA = a.release_year || 0
      const yearB = b.release_year || 0
      return yearB - yearA || a.name.localeCompare(b.name)
    })
  })

  return grouped
}

export default function ConsolesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null)
  const manufacturerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const searchParams = useSearchParams()
  const page = useMemo(() => Math.max(1, Number(searchParams.get("page") || "1")), [searchParams])
  const limit = useMemo(() => Math.max(1, Number(searchParams.get("limit") || "12")), [searchParams])

  const { data: consoles, isLoading } = useQuery({
    queryKey: ["consoles", searchQuery],
    queryFn: () => getConsoles(searchQuery),
  })

  const usePaged = Boolean(searchQuery || selectedManufacturer)
  const { data: paged, isLoading: isLoadingPaged } = useQuery({
    queryKey: ["consoles-paged", searchQuery, selectedManufacturer, page, limit],
    queryFn: () =>
      getConsolesPaged({
        searchQuery: searchQuery || undefined,
        manufacturer: selectedManufacturer,
        page,
        limit,
      }),
    enabled: usePaged,
  })

  const groupedConsoles = consoles ? groupConsolesByManufacturer(consoles) : {}
  const manufacturers = Object.keys(groupedConsoles).sort()

  useEffect(() => {
    if (searchQuery) {
      setSelectedManufacturer(null)
    }
  }, [searchQuery])

  const handleManufacturerFilter = (manufacturer: string | null) => {
    setSelectedManufacturer(manufacturer)
    if (manufacturer && manufacturerRefs.current[manufacturer]) {
      manufacturerRefs.current[manufacturer]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const filteredManufacturers = selectedManufacturer
    ? manufacturers.filter((m) => m === selectedManufacturer)
    : manufacturers

  const totalConsoles = consoles?.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Gaming Consoles</h1>
        <p className="text-muted-foreground text-lg">
          Explore gaming consoles organized by manufacturer and sorted by release year
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search consoles and manufacturers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!searchQuery && manufacturers.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedManufacturer === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleManufacturerFilter(null)}
            >
              All ({totalConsoles})
            </Button>
            {manufacturers.map((manufacturer) => (
              <Button
                key={manufacturer}
                variant={selectedManufacturer === manufacturer ? "default" : "outline"}
                size="sm"
                onClick={() => handleManufacturerFilter(manufacturer)}
              >
                {manufacturer} ({groupedConsoles[manufacturer].length})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Paged flat grid when searching or a manufacturer is selected */}
      {usePaged ? (
        isLoadingPaged ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, j) => (
              <div key={j} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged?.items.map((console) => (
                <ConsoleCard key={console.id} console={console} />
              ))}
            </div>
            <Pagination total={paged?.total ?? 0} page={page} limit={limit} />
            {paged && paged.items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No consoles found matching your search.</p>
              </div>
            )}
          </>
        )
      ) : // Grouped layout without pagination for the all-manufacturers view
      isLoading ? (
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredManufacturers.map((manufacturer) => (
            <div
              key={manufacturer}
              ref={(el) => {
                manufacturerRefs.current[manufacturer] = el
              }}
              className="space-y-6"
            >
              <div className="border-b pb-2">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  {manufacturer}
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                    {groupedConsoles[manufacturer].length} console
                    {groupedConsoles[manufacturer].length !== 1 ? "s" : ""}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedConsoles[manufacturer].map((console) => (
                  <ConsoleCard key={console.id} console={console} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
