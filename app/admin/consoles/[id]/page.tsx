"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditConsoleForm } from "./EditConsoleForm"

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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consoles
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{console.name}</h1>
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
              <CardTitle>Console Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {console.generation && (
                    <div>
                      <strong>Generation:</strong> <Badge variant="outline">{console.generation}</Badge>
                    </div>
                  )}
                  {console.release_year && (
                    <div>
                      <strong>Release Year:</strong> <Badge variant="outline">{console.release_year}</Badge>
                    </div>
                  )}
                  {console.release_date && (
                    <div>
                      <strong>Release Date:</strong> {new Date(console.release_date).toLocaleDateString()}
                    </div>
                  )}
                  {console.discontinued_date && (
                    <div>
                      <strong>Discontinued:</strong> {new Date(console.discontinued_date).toLocaleDateString()}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Console</CardTitle>
            </CardHeader>
            <CardContent>
              <EditConsoleForm console={console} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager entityType="console" entityId={console.id} links={links} onLinksChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
