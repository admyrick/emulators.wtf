"use client"

import type React from "react"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { ConsoleCard } from "@/components/console-card"
import { EmulatorCard } from "@/components/emulator-card"
import { GameCard } from "@/components/game-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/supabase-logger"

async function searchAll(query: string) {
  if (!query.trim()) return { consoles: [], emulators: [], games: [] }

  try {
    const [consolesResult, emulatorsResult, gamesResult] = await Promise.all([
      supabase
        .from("consoles")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,manufacturer.ilike.%${query}%`)
        .limit(20)
        .then((result) => {
          if (result.error) {
            console.error("Console search error:", result.error)
            return { data: [], error: result.error }
          }
          return result
        }),
      supabase
        .from("emulators")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,developer.ilike.%${query}%`)
        .limit(20)
        .then((result) => {
          if (result.error) {
            console.error("Emulator search error:", result.error)
            return { data: [], error: result.error }
          }
          return result
        }),
      supabase
        .from("games")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)
        .then((result) => {
          if (result.error) {
            console.error("Games search error:", result.error)
            return { data: [], error: result.error }
          }
          return result
        }),
    ])

    if (consolesResult.error) {
      await logger.logError(new Error(`Search consoles failed: ${consolesResult.error.message}`), { query })
    }
    if (emulatorsResult.error) {
      await logger.logError(new Error(`Search emulators failed: ${emulatorsResult.error.message}`), { query })
    }
    if (gamesResult.error) {
      await logger.logError(new Error(`Search games failed: ${gamesResult.error.message}`), { query })
    }

    return {
      consoles: consolesResult.data || [],
      emulators: emulatorsResult.data || [],
      games: gamesResult.data || [],
    }
  } catch (error) {
    console.error("Search error:", error)
    await logger.logError(error as Error, { function: "searchAll", query })
    return { consoles: [], emulators: [], games: [] }
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", initialQuery],
    queryFn: () => searchAll(initialQuery),
    enabled: !!initialQuery,
  })

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const totalResults = (results?.consoles.length || 0) + (results?.emulators.length || 0) + (results?.games.length || 0)

  if (error) {
    console.error("Search query error:", error)
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Search Results</h1>

        <form onSubmit={handleSearch} className="max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for emulators, games, consoles..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {initialQuery && (
          <p className="text-muted-foreground">
            {isLoading ? "Searching..." : `Found ${totalResults} results for "${initialQuery}"`}
          </p>
        )}
      </div>

      {!initialQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search term to find emulators, games, and consoles.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for "{initialQuery}". Try a different search term.</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="consoles">Consoles ({results?.consoles.length || 0})</TabsTrigger>
            <TabsTrigger value="emulators">Emulators ({results?.emulators.length || 0})</TabsTrigger>
            <TabsTrigger value="games">Games ({results?.games.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {results?.consoles && results.consoles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Consoles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.consoles.map((console) => (
                    <ConsoleCard key={console.id} console={console} />
                  ))}
                </div>
              </div>
            )}

            {results?.emulators && results.emulators.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Emulators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.emulators.map((emulator) => (
                    <EmulatorCard key={emulator.id} emulator={emulator} />
                  ))}
                </div>
              </div>
            )}

            {results?.games && results.games.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Games</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="consoles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results?.consoles.map((console) => (
                <ConsoleCard key={console.id} console={console} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emulators">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results?.emulators.map((emulator) => (
                <EmulatorCard key={emulator.id} emulator={emulator} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results?.games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
