"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, SortAsc, X, ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  q: string
  category: string
  type: string
  requirements: string
  year: string
  sort: string
}

export default function CfwAppsFilters({
  q: initialQ,
  category: initialCategory,
  type: initialType,
  requirements: initialRequirements,
  year: initialYear,
  sort: initialSort,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(initialQ || "")
  const [category, setCategory] = useState(initialCategory || "all")
  const [type, setType] = useState(initialType || "all")
  const [requirements, setRequirements] = useState(initialRequirements || "all")
  const [year, setYear] = useState(initialYear || "all")
  const [sort, setSort] = useState(initialSort || "newest")
  const [showFilters, setShowFilters] = useState(false)

  const createQueryString = useMemo(() => {
    return (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all" || (key === "sort" && value === "newest")) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.set("page", "1")
      return params.toString()
    }
  }, [searchParams])

  const updateFilters = (updates: Record<string, string | null>) => {
    const qs = createQueryString(updates)
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  useEffect(() => {
    const id = setTimeout(() => {
      updateFilters({ q: q || null })
    }, 350)
    return () => clearTimeout(id)
  }, [q])

  const clearAllFilters = () => {
    setQ("")
    setCategory("all")
    setType("all")
    setRequirements("all")
    setYear("all")
    setSort("newest")
    router.push(pathname)
  }

  const activeFilters = [
    { key: "category", value: category, label: category !== "all" ? `Category: ${category}` : null },
    { key: "type", value: type, label: type !== "all" ? `Type: ${type}` : null },
    {
      key: "requirements",
      value: requirements,
      label: requirements !== "all" ? `Requirements: ${requirements}` : null,
    },
    { key: "year", value: year, label: year !== "all" ? `Year: ${year}` : null },
    { key: "sort", value: sort, label: sort !== "newest" ? `Sort: ${getSortLabel(sort)}` : null },
  ].filter((filter) => filter.label)

  function getSortLabel(sortValue: string) {
    const sortLabels: Record<string, string> = {
      newest: "Newest",
      "name-asc": "Name A-Z",
      "name-desc": "Name Z-A",
      "updated-desc": "Recently Updated",
      "updated-asc": "Oldest Updated",
      category: "Category",
      type: "Type",
    }
    return sortLabels[sortValue] || sortValue
  }

  const removeFilter = (key: string) => {
    const updates: Record<string, string | null> = {}
    if (key === "category") {
      setCategory("all")
      updates.category = null
    } else if (key === "type") {
      setType("all")
      updates.type = null
    } else if (key === "requirements") {
      setRequirements("all")
      updates.requirements = null
    } else if (key === "year") {
      setYear("all")
      updates.year = null
    } else if (key === "sort") {
      setSort("newest")
      updates.sort = null
    }
    updateFilters(updates)
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search CFW apps..."
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters({ q: q || null })
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={sort}
            onValueChange={(val) => {
              setSort(val)
              updateFilters({ sort: val })
            }}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="updated-desc">Recently Updated</SelectItem>
              <SelectItem value="updated-asc">Oldest Updated</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                value={category}
                onValueChange={(val) => {
                  setCategory(val)
                  updateFilters({ category: val })
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="emulator">Emulator</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="homebrew">Homebrew</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={type}
                onValueChange={(val) => {
                  setType(val)
                  updateFilters({ type: val })
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homebrew">Homebrew</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="launcher">Launcher</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={requirements}
                onValueChange={(val) => {
                  setRequirements(val)
                  updateFilters({ requirements: val })
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Requirements" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Requirements</SelectItem>
                  <SelectItem value="CFW">Custom Firmware</SelectItem>
                  <SelectItem value="Root">Root Access</SelectItem>
                  <SelectItem value="Linux">Linux</SelectItem>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="None">No Requirements</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={year}
                onValueChange={(val) => {
                  setYear(val)
                  updateFilters({ year: val })
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Updated Year" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
              onClick={() => removeFilter(filter.key)}
            >
              {filter.label}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-slate-400 hover:text-white">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
