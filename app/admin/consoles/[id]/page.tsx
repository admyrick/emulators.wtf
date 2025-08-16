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

async function getConsoleWithLinks(id: string) {
  const [consoleResult, linksResult] = await Promise.all([
    supabase.from("consoles").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "console").eq("entity_id", id).order("display_order"),
  ])

  if (consoleResult.error) throw consoleResult.error

  return {
    console: consoleResult.data,
    links: linksResult.data || [],
  }
}

export default function ConsoleDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["console-detail", params.id],
    queryFn: () => getConsoleWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.console) {
    notFound()
  }

  const { console, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/consoles">
            <span className="mr-2">←</span>
            Back to Consoles
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{console.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Console Details */}
        <Card>
          <CardHeader>
            <CardTitle>Console Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {console.image_url && (
              <div className="aspect-video relative">
                <Image
                  src={console.image_url || "/placeholder.svg"}
                  alt={console.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {console.name}
              </div>
              {console.manufacturer && (
                <div>
                  <strong>Manufacturer:</strong> <Badge variant="secondary">{console.manufacturer}</Badge>
                </div>
              )}
              {console.release_year && (
                <div>
                  <strong>Release Year:</strong> <Badge variant="outline">{console.release_year}</Badge>
                </div>
              )}
              {console.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{console.description}</p>
                </div>
              )}
              <div>
                <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{console.slug}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Manager */}
        <LinksManager entityType="console" entityId={console.id} links={links} onLinksChange={() => refetch()} />
      </div>
    </div>
  )
}
