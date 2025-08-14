"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

async function getEmulatorWithLinks(id: string) {
  const [emulatorResult, linksResult] = await Promise.all([
    supabase.from("emulators").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "emulator").eq("entity_id", id).order("display_order"),
  ])

  if (emulatorResult.error) throw emulatorResult.error

  return {
    emulator: emulatorResult.data,
    links: linksResult.data || [],
  }
}

export default function EmulatorDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["emulator-detail", params.id],
    queryFn: () => getEmulatorWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.emulator) {
    notFound()
  }

  const { emulator, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/emulators">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Emulators
          </Link>
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {emulator.name}
          {emulator.recommended && <Star className="w-6 h-6 text-yellow-500" />}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emulator Details */}
        <Card>
          <CardHeader>
            <CardTitle>Emulator Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emulator.image_url && (
              <div className="aspect-video relative">
                <Image
                  src={emulator.image_url || "/placeholder.svg"}
                  alt={emulator.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {emulator.name}
              </div>
              {emulator.developer && (
                <div>
                  <strong>Developer:</strong> <Badge variant="secondary">{emulator.developer}</Badge>
                </div>
              )}
              {emulator.supported_platforms && emulator.supported_platforms.length > 0 && (
                <div>
                  <strong>Supported Platforms:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {emulator.supported_platforms.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {emulator.features && emulator.features.length > 0 && (
                <div>
                  <strong>Features:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {emulator.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {emulator.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{emulator.description}</p>
                </div>
              )}
              <div>
                <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{emulator.slug}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Manager */}
        <LinksManager entityType="emulator" entityId={emulator.id} links={links} onLinksChange={() => refetch()} />
      </div>
    </div>
  )
}
