"use client"

import type React from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Search, Star, ExternalLink, Gamepad2 } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { createEmulator, updateEmulator, deleteEmulator } from "../actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

async function getEmulators(searchQuery?: string) {
  let query = supabase.from("emulators").select("*").order("name")

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function getConsoles() {
  const { data, error } = await supabase.from("consoles").select("id, name, manufacturer").order("name")
  if (error) throw error
  return data
}

async function getConsolesByIds(consoleIds: string[]) {
  if (!consoleIds || consoleIds.length === 0) return []
  const { data, error } = await supabase.from("consoles").select("id, name, manufacturer").in("id", consoleIds)
  if (error) throw error
  return data
}

export default function AdminEmulatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingEmulator, setEditingEmulator] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: emulators, isLoading } = useQuery({
    queryKey: ["admin-emulators", searchQuery],
    queryFn: () => getEmulators(searchQuery),
  })

  const { data: consoles } = useQuery({
    queryKey: ["consoles-list"],
    queryFn: getConsoles,
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this emulator?")) return

    const result = await deleteEmulator(id.toString())
    if (result.success) {
      toast({ title: "Emulator deleted successfully" })
      queryClient.invalidateQueries({ queryKey: ["admin-emulators"] })
    } else {
      toast({ title: "Failed to delete emulator", variant: "destructive" })
    }
  }

  const EmulatorForm = ({ emulator, onSubmit, onCancel }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedConsoles, setSelectedConsoles] = useState<string[]>(emulator?.console_ids || [])

    const { data: emulatorConsoles } = useQuery({
      queryKey: ["emulator-consoles", emulator?.console_ids],
      queryFn: () => getConsolesByIds(emulator?.console_ids || []),
      enabled: !!emulator?.console_ids,
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.target as HTMLFormElement)

      // Add selected consoles to form data
      formData.append("console_ids", JSON.stringify(selectedConsoles))

      try {
        let result
        if (emulator) {
          console.log("[v0] Updating emulator with ID:", emulator.id, "Type:", typeof emulator.id)
          result = await updateEmulator(emulator.id.toString(), formData)
        } else {
          result = await createEmulator(formData)
        }

        if (result.success) {
          toast({ title: `Emulator ${emulator ? "updated" : "created"} successfully` })
          onCancel()
          queryClient.invalidateQueries({ queryKey: ["admin-emulators"] })
        } else {
          toast({
            title: `Failed to ${emulator ? "update" : "create"} emulator`,
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Error in form submission:", error)
        toast({
          title: `Failed to ${emulator ? "update" : "create"} emulator`,
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleConsoleToggle = (consoleId: string) => {
      setSelectedConsoles((prev) =>
        prev.includes(consoleId) ? prev.filter((id) => id !== consoleId) : [...prev, consoleId],
      )
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={emulator?.name || ""} required />
        </div>
        <div>
          <Label htmlFor="developer">Developer</Label>
          <Input id="developer" name="developer" defaultValue={emulator?.developer || ""} />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={emulator?.slug || ""} placeholder="auto-generated from name" />
        </div>
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={emulator?.image_url || ""} />
        </div>

        {/* Console Selection */}
        <div>
          <Label>Supported Consoles</Label>
          <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
            {consoles?.map((console) => (
              <div key={console.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`console-${console.id}`}
                  checked={selectedConsoles.includes(console.id)}
                  onCheckedChange={() => handleConsoleToggle(console.id)}
                />
                <Label htmlFor={`console-${console.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{console.name}</span>
                    {console.manufacturer && (
                      <Badge variant="outline" className="text-xs">
                        {console.manufacturer}
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Select which gaming consoles this emulator supports</p>
        </div>

        <div>
          <Label htmlFor="supported_platforms">Supported Platforms (comma-separated)</Label>
          <Input
            id="supported_platforms"
            name="supported_platforms"
            defaultValue={emulator?.supported_platforms?.join(", ") || ""}
            placeholder="Windows, macOS, Linux"
          />
        </div>
        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Input
            id="features"
            name="features"
            defaultValue={emulator?.features?.join(", ") || ""}
            placeholder="Save States, Netplay, Cheats"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="recommended" name="recommended" value="true" defaultChecked={emulator?.recommended || false} />
          <Label htmlFor="recommended">Recommended</Label>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={emulator?.description || ""} rows={3} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : emulator ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  const EmulatorCard = ({ emulator }: { emulator: any }) => {
    const { data: emulatorConsoles } = useQuery({
      queryKey: ["emulator-consoles", emulator.console_ids],
      queryFn: () => getConsolesByIds(emulator.console_ids || []),
      enabled: !!emulator.console_ids?.length,
    })

    return (
      <Card key={emulator.id} className="group hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
              {emulator.name}
              {emulator.recommended && <Star className="w-4 h-4 text-yellow-500" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/emulators/${emulator.id}`}>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log("[v0] Editing emulator:", emulator.id, emulator.name)
                  setEditingEmulator(emulator)
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(emulator.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emulator.image_url && (
            <div className="aspect-video relative mb-3">
              <Image
                src={emulator.image_url || "/placeholder.svg"}
                alt={emulator.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="space-y-2">
            {emulator.developer && <Badge variant="secondary">{emulator.developer}</Badge>}

            {/* Show supported consoles */}
            {emulatorConsoles && emulatorConsoles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Supported Consoles:</p>
                <div className="flex flex-wrap gap-1">
                  {emulatorConsoles.slice(0, 3).map((console: any) => (
                    <Badge key={console.id} variant="outline" className="text-xs">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      {console.name}
                    </Badge>
                  ))}
                  {emulatorConsoles.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{emulatorConsoles.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {emulator.supported_platforms && (
              <div className="flex flex-wrap gap-1">
                {emulator.supported_platforms.slice(0, 3).map((platform: string) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            )}
            {emulator.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{emulator.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Emulators</h1>
          <p className="text-muted-foreground">Manage emulator software and their supported consoles</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/emulators/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Emulator
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emulators..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emulators?.map((emulator) => (
            <EmulatorCard key={emulator.id} emulator={emulator} />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEmulator} onOpenChange={() => setEditingEmulator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-emulator-description">
          <DialogHeader>
            <DialogTitle>Edit Emulator</DialogTitle>
            <DialogDescription id="edit-emulator-description">
              Update the emulator information including supported consoles, platforms, features, and recommendation
              status.
            </DialogDescription>
          </DialogHeader>
          {editingEmulator && (
            <EmulatorForm emulator={editingEmulator} onSubmit={() => {}} onCancel={() => setEditingEmulator(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
