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
import { EditHandheldForm } from "./EditHandheldForm"

async function getHandheldWithLinks(id: string) {
  const [handheldResult, linksResult] = await Promise.all([
    supabase.from("handhelds").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "handheld").eq("entity_id", id).order("display_order"),
  ])

  if (handheldResult.error) throw handheldResult.error

  return {
    handheld: handheldResult.data,
    links: linksResult.data || [],
  }
}

export default function HandheldDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["handheld-detail", params.id],
    queryFn: () => getHandheldWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.handheld) {
    notFound()
  }

  const { handheld, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/handhelds">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Handhelds
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{handheld.name}</h1>
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
              <CardTitle>Handheld Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {handheld.image_url && (
                  <div className="aspect-video relative">
                    <Image
                      src={handheld.image_url || "/placeholder.svg"}
                      alt={handheld.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {handheld.name}
                  </div>
                  {handheld.manufacturer && (
                    <div>
                      <strong>Manufacturer:</strong> <Badge variant="secondary">{handheld.manufacturer}</Badge>
                    </div>
                  )}
                  {handheld.operating_system && (
                    <div>
                      <strong>Operating System:</strong> {handheld.operating_system}
                    </div>
                  )}
                  {handheld.processor && (
                    <div>
                      <strong>Processor:</strong> {handheld.processor}
                    </div>
                  )}
                  {handheld.ram && (
                    <div>
                      <strong>RAM:</strong> {handheld.ram}
                    </div>
                  )}
                  {handheld.storage && (
                    <div>
                      <strong>Storage:</strong> {handheld.storage}
                    </div>
                  )}
                  {handheld.screen_size && (
                    <div>
                      <strong>Screen Size:</strong> {handheld.screen_size}
                    </div>
                  )}
                  {handheld.connectivity && handheld.connectivity.length > 0 && (
                    <div>
                      <strong>Connectivity:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {handheld.connectivity.map((conn) => (
                          <Badge key={conn} variant="outline" className="text-xs">
                            {conn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {handheld.supported_formats && handheld.supported_formats.length > 0 && (
                    <div>
                      <strong>Supported Formats:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {handheld.supported_formats.map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {handheld.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">{handheld.description}</p>
                    </div>
                  )}
                  <div>
                    <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{handheld.slug}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Handheld</CardTitle>
            </CardHeader>
            <CardContent>
              <EditHandheldForm handheld={handheld} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager entityType="handheld" entityId={handheld.id} links={links} onLinksChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
