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
import { EditToolForm } from "./EditToolForm"

async function getToolWithLinks(id: string) {
  const [toolResult, linksResult] = await Promise.all([
    supabase.from("tools").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "tool").eq("entity_id", id).order("display_order"),
  ])

  if (toolResult.error) throw toolResult.error

  return {
    tool: toolResult.data,
    links: linksResult.data || [],
  }
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tool-detail", params.id],
    queryFn: () => getToolWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.tool) {
    notFound()
  }

  const { tool, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tools">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{tool.name}</h1>
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
              <CardTitle>Tool Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tool.image_url && (
                  <div className="aspect-video relative">
                    <Image
                      src={tool.image_url || "/placeholder.svg"}
                      alt={tool.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {tool.name}
                  </div>
                  {tool.developer && (
                    <div>
                      <strong>Developer:</strong> <Badge variant="secondary">{tool.developer}</Badge>
                    </div>
                  )}
                  {tool.price && (
                    <div>
                      <strong>Price:</strong>{" "}
                      <Badge variant={tool.price === "Free" ? "default" : "outline"}>{tool.price}</Badge>
                    </div>
                  )}
                  {tool.category && (
                    <div>
                      <strong>Category:</strong>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  )}
                  {tool.supported_platforms && tool.supported_platforms.length > 0 && (
                    <div>
                      <strong>Supported Platforms:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tool.supported_platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {tool.features && tool.features.length > 0 && (
                    <div>
                      <strong>Features:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {tool.requirements && (
                    <div>
                      <strong>System Requirements:</strong>
                      <p className="mt-1 text-muted-foreground">{tool.requirements}</p>
                    </div>
                  )}
                  {tool.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">{tool.description}</p>
                    </div>
                  )}
                  <div>
                    <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{tool.slug}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <EditToolForm tool={tool} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager entityType="tool" entityId={tool.id} links={links} onLinksChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
