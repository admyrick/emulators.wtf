"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LinksManager } from "@/components/links-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

async function getToolWithCompatibility(id: string) {
  const [
    toolResult,
    linksResult,
    consoleCompatResult,
    emulatorCompatResult,
    gameCompatResult,
    handheldCompatResult,
    cfwCompatResult,
  ] = await Promise.all([
    supabase.from("tools").select("*").eq("id", id).single(),
    supabase.from("links").select("*").eq("entity_type", "tool").eq("entity_id", id).order("created_at"),
    supabase
      .from("tool_console_compatibility")
      .select(`
        id, compatibility_notes,
        console:consoles(id, name, slug)
      `)
      .eq("tool_id", id),
    supabase
      .from("tool_emulator_compatibility")
      .select(`
        id, compatibility_notes,
        emulator:emulators(id, name, slug)
      `)
      .eq("tool_id", id),
    supabase
      .from("tool_game_compatibility")
      .select(`
        id, compatibility_notes,
        game:games(id, name, slug)
      `)
      .eq("tool_id", id),
    supabase
      .from("tool_handheld_compatibility")
      .select(`
        id, compatibility_notes,
        handheld:handhelds(id, name, slug)
      `)
      .eq("tool_id", id),
    supabase
      .from("tool_custom_firmware_compatibility")
      .select(`
        id, compatibility_notes,
        custom_firmware:custom_firmware(id, name, slug)
      `)
      .eq("tool_id", id),
  ])

  if (toolResult.error) throw toolResult.error

  return {
    tool: toolResult.data,
    links: linksResult.data || [],
    consoleCompatibility: consoleCompatResult.data || [],
    emulatorCompatibility: emulatorCompatResult.data || [],
    gameCompatibility: gameCompatResult.data || [],
    handheldCompatibility: handheldCompatResult.data || [],
    cfwCompatibility: cfwCompatResult.data || [],
  }
}

async function getAvailableEntities() {
  const [consolesResult, emulatorsResult, gamesResult, handheldsResult, cfwResult] = await Promise.all([
    supabase.from("consoles").select("id, name, slug").order("name"),
    supabase.from("emulators").select("id, name, slug").order("name"),
    supabase.from("games").select("id, name, slug").order("name"),
    supabase.from("handhelds").select("id, name, slug").order("name"),
    supabase.from("custom_firmware").select("id, name, slug").order("name"),
  ])

  return {
    consoles: consolesResult.data || [],
    emulators: emulatorsResult.data || [],
    games: gamesResult.data || [],
    handhelds: handheldsResult.data || [],
    customFirmware: cfwResult.data || [],
  }
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tool-detail", params.id],
    queryFn: () => getToolWithCompatibility(params.id),
  })

  const { data: availableEntities } = useQuery({
    queryKey: ["available-entities"],
    queryFn: getAvailableEntities,
  })

  const addCompatibility = async (entityType: string, entityId: string, notes: string) => {
    const tableName = `tool_${entityType}_compatibility`
    const columnName = `${entityType}_id`

    const { error } = await supabase.from(tableName).insert({
      tool_id: params.id,
      [columnName]: entityId,
      compatibility_notes: notes || null,
    })

    if (error) {
      console.error("Compatibility add error:", error)
      toast({
        title: "Failed to add compatibility",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Compatibility added successfully" })
      refetch()
    }
  }

  const removeCompatibility = async (entityType: string, compatibilityId: string) => {
    const tableName = `tool_${entityType}_compatibility`

    const { error } = await supabase.from(tableName).delete().eq("id", compatibilityId)

    if (error) {
      console.error("Compatibility remove error:", error)
      toast({
        title: "Failed to remove compatibility",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Compatibility removed successfully" })
      refetch()
    }
  }

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

  const {
    tool,
    links,
    consoleCompatibility,
    emulatorCompatibility,
    gameCompatibility,
    handheldCompatibility,
    cfwCompatibility,
  } = data

  const CompatibilityManager = ({ type, title, compatibility, availableItems }: any) => {
    const [selectedItem, setSelectedItem] = useState("")
    const [notes, setNotes] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const handleAdd = async () => {
      if (!selectedItem) return
      await addCompatibility(type, selectedItem, notes)
      setSelectedItem("")
      setNotes("")
      setIsOpen(false)
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {title} Compatibility</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select {title.slice(0, -1)}</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${title.toLowerCase().slice(0, -1)}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Compatibility Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes about compatibility..."
                    />
                  </div>
                  <Button onClick={handleAdd} disabled={!selectedItem}>
                    Add Compatibility
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {compatibility.length === 0 ? (
            <p className="text-muted-foreground text-sm">No {title.toLowerCase()} compatibility added yet.</p>
          ) : (
            <div className="space-y-2">
              {compatibility.map((compat: any) => {
                const entity = compat[type] || compat[type.replace("_", "")]
                return (
                  <div key={compat.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{entity?.name}</div>
                      {compat.compatibility_notes && (
                        <div className="text-sm text-muted-foreground">{compat.compatibility_notes}</div>
                      )}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeCompatibility(type, compat.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {tool.category && tool.category.length > 0 && (
                  <div>
                    <strong>Categories:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.category.map((cat: string) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {tool.supported_platforms && tool.supported_platforms.length > 0 && (
                  <div>
                    <strong>Supported Platforms:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.supported_platforms.map((platform: string) => (
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
                      {tool.features.map((feature: string) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
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
            </CardContent>
          </Card>

          {/* Links Manager */}
          <LinksManager entityType="tool" entityId={tool.id} links={links} onLinksChange={() => refetch()} />
        </div>

        {/* Compatibility Management */}
        <div className="space-y-6">
          <CompatibilityManager
            type="console"
            title="Consoles"
            compatibility={consoleCompatibility}
            availableItems={availableEntities?.consoles}
          />

          <CompatibilityManager
            type="emulator"
            title="Emulators"
            compatibility={emulatorCompatibility}
            availableItems={availableEntities?.emulators}
          />

          <CompatibilityManager
            type="game"
            title="Games"
            compatibility={gameCompatibility}
            availableItems={availableEntities?.games}
          />

          <CompatibilityManager
            type="handheld"
            title="Handhelds"
            compatibility={handheldCompatibility}
            availableItems={availableEntities?.handhelds}
          />

          <CompatibilityManager
            type="custom_firmware"
            title="Custom Firmware"
            compatibility={cfwCompatibility}
            availableItems={availableEntities?.customFirmware}
          />
        </div>
      </div>
    </div>
  )
}
