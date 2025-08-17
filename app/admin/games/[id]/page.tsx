"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import EditGameForm from "./EditGameForm"

async function getGameWithLinks(id: string) {
  const [gameResult, linksResult, consolesResult] = await Promise.all([
    supabase.from("games").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "game").eq("entity_id", id).order("display_order"),
    supabase.from("consoles").select("id, name, manufacturer").order("manufacturer, name"),
  ])

  if (gameResult.error) throw gameResult.error

  return {
    game: gameResult.data,
    links: linksResult.data || [],
    consoles: consolesResult.data || [],
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

  const { game, links, consoles } = data

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

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
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
                {game.release_date && (
                  <div>
                    <strong>Release Date:</strong> <Badge variant="outline">{game.release_date}</Badge>
                  </div>
                )}
                {game.developer && (
                  <div>
                    <strong>Developer:</strong> {game.developer}
                  </div>
                )}
                {game.publisher && (
                  <div>
                    <strong>Publisher:</strong> {game.publisher}
                  </div>
                )}
                {game.genre && (
                  <div>
                    <strong>Genre:</strong> {game.genre}
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
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Game</CardTitle>
            </CardHeader>
            <CardContent>
              <EditGameForm game={game} consoles={consoles} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager entityType="game" entityId={game.id} links={links} onLinksChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
