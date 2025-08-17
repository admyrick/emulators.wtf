// app/compare/CompareClient.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search } from "lucide-react"

type Handheld = {
  id: string
  name: string
  slug: string
  image_url: string | null
  manufacturer: string | null
  price_range: string | null
  release_date: string | null
  screen_size: string | null
  processor: string | null
  ram: string | null
  storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
}

const FIELD_DEFS: { key: keyof Handheld; label: string; formatter?: (v: any) => string }[] = [
  { key: "manufacturer", label: "Manufacturer" },
  { key: "release_date", label: "Release Year", formatter: (v) => (v ? new Date(v).getFullYear().toString() : "—") },
  { key: "price_range", label: "Price Range" },
  { key: "screen_size", label: "Screen Size" },
  { key: "processor", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "battery_life", label: "Battery Life" },
  { key: "weight", label: "Weight" },
  { key: "dimensions", label: "Dimensions" },
]

function formatValue(v: any): string {
  if (v == null) return "—"
  if (Array.isArray(v)) return v.join(", ")
  return String(v)
}

function toQueryParam(ids: string[]) {
  return ids.join(",")
}

async function searchHandhelds(query: string): Promise<Handheld[]> {
  let q = supabase
    .from("handhelds")
    .select(
      "id,name,slug,image_url,manufacturer,price_range,release_date,screen_size,processor,ram,storage,battery_life,weight,dimensions",
    )
    .order("name", { ascending: true })
    .limit(20)

  if (query.trim()) {
    q = q.ilike("name", `%${query.trim()}%`)
  }
  const { data, error } = await q
  if (error) {
    console.error("searchHandhelds error", error.message)
    return []
  }
  return (data as Handheld[]) ?? []
}

async function getHandheldsByIds(ids: string[]): Promise<Handheld[]> {
  if (!ids.length) return []
  const { data, error } = await supabase
    .from("handhelds")
    .select(
      "id,name,slug,image_url,manufacturer,price_range,release_date,screen_size,processor,ram,storage,battery_life,weight,dimensions",
    )
    .in("id", ids)

  if (error) {
    console.error("getHandheldsByIds error", error.message)
    return []
  }
  // Preserve the order of ids in the result
  const byId = new Map((data as Handheld[]).map((h) => [h.id, h]))
  return ids.map((id) => byId.get(id)).filter(Boolean) as Handheld[]
}

export default function CompareClient({
  initialHandhelds,
  initialIds,
}: {
  initialHandhelds: Handheld[]
  initialIds: string[]
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [selected, setSelected] = useState<Handheld[]>(initialHandhelds)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Handheld[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  // Keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams(params.toString())
    if (selectedIds.length) next.set("ids", toQueryParam(selectedIds))
    else next.delete("ids")
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds])

  // Refresh selected data if ids change
  useEffect(() => {
    if (!selectedIds.length) {
      setSelected([])
      return
    }
    getHandheldsByIds(selectedIds).then(setSelected)
  }, [selectedIds])

  // Basic debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      setIsSearching(true)
      const data = await searchHandhelds(search)
      setResults(data)
      setIsSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  function addDevice(h: Handheld) {
    setSelectedIds((prev) => (prev.includes(h.id) ? prev : [...prev, h.id]))
    setSearch("") // close popover after add; remove if you want to add multiple quickly
    setResults([])
  }

  function removeDevice(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const notSelectedResults = useMemo(() => results.filter((r) => !selectedIds.includes(r.id)), [results, selectedIds])

  return (
    <div className="space-y-8">
      {/* Picker */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="w-full md:max-w-md">
          <Popover
            open={Boolean(search)}
            onOpenChange={() => {
              /* controlled by `search` only */
            }}
          >
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search handhelds to add..."
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </PopoverTrigger>

            {search && (
              <PopoverContent
                align="start"
                className="p-0 w-[--radix-popover-trigger-width] max-h-80 overflow-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command shouldFilter={false}>
                  <CommandList>
                    {isSearching && <CommandEmpty>Searching…</CommandEmpty>}
                    {!isSearching && notSelectedResults.length === 0 && <CommandEmpty>No results</CommandEmpty>}
                    {!isSearching && notSelectedResults.length > 0 && (
                      <CommandGroup heading="Add to compare">
                        {notSelectedResults.map((h) => (
                          <CommandItem
                            key={h.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              addDevice(h)
                            }}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <div className="relative h-8 w-8 overflow-hidden rounded">
                              {h.image_url ? (
                                <Image
                                  src={h.image_url || "/placeholder.svg"}
                                  alt={h.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-muted" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{h.name}</span>
                              {h.manufacturer && (
                                <span className="text-xs text-muted-foreground">{h.manufacturer}</span>
                              )}
                            </div>
                            <Plus className="ml-auto size-4" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            )}
          </Popover>
        </div>

        {selected.length > 0 && (
          <Button variant="outline" onClick={() => setSelectedIds([])}>
            Clear selection
          </Button>
        )}
      </div>

      {/* Selected cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selected.map((h) => (
          <Card key={h.id} className="relative">
            <button
              aria-label={`Remove ${h.name}`}
              className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
              onClick={() => removeDevice(h.id)}
            >
              <X className="size-4" />
            </button>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{h.name}</CardTitle>
              {h.manufacturer && <Badge variant="secondary">{h.manufacturer}</Badge>}
            </CardHeader>
            <CardContent className="flex gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded border">
                {h.image_url ? (
                  <Image src={h.image_url || "/placeholder.svg"} alt={h.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {h.price_range && <div>Price: {h.price_range}</div>}
                {h.release_date && <div>Year: {new Date(h.release_date).getFullYear()}</div>}
                <Link href={`/handheld/${h.slug}`} className="text-primary hover:underline">
                  View details
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      {selected.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="sticky left-0 bg-muted/50 backdrop-blur py-3 px-4 text-left font-semibold">Spec</th>
                {selected.map((h) => (
                  <th key={h.id} className="py-3 px-4 text-left font-semibold">
                    {h.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELD_DEFS.map((f, idx) => (
                <tr key={f.key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="sticky left-0 bg-background py-3 px-4 font-medium">{f.label}</td>
                  {selected.map((h) => (
                    <td key={h.id + f.key} className="py-3 px-4">
                      {f.formatter ? f.formatter(h[f.key]) : formatValue(h[f.key])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Key features as a long row */}
              <tr>
                <td className="sticky left-0 bg-background py-3 px-4 font-medium">Key Features</td>
                {selected.map((h) => (
                  <td key={h.id + "_features"} className="py-3 px-4">
                    —
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
