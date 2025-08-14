import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, ExternalLink } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Game {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  developer: string | null
  publisher: string | null
  genre: string | null
  release_year: number | null
  rating: string | null
  console_id: string | null
  created_at: string
  updated_at: string
  consoles?: {
    id: string
    name: string
    manufacturer: string
  } | null
}

async function getGames(): Promise<Game[]> {
  try {
    // First try with the relationship
    const { data: gamesWithConsoles, error: relationshipError } = await supabase
      .from("games")
      .select(`
        *,
        consoles (
          id,
          name,
          manufacturer
        )
      `)
      .order("name", { ascending: true })

    if (!relationshipError && gamesWithConsoles) {
      return gamesWithConsoles
    }

    // Fallback: get games without the relationship
    console.log("Relationship query failed, falling back to basic query:", relationshipError)
    const { data: games, error: basicError } = await supabase
      .from("games")
      .select("*")
      .order("name", { ascending: true })

    if (basicError) {
      console.error("Error fetching games:", basicError)
      throw new Error(`Failed to fetch games: ${basicError.message}`)
    }

    return games || []
  } catch (error) {
    console.error("Error in getGames:", error)
    throw error
  }
}

async function getGamesCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error getting games count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error in getGamesCount:", error)
    return 0
  }
}

function GameCard({ game }: { game: Game }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{game.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {game.description || "No description available"}
            </CardDescription>
          </div>
          {game.image_url && (
            <img
              src={game.image_url || "/placeholder.svg"}
              alt={game.name}
              className="w-16 h-16 object-cover rounded-md ml-4 flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          {game.consoles && (
            <Badge variant="secondary">
              {game.consoles.manufacturer} {game.consoles.name}
            </Badge>
          )}
          {game.genre && <Badge variant="outline">{game.genre}</Badge>}
          {game.release_year && <Badge variant="outline">{game.release_year}</Badge>}
          {game.rating && <Badge variant="outline">{game.rating}</Badge>}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
          {game.developer && (
            <div>
              <span className="font-medium">Developer:</span> {game.developer}
            </div>
          )}
          {game.publisher && (
            <div>
              <span className="font-medium">Publisher:</span> {game.publisher}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/admin/games/${game.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/game/${game.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

async function GamesContent() {
  const [games, totalCount] = await Promise.all([getGames(), getGamesCount()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="text-muted-foreground">
            Manage game entries and their details ({totalCount} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/games/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Link>
        </Button>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No games found</p>
            <Button asChild>
              <Link href="/admin/games/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Game
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminGamesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GamesContent />
    </Suspense>
  )
}
