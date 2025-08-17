"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"

interface CustomFirmware {
  id: string
  slug: string
  name: string
  description: string | null
  version: string | null
  release_date: string | null
  download_url: string | null
  documentation_url: string | null
  source_code_url: string | null
  license: string | null
  installation_difficulty: string | null
  features: string[] | null
  requirements: string[] | null
  created_at: string
  updated_at: string
}

async function getCustomFirmware() {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from("custom_firmware").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching custom firmware:", error)
      return []
    }

    return (data || []) as CustomFirmware[]
  } catch (error) {
    console.error("Exception fetching custom firmware:", error)
    return []
  }
}

function CustomFirmwareCard({ firmware }: { firmware: CustomFirmware }) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
      case "beginner":
        return "bg-green-600"
      case "medium":
      case "intermediate":
        return "bg-yellow-600"
      case "hard":
      case "advanced":
        return "bg-red-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <Link href={`/custom-firmware/${firmware.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full bg-slate-850 border-slate-700">
        <CardHeader className="pb-3">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md bg-slate-800 flex items-center justify-center">
            <div className="text-4xl">⚙️</div>
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-400 transition-colors text-white">
            {firmware.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {firmware.version && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200 border-slate-600">
                v{firmware.version}
              </Badge>
            )}
            {firmware.installation_difficulty && (
              <Badge className={`text-xs text-white ${getDifficultyColor(firmware.installation_difficulty)}`}>
                {firmware.installation_difficulty}
              </Badge>
            )}
            <Badge variant="default" className="text-xs bg-purple-600 text-white">
              Free
            </Badge>
          </div>
          {firmware.description && <p className="text-sm text-slate-300 line-clamp-3 mb-3">{firmware.description}</p>}
          {firmware.features && firmware.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {(Array.isArray(firmware.features) ? firmware.features : []).slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {feature}
                </Badge>
              ))}
              {(Array.isArray(firmware.features) ? firmware.features : []).length > 2 && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  +{(Array.isArray(firmware.features) ? firmware.features : []).length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CustomFirmwarePage() {
  const [firmware, setFirmware] = useState<CustomFirmware[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [licenseFilter, setLicenseFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    getCustomFirmware().then((data) => {
      setFirmware(data)
      setLoading(false)
    })
  }, [])

  const filteredAndSortedFirmware = useMemo(() => {
    const filtered = firmware.filter((fw) => {
      const matchesSearch =
        searchTerm === "" ||
        fw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.features?.some((feature) => feature.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesDifficulty =
        difficultyFilter === "all" || fw.installation_difficulty?.toLowerCase() === difficultyFilter.toLowerCase()

      const matchesLicense = licenseFilter === "all" || fw.license?.toLowerCase().includes(licenseFilter.toLowerCase())

      const matchesYear =
        yearFilter === "all" || (fw.release_date && new Date(fw.release_date).getFullYear().toString() === yearFilter)

      return matchesSearch && matchesDifficulty && matchesLicense && matchesYear
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "release-date":
          return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
        case "release-date-old":
          return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime()
        case "difficulty":
          const difficultyOrder = { easy: 1, beginner: 1, medium: 2, intermediate: 2, hard: 3, advanced: 3 }
          return (
            (difficultyOrder[a.installation_difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 2) -
            (difficultyOrder[b.installation_difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 2)
          )
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [firmware, searchTerm, sortBy, difficultyFilter, licenseFilter, yearFilter])

  const totalPages = Math.ceil(filteredAndSortedFirmware.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFirmware = filteredAndSortedFirmware.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy, difficultyFilter, licenseFilter, yearFilter])

  const uniqueDifficulties = useMemo(() => {
    const difficulties = firmware.map((fw) => fw.installation_difficulty).filter(Boolean)
    return [...new Set(difficulties)]
  }, [firmware])

  const uniqueLicenses = useMemo(() => {
    const licenses = firmware.map((fw) => fw.license).filter(Boolean)
    return [...new Set(licenses)]
  }, [firmware])

  const uniqueYears = useMemo(() => {
    const years = firmware
      .map((fw) => (fw.release_date ? new Date(fw.release_date).getFullYear().toString() : null))
      .filter(Boolean)
    return [...new Set(years)].sort((a, b) => Number.parseInt(b!) - Number.parseInt(a!))
  }, [firmware])

  const activeFiltersCount = [
    searchTerm !== "",
    difficultyFilter !== "all",
    licenseFilter !== "all",
    yearFilter !== "all",
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchTerm("")
    setSortBy("newest")
    setDifficultyFilter("all")
    setLicenseFilter("all")
    setYearFilter("all")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Custom Firmware</h1>
          <p className="text-muted-foreground mb-6">
            Discover and compare custom firmware options for your handheld devices.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse">
              <div className="aspect-video bg-slate-700 rounded mb-4"></div>
              <div className="h-4 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Custom Firmware</h1>
        <p className="text-muted-foreground mb-6">
          Discover and compare custom firmware options for your handheld devices.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{firmware.length}</div>
            <div className="text-sm text-muted-foreground">Total Firmware</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{uniqueDifficulties.length}</div>
            <div className="text-sm text-muted-foreground">Difficulty Levels</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{uniqueLicenses.length}</div>
            <div className="text-sm text-muted-foreground">License Types</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{uniqueYears.length}</div>
            <div className="text-sm text-muted-foreground">Release Years</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search firmware, features, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Added</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="release-date">Newest Release</SelectItem>
              <SelectItem value="release-date-old">Oldest Release</SelectItem>
              <SelectItem value="difficulty">Difficulty Level</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-full md:w-32 bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 per page</SelectItem>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="24">24 per page</SelectItem>
              <SelectItem value="48">48 per page</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-800 border-slate-700"
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Installation Difficulty</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {uniqueDifficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty!.toLowerCase()}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">License</label>
                <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="All licenses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Licenses</SelectItem>
                    {uniqueLicenses.map((license) => (
                      <SelectItem key={license} value={license!.toLowerCase()}>
                        {license}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Release Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year!}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters} size="sm">
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="bg-slate-700">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-red-400">
                  ×
                </button>
              </Badge>
            )}
            {difficultyFilter !== "all" && (
              <Badge variant="secondary" className="bg-slate-700">
                Difficulty: {difficultyFilter}
                <button onClick={() => setDifficultyFilter("all")} className="ml-2 hover:text-red-400">
                  ×
                </button>
              </Badge>
            )}
            {licenseFilter !== "all" && (
              <Badge variant="secondary" className="bg-slate-700">
                License: {licenseFilter}
                <button onClick={() => setLicenseFilter("all")} className="ml-2 hover:text-red-400">
                  ×
                </button>
              </Badge>
            )}
            {yearFilter !== "all" && (
              <Badge variant="secondary" className="bg-slate-700">
                Year: {yearFilter}
                <button onClick={() => setYearFilter("all")} className="ml-2 hover:text-red-400">
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <div>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedFirmware.length)} of{" "}
            {filteredAndSortedFirmware.length} custom firmware options
          </div>
          {totalPages > 1 && (
            <div>
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {filteredAndSortedFirmware.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold mb-2">No Custom Firmware Found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedFirmware.map((fw) => (
              <CustomFirmwareCard key={fw.id} firmware={fw} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-slate-800 border-slate-700"
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 ${
                        currentPage === pageNum ? "bg-purple-600 text-white" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-800 border-slate-700"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
