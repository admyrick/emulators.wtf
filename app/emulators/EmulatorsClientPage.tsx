"use client"

import { useState, useMemo } from "react"
import { EmulatorCard } from "@/components/emulator-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Search, X, Filter } from "lucide-react"

interface Console {
  id: string
  name: string
}

interface Emulator {
  id: string
  name: string
  developer: string | null
  description: string | null
  supported_platforms: string[] | null
  features: string[] | null
  image_url: string | null
  slug: string
  recommended: boolean | null
  last_updated: string | null
  created_at: string
  updated_at: string
  console_id: string | null
  console_ids: string[] | null
}

interface EmulatorsClientPageProps {
  emulators: Emulator[]
  consoles: Console[]
}

export function EmulatorsClientPage({ emulators, consoles }: EmulatorsClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<string>("all")
  const [selectedConsole, setSelectedConsole] = useState<string>("all")
  const [showRecommended, setShowRecommended] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")

  // Get unique values for filters
  const developers = useMemo(() => {
    const devs = new Set<string>()
    emulators.forEach((emulator) => {
      if (emulator.developer) {
        devs.add(emulator.developer)
      }
    })
    return Array.from(devs).sort()
  }, [emulators])

  const platforms = useMemo(() => {
    const plats = new Set<string>()
    emulators.forEach((emulator) => {
      if (emulator.supported_platforms) {
        emulator.supported_platforms.forEach((platform) => plats.add(platform))
      }
    })
    return Array.from(plats).sort()
  }, [emulators])

  const features = useMemo(() => {
    const feats = new Set<string>()
    emulators.forEach((emulator) => {
      if (emulator.features) {
        emulator.features.forEach((feature) => feats.add(feature))
      }
    })
    return Array.from(feats).sort()
  }, [emulators])

  // Filter and sort emulators
  const filteredAndSortedEmulators = useMemo(() => {
    const filtered = emulators.filter((emulator) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          emulator.name.toLowerCase().includes(searchLower) ||
          (emulator.developer && emulator.developer.toLowerCase().includes(searchLower)) ||
          (emulator.description && emulator.description.toLowerCase().includes(searchLower)) ||
          (emulator.features && emulator.features.some((feature) => feature.toLowerCase().includes(searchLower)))

        if (!matchesSearch) return false
      }

      // Developer filter
      if (selectedDeveloper !== "all" && emulator.developer !== selectedDeveloper) {
        return false
      }

      // Platform filter
      if (selectedPlatform !== "all") {
        if (!emulator.supported_platforms || !emulator.supported_platforms.includes(selectedPlatform)) {
          return false
        }
      }

      // Feature filter
      if (selectedFeature !== "all") {
        if (!emulator.features || !emulator.features.includes(selectedFeature)) {
          return false
        }
      }

      if (selectedConsole !== "all") {
        const matchesConsole =
          emulator.console_id === selectedConsole ||
          (emulator.console_ids && emulator.console_ids.includes(selectedConsole))

        if (!matchesConsole) {
          return false
        }
      }

      // Recommended filter
      if (showRecommended === "recommended" && !emulator.recommended) {
        return false
      }

      return true
    })

    // Sort emulators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "developer":
          return (a.developer || "").localeCompare(b.developer || "")
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "recommended":
          if (a.recommended && !b.recommended) return -1
          if (!a.recommended && b.recommended) return 1
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [
    emulators,
    searchTerm,
    selectedDeveloper,
    selectedPlatform,
    selectedFeature,
    selectedConsole,
    showRecommended,
    sortBy,
  ])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDeveloper("all")
    setSelectedPlatform("all")
    setSelectedFeature("all")
    setSelectedConsole("all")
    setShowRecommended("all")
    setSortBy("name-asc")
  }

  const hasActiveFilters =
    searchTerm ||
    selectedDeveloper !== "all" ||
    selectedPlatform !== "all" ||
    selectedFeature !== "all" ||
    selectedConsole !== "all" ||
    showRecommended !== "all" ||
    sortBy !== "name-asc"

  // Stats
  const stats = useMemo(() => {
    const recommendedCount = emulators.filter((e) => e.recommended).length
    const developerCount = developers.length
    const platformCount = platforms.length
    const consoleCount = consoles.length

    return {
      total: emulators.length,
      recommended: recommendedCount,
      developers: developerCount,
      platforms: platformCount,
      consoles: consoleCount,
    }
  }, [emulators, developers, platforms, consoles])

  const getConsoleName = (consoleId: string) => {
    const console = consoles.find((c) => c.id === consoleId)
    return console ? console.name : consoleId
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Emulators</h1>
        <p className="text-muted-foreground mb-6">Discover the best emulators for retro gaming</p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="px-3 py-1">
          {stats.total} Total
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {stats.recommended} Recommended
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {stats.developers} Developers
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {stats.platforms} Platforms
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {stats.consoles} Consoles
        </Badge>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters & Search</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search emulators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Console Filter */}
          <Select value={selectedConsole} onValueChange={setSelectedConsole}>
            <SelectTrigger>
              <SelectValue placeholder="All Consoles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Consoles</SelectItem>
              {consoles.map((console) => (
                <SelectItem key={console.id} value={console.id}>
                  {console.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Developer Filter */}
          <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
            <SelectTrigger>
              <SelectValue placeholder="All Developers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Developers</SelectItem>
              {developers.map((developer) => (
                <SelectItem key={developer} value={developer}>
                  {developer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Platform Filter */}
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Feature Filter */}
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger>
              <SelectValue placeholder="All Features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              {features.map((feature) => (
                <SelectItem key={feature} value={feature}>
                  {feature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Recommended Filter */}
          <Select value={showRecommended} onValueChange={setShowRecommended}>
            <SelectTrigger>
              <SelectValue placeholder="All Emulators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emulators</SelectItem>
              <SelectItem value="recommended">Recommended Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="created">Recently Added</SelectItem>
              <SelectItem value="recommended">Recommended First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters & Clear */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchTerm}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {selectedConsole !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Console: {getConsoleName(selectedConsole)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedConsole("all")} />
              </Badge>
            )}
            {selectedDeveloper !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Developer: {selectedDeveloper}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDeveloper("all")} />
              </Badge>
            )}
            {selectedPlatform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Platform: {selectedPlatform}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPlatform("all")} />
              </Badge>
            )}
            {selectedFeature !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Feature: {selectedFeature}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFeature("all")} />
              </Badge>
            )}
            {showRecommended !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Recommended Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setShowRecommended("all")} />
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearFilters} className="ml-2 bg-transparent">
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          Showing {filteredAndSortedEmulators.length} of {emulators.length} emulators
        </p>
      </div>

      {/* Emulators Grid */}
      {filteredAndSortedEmulators.length === 0 ? (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No emulators found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedEmulators.map((emulator) => (
            <EmulatorCard key={emulator.id} emulator={emulator} />
          ))}
        </div>
      )}
    </div>
  )
}
