"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { HandheldCard } from "@/components/handheld-card"

interface Handheld {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  description: string | null
  image_url: string | null
  price_range: string | null
  release_year: number | null
  screen_size: string | null
  cpu: string | null
  ram: string | null
  internal_storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  key_features: string[] | null
  os: string | null
  form_factor: string | null
  connectivity_options: string[] | null
  created_at: string
  updated_at: string
}

interface HandheldsClientPageProps {
  handhelds: Handheld[]
}

export default function HandheldsClientPage({ handhelds }: HandheldsClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [manufacturerFilter, setManufacturerFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [priceFilter, setPriceFilter] = useState("all")
  const [screenSizeFilter, setScreenSizeFilter] = useState("all")
  const [osFilter, setOsFilter] = useState("all")
  const [ramFilter, setRamFilter] = useState("all")
  const [storageFilter, setStorageFilter] = useState("all")
  const [featuresFilter, setFeaturesFilter] = useState("all")
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Get current year for filtering
  const currentYear = new Date().getFullYear()

  const filterOptions = useMemo(() => {
    const manufacturers = [...new Set(handhelds.map((h) => h.manufacturer).filter(Boolean))].sort()
    const years = [...new Set(handhelds.map((h) => h.release_year).filter(Boolean))].sort((a, b) => b - a)
    const operatingSystems = [...new Set(handhelds.map((h) => h.os).filter(Boolean))].sort()
    const ramOptions = [...new Set(handhelds.map((h) => h.ram).filter(Boolean))].sort()
    const storageOptions = [...new Set(handhelds.map((h) => h.internal_storage).filter(Boolean))].sort()
    const allFeatures = handhelds.flatMap((h) => h.key_features || [])
    const uniqueFeatures = [...new Set(allFeatures)].sort()

    return {
      manufacturers,
      years,
      operatingSystems,
      ramOptions,
      storageOptions,
      features: uniqueFeatures,
    }
  }, [handhelds])

  const filteredAndSortedHandhelds = useMemo(() => {
    const filtered = handhelds.filter((handheld) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        handheld.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handheld.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handheld.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handheld.key_features?.some((feature) => feature.toLowerCase().includes(searchTerm.toLowerCase()))

      // Year filter
      let matchesYear = true
      if (yearFilter === "latest") {
        matchesYear = handheld.release_year === currentYear
      } else if (yearFilter === "classic") {
        matchesYear = handheld.release_year !== null && handheld.release_year < 2022
      } else if (yearFilter !== "all" && yearFilter !== "") {
        matchesYear = handheld.release_year === Number.parseInt(yearFilter, 10)
      }

      // Manufacturer filter
      const matchesManufacturer = manufacturerFilter === "all" || handheld.manufacturer === manufacturerFilter

      // Price filter
      let matchesPrice = true
      if (priceFilter === "budget") {
        matchesPrice =
          handheld.price_range?.includes("$") &&
          (handheld.price_range.includes("$199") ||
            handheld.price_range.includes("$299") ||
            handheld.price_range.includes("$399"))
      } else if (priceFilter === "mid-range") {
        matchesPrice =
          handheld.price_range?.includes("$") &&
          (handheld.price_range.includes("$499") ||
            handheld.price_range.includes("$599") ||
            handheld.price_range.includes("$699"))
      } else if (priceFilter === "premium") {
        matchesPrice =
          handheld.price_range?.includes("$") &&
          (handheld.price_range.includes("$799") ||
            handheld.price_range.includes("$899") ||
            handheld.price_range.includes("$999") ||
            handheld.price_range.includes("$1"))
      }

      // Screen size filter
      let matchesScreenSize = true
      if (screenSizeFilter === "small") {
        matchesScreenSize = handheld.screen_size?.includes("5") || handheld.screen_size?.includes("6")
      } else if (screenSizeFilter === "medium") {
        matchesScreenSize = handheld.screen_size?.includes("7")
      } else if (screenSizeFilter === "large") {
        matchesScreenSize = handheld.screen_size?.includes("8") || handheld.screen_size?.includes("9")
      }

      // OS filter
      const matchesOS = osFilter === "all" || handheld.os === osFilter

      // RAM filter
      const matchesRAM = ramFilter === "all" || handheld.ram === ramFilter

      // Storage filter
      const matchesStorage = storageFilter === "all" || handheld.internal_storage === storageFilter

      // Features filter
      const matchesFeatures =
        featuresFilter === "all" || handheld.key_features?.some((feature) => feature === featuresFilter)

      return (
        matchesSearch &&
        matchesYear &&
        matchesManufacturer &&
        matchesPrice &&
        matchesScreenSize &&
        matchesOS &&
        matchesRAM &&
        matchesStorage &&
        matchesFeatures
      )
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.release_year || 0) - (a.release_year || 0)
        case "oldest":
          return (a.release_year || 0) - (b.release_year || 0)
        case "name":
          return a.name.localeCompare(b.name)
        case "manufacturer":
          return (a.manufacturer || "").localeCompare(b.manufacturer || "")
        case "recent":
          const dateA = new Date(a.created_at)
          const dateB = new Date(b.created_at)
          return dateB.getTime() - dateA.getTime()
        case "price-low":
          const priceA = a.price_range?.match(/\$(\d+)/)?.[1] || "0"
          const priceB = b.price_range?.match(/\$(\d+)/)?.[1] || "0"
          return Number.parseInt(priceA) - Number.parseInt(priceB)
        case "price-high":
          const priceA2 = a.price_range?.match(/\$(\d+)/)?.[1] || "0"
          const priceB2 = b.price_range?.match(/\$(\d+)/)?.[1] || "0"
          return Number.parseInt(priceB2) - Number.parseInt(priceA2)
        default:
          return 0
      }
    })

    return filtered
  }, [
    handhelds,
    searchTerm,
    yearFilter,
    manufacturerFilter,
    sortBy,
    currentYear,
    priceFilter,
    screenSizeFilter,
    osFilter,
    ramFilter,
    storageFilter,
    featuresFilter,
  ])

  // Calculate stats
  const stats = useMemo(() => {
    const total = handhelds.length
    const latestReleases = handhelds.filter((h) => h.release_year === currentYear).length
    const uniqueManufacturers = new Set(handhelds.map((h) => h.manufacturer).filter(Boolean)).size
    const releaseYears = new Set(handhelds.map((h) => h.release_year).filter(Boolean)).size

    return {
      total,
      latestReleases,
      manufacturers: uniqueManufacturers,
      releaseYears,
    }
  }, [handhelds, currentYear])

  const totalPages = Math.ceil(filteredAndSortedHandhelds.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHandhelds = filteredAndSortedHandhelds.slice(startIndex, endIndex)

  const resetPage = () => setCurrentPage(1)

  // Update useEffect to reset page when filters change
  useState(() => {
    resetPage()
  }, [
    searchTerm,
    yearFilter,
    manufacturerFilter,
    sortBy,
    priceFilter,
    screenSizeFilter,
    osFilter,
    ramFilter,
    storageFilter,
    featuresFilter,
  ])

  const clearFilters = () => {
    setSearchTerm("")
    setYearFilter("all")
    setManufacturerFilter("all")
    setSortBy("newest")
    setPriceFilter("all")
    setScreenSizeFilter("all")
    setOsFilter("all")
    setRamFilter("all")
    setStorageFilter("all")
    setFeaturesFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    yearFilter !== "all" ||
    manufacturerFilter !== "all" ||
    sortBy !== "newest" ||
    priceFilter !== "all" ||
    screenSizeFilter !== "all" ||
    osFilter !== "all" ||
    ramFilter !== "all" ||
    storageFilter !== "all" ||
    featuresFilter !== "all"

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gaming Handhelds</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Discover the latest and greatest in portable gaming devices
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Handhelds</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.latestReleases}</div>
            <div className="text-sm text-muted-foreground">Latest ({currentYear})</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.manufacturers}</div>
            <div className="text-sm text-muted-foreground">Manufacturers</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.releaseYears}</div>
            <div className="text-sm text-muted-foreground">Release Years</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
            <Input
              placeholder="Search handhelds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Year Filter */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Release Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest ({currentYear})</SelectItem>
              <SelectItem value="classic">Classic (Pre-2022)</SelectItem>
              <SelectItem value="all">All Years</SelectItem>
              {filterOptions.years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Manufacturer Filter */}
          <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {filterOptions.manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Release</SelectItem>
              <SelectItem value="oldest">Oldest Release</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
              <span>✕</span>
              Clear Filters
            </Button>
          )}
        </div>

        <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <span>{filtersExpanded ? "🔽" : "▶️"}</span>
              Advanced Filters
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget ($199-$399)</SelectItem>
                  <SelectItem value="mid-range">Mid-range ($499-$699)</SelectItem>
                  <SelectItem value="premium">Premium ($799+)</SelectItem>
                </SelectContent>
              </Select>

              {/* Screen Size Filter */}
              <Select value={screenSizeFilter} onValueChange={setScreenSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Screen Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small (5-6")</SelectItem>
                  <SelectItem value="medium">Medium (7")</SelectItem>
                  <SelectItem value="large">Large (8-9")</SelectItem>
                </SelectContent>
              </Select>

              {/* OS Filter */}
              <Select value={osFilter} onValueChange={setOsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Operating System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All OS</SelectItem>
                  {filterOptions.operatingSystems.map((os) => (
                    <SelectItem key={os} value={os}>
                      {os}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* RAM Filter */}
              <Select value={ramFilter} onValueChange={setRamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="RAM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All RAM</SelectItem>
                  {filterOptions.ramOptions.map((ram) => (
                    <SelectItem key={ram} value={ram}>
                      {ram}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Storage Filter */}
              <Select value={storageFilter} onValueChange={setStorageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Storage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Storage</SelectItem>
                  {filterOptions.storageOptions.map((storage) => (
                    <SelectItem key={storage} value={storage}>
                      {storage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Features Filter */}
              <Select value={featuresFilter} onValueChange={setFeaturesFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Key Features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  {filterOptions.features.slice(0, 10).map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>🔍</span>
                Search: {searchTerm}
              </Badge>
            )}
            {yearFilter !== "latest" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>📅</span>
                Year: {yearFilter === "all" ? "All Years" : yearFilter === "classic" ? "Pre-2022" : yearFilter}
              </Badge>
            )}
            {manufacturerFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>🏢</span>
                {manufacturerFilter}
              </Badge>
            )}
            {priceFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>💰</span>
                {priceFilter === "budget" ? "Budget" : priceFilter === "mid-range" ? "Mid-range" : "Premium"}
              </Badge>
            )}
            {screenSizeFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>📱</span>
                {screenSizeFilter === "small"
                  ? "Small Screen"
                  : screenSizeFilter === "medium"
                    ? "Medium Screen"
                    : "Large Screen"}
              </Badge>
            )}
            {osFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>💻</span>
                {osFilter}
              </Badge>
            )}
            {ramFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>🧠</span>
                {ramFilter}
              </Badge>
            )}
            {storageFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>💾</span>
                {storageFilter}
              </Badge>
            )}
            {featuresFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>⭐</span>
                {featuresFilter}
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedHandhelds.length)} of{" "}
          {filteredAndSortedHandhelds.length} handhelds
          {yearFilter === "latest" && ` (Latest ${currentYear} releases)`}
          {yearFilter === "classic" && " (Classic devices from before 2022)"}
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedHandhelds.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🎮</span>
          <h3 className="text-xl font-semibold mb-2">No handhelds found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedHandhelds.map((handheld) => (
              <HandheldCard key={handheld.id} handheld={handheld} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page numbers */}
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
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
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
