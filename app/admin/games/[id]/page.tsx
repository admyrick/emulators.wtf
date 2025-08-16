"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

async function getGameWithLinks(id: string) {
  const [gameResult, linksResult] = await Promise.all([
    supabase.from("games").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "game").eq("entity_id", id).order("display_order"),
  ])

  if (gameResult.error) throw gameResult.error

  return {
    game: gameResult.data,
    links: linksResult.data || [],
  }
}

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["game-detail", params.id],
    queryFn: () => getGameWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.game) {
    notFound()
  }

  const { game, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/games">
            <span className="mr-2">←</span>
            Back to Games
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{game.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Details */}
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {game.image_url && (
              <div className="aspect-[3/4] relative max-w-sm">
                <Image
                  src={game.image_url || "/placeholder.svg"}
                  alt={game.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {game.name}
              </div>
              {game.release_year && (
                <div>
                  <strong>Release Year:</strong> <Badge variant="outline">{game.release_year}</Badge>
                </div>
              )}
              {game.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{game.description}</p>
                </div>
              )}
              <div>
                <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{game.slug}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Manager */}
        <LinksManager entityType="game" entityId={game.id} links={links} onLinksChange={() => refetch()} />
      </div>
    </div>
  )
}
