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
import { EditCustomFirmwareForm } from "./EditCustomFirmwareForm"

async function getCustomFirmwareWithLinks(id: string) {
  const [firmwareResult, linksResult] = await Promise.all([
    supabase.from("custom_firmware").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "custom_firmware").eq("entity_id", id).order("display_order"),
  ])

  if (firmwareResult.error) throw firmwareResult.error

  return {
    firmware: firmwareResult.data,
    links: linksResult.data || [],
  }
}

export default function CustomFirmwareDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["custom-firmware-detail", params.id],
    queryFn: () => getCustomFirmwareWithLinks(params.id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data?.firmware) {
    notFound()
  }

  const { firmware, links } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/custom-firmware">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Custom Firmware
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{firmware.name}</h1>
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
              <CardTitle>Custom Firmware Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {firmware.image_url && (
                  <div className="aspect-video relative">
                    <Image
                      src={firmware.image_url || "/placeholder.svg"}
                      alt={firmware.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {firmware.name}
                  </div>
                  {firmware.version && (
                    <div>
                      <strong>Version:</strong> <Badge variant="secondary">{firmware.version}</Badge>
                    </div>
                  )}
                  {firmware.developers && (
                    <div>
                      <strong>Developers:</strong> {firmware.developers}
                    </div>
                  )}
                  {firmware.stability && (
                    <div>
                      <strong>Stability:</strong> <Badge variant="outline">{firmware.stability}</Badge>
                    </div>
                  )}
                  {firmware.license && (
                    <div>
                      <strong>License:</strong> {firmware.license}
                    </div>
                  )}
                  {firmware.installer_type && (
                    <div>
                      <strong>Installer Type:</strong> {firmware.installer_type}
                    </div>
                  )}
                  {firmware.supported_devices && firmware.supported_devices.length > 0 && (
                    <div>
                      <strong>Supported Devices:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {firmware.supported_devices.map((device) => (
                          <Badge key={device} variant="outline" className="text-xs">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {firmware.features && (
                    <div>
                      <strong>Features:</strong>
                      <p className="mt-1 text-muted-foreground">{firmware.features}</p>
                    </div>
                  )}
                  {firmware.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-muted-foreground">{firmware.description}</p>
                    </div>
                  )}
                  {firmware.notes && (
                    <div>
                      <strong>Notes:</strong>
                      <p className="mt-1 text-muted-foreground">{firmware.notes}</p>
                    </div>
                  )}
                  <div>
                    <strong>Slug:</strong> <code className="text-sm bg-muted px-2 py-1 rounded">{firmware.slug}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Custom Firmware</CardTitle>
            </CardHeader>
            <CardContent>
              <EditCustomFirmwareForm firmware={firmware} onSuccess={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <LinksManager
            entityType="custom_firmware"
            entityId={firmware.id}
            links={links}
            onLinksChange={() => refetch()}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
