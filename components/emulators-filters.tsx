"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, Search } from "lucide-react"

type ConsoleOption = { id: string; name: string }

type Props = {
  // Initial values from server
  initialSearch: string
  initialConsoleId: string
  initialSort: "name" | "updated"
  // List of consoles to pick from
  consoles: ConsoleOption[]
}

export default function EmulatorsFilters({ initialSearch, initialConsoleId, initialSort, consoles }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(initialSearch || "")
  const [consoleId, setConsoleId] = useState(initialConsoleId || "all")
  const [sort, setSort] = useState<"name" | "updated">(initialSort || "name")

  // Build query string helper
  const createQueryString = useMemo(() => {
    return (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      // Reset page when any filter changes
      params.set("page", "1")
      return params.toString()
    }
  }, [searchParams])

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      const qs = createQueryString({ search: q || null })
      router.push(qs ? `${pathname}?${qs}` : pathname)
    }, 350)
    return () => clearTimeout(id)
  }, [q, createQueryString, pathname, router])

  return (
    <div className="bg-slate-850 rounded-xl p-6 mb-8 shadow-sm border border-slate-700">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search emulators..."
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const qs = createQueryString({ search: q || null })
                router.push(qs ? `${pathname}?${qs}` : pathname)
              }
            }}
          />
        </div>

        {/* Console filter by console_id */}
        <Select
          value={consoleId}
          onValueChange={(val) => {
            setConsoleId(val)
            const qs = createQueryString({ console: val })
            router.push(qs ? `${pathname}?${qs}` : pathname)
          }}
        >
          <SelectTrigger className="w-full md:w-64 bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="All Consoles" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all">All Consoles</SelectItem>
            {consoles.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(val: "name" | "updated") => {
            setSort(val)
            const qs = createQueryString({ sort: val })
            router.push(qs ? `${pathname}?${qs}` : pathname)
          }}
        >
          <SelectTrigger className="w-full md:w-56 bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => {
            setQ("")
            setConsoleId("all")
            setSort("name")
            const qs = createQueryString({ search: null, console: null, sort: "name" })
            router.push(qs ? `${pathname}?${qs}` : pathname)
          }}
        >
          <Filter className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
