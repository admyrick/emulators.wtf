"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditCfwAppForm } from "./EditCfwAppForm"

async function getCfwAppWithLinks(id: string) {
  const [appResult, linksResult] = await Promise.all([
    supabase.from("cfw_apps").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "cfw_app").eq("entity_id", id).order("display_order"),
  ])

  if (appResult.error) throw appResult.error

  return {
    app: appResult.data,
    links: linksResult.data || [],
  }
}

export default function CfwAppDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cfw-app-detail", params.id],
    queryFn: () => getCfwAppWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.app) {
    notFound()
  }

  const { app, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cfw-apps">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CFW Apps
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{app.name}</h1>
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
              <CardTitle>CFW App Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <strong>Name:</strong> {app.name}
                </div>
                {app.latest_version && (
                  <div>
                    <strong>Latest Version:</strong> <Badge variant="secondary">{app.latest_version}</Badge>
                  </div>
                )}
                {app.website && (
                  <div>
                    <strong>Website:</strong>{" "}
                    <a
                      href={app.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {app.website}
                    </a>
                  </div>
                )}
                {app.repo_url && (
                  <div>
                    <strong>Repository:</strong>{" "}
                    <a
                      href={app.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {app.repo_url}
                    </a>
                  </div>
                )}
                {app.description && (
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-muted-foreground">{app.description}</p>
                  </div>
                )}
                <div>
                  <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{app.slug}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit CFW App</CardTitle>
            </CardHeader>
            <CardContent>
              <EditCfwAppForm app={app} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager entityType="cfw_app" entityId={app.id} links={links} onLinksChange={() => refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
