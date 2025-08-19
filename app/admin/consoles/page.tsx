"use client"

import type React from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, ExternalLink, Monitor } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { createConsole, updateConsole, deleteConsole } from "../actions"
import { useRouter } from "next/navigation"

async function getConsoles(searchQuery?: string) {
  let query = supabase.from("consoles").select("*").order("name")

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function getEmulatorsByConsoleId(consoleId: string) {
  const { data, error } = await supabase
    .from("emulators")
    .select("id, name, developer, recommended")
    .contains("console_ids", [consoleId])
    .order("recommended", { ascending: false })
    .order("name")

  if (error) throw error
  return data
}

export default function AdminConsolesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingConsole, setEditingConsole] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: consoles, isLoading } = useQuery({
    queryKey: ["admin-consoles", searchQuery],
    queryFn: () => getConsoles(searchQuery),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  const handleDelete = async (id: string) => {
    const result = await deleteConsole(id)
    if (result.success) {
      toast({ title: "Console deleted successfully" })
      queryClient.invalidateQueries({ queryKey: ["admin-consoles"] })
      queryClient.removeQueries({ queryKey: ["admin-consoles"] })
      router.refresh()
    } else {
      toast({ title: "Failed to delete console", variant: "destructive" })
    }
  }

  const ConsoleForm = ({ console, onSubmit, onCancel }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.target as HTMLFormElement)

      try {
        if (console) {
          const { data: existingConsole, error: checkError } = await supabase
            .from("consoles")
            .select("id")
            .eq("id", console.id)
            .maybeSingle()

          if (checkError) {
            console.error("Error checking console existence:", checkError)
            toast({
              title: "Error checking console",
              description: "Unable to verify console exists. Please try again.",
              variant: "destructive",
            })
            return
          }

          if (!existingConsole) {
            toast({
              title: "Console no longer exists",
              description: "This console was deleted. Refreshing the list...",
              variant: "destructive",
            })
            onCancel()
            queryClient.invalidateQueries({ queryKey: ["admin-consoles"] })
            queryClient.removeQueries({ queryKey: ["admin-consoles"] })
            router.refresh()
            return
          }
        }

        let result
        if (console) {
          result = await updateConsole(console.id, formData)
        } else {
          result = await createConsole(formData)
        }

        if (result.success) {
          toast({ title: `Console ${console ? "updated" : "created"} successfully` })
          onCancel()
          queryClient.invalidateQueries({ queryKey: ["admin-consoles"] })
          queryClient.removeQueries({ queryKey: ["admin-consoles"] })
          router.refresh()
        } else {
          if (result.error?.includes("No console found with ID") || result.error?.includes("Console not found")) {
            toast({
              title: "Console no longer exists",
              description: "This console was deleted. Refreshing the list...",
              variant: "destructive",
            })
            onCancel()
            queryClient.invalidateQueries({ queryKey: ["admin-consoles"] })
            queryClient.removeQueries({ queryKey: ["admin-consoles"] })
            router.refresh()
          } else {
            toast({
              title: `Failed to ${console ? "update" : "create"} console`,
              description: result.error,
              variant: "destructive",
            })
          }
        }
      } catch (error: any) {
        if (error.message?.includes("No console found with ID") || error.message?.includes("Console not found")) {
          toast({
            title: "Console no longer exists",
            description: "This console was deleted. Refreshing the list...",
            variant: "destructive",
          })
          onCancel()
          queryClient.invalidateQueries({ queryKey: ["admin-consoles"] })
          queryClient.removeQueries({ queryKey: ["admin-consoles"] })
          router.refresh()
        } else {
          toast({
            title: `Failed to ${console ? "update" : "create"} console`,
            description: error.message,
            variant: "destructive",
          })
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={console?.name || ""} required />
        </div>
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" name="manufacturer" defaultValue={console?.manufacturer || ""} />
        </div>
        <div>
          <Label htmlFor="release_year">Release Year</Label>
          <Input id="release_year" name="release_year" type="number" defaultValue={console?.release_year || ""} />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={console?.slug || ""} placeholder="auto-generated from name" />
        </div>
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={console?.image_url || ""} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={console?.description || ""} rows={3} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : console ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  const ConsoleCard = ({ console }: { console: any }) => {
    const { data: consoleEmulators } = useQuery({
      queryKey: ["console-emulators", console.id],
      queryFn: () => getEmulatorsByConsoleId(console.id),
    })

    return (
      <Card className="group hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{console.name}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/consoles/${console.id}`}>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingConsole(console)}>
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(console.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {console.image_url && (
            <div className="aspect-video relative mb-3">
              <Image
                src={console.image_url || "/placeholder.svg"}
                alt={console.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="space-y-2">
            {console.manufacturer && <Badge variant="secondary">{console.manufacturer}</Badge>}
            {console.release_year && <Badge variant="outline">{console.release_year}</Badge>}

            {/* Show available emulators */}
            {consoleEmulators && consoleEmulators.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Available Emulators:</p>
                <div className="flex flex-wrap gap-1">
                  {consoleEmulators.slice(0, 3).map((emulator: any) => (
                    <Badge key={emulator.id} variant="outline" className="text-xs">
                      <Monitor className="w-3 h-3 mr-1" />
                      {emulator.name}
                      {emulator.recommended && " ⭐"}
                    </Badge>
                  ))}
                  {consoleEmulators.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{consoleEmulators.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {console.description && <p className="text-sm text-muted-foreground line-clamp-2">{console.description}</p>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consoles</h1>
          <p className="text-muted-foreground">Manage gaming consoles and view their available emulators</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Console
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="create-console-description">
            <DialogHeader>
              <DialogTitle>Create New Console</DialogTitle>
              <DialogDescription id="create-console-description">
                Add a new gaming console or system to the database with details like name, manufacturer, and release
                year.
              </DialogDescription>
            </DialogHeader>
            <ConsoleForm onSubmit={() => {}} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search consoles..."
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
          {consoles?.map((console) => (
            <ConsoleCard key={console.id} console={console} />
          ))}
        </div>
      )}

      {consoles && consoles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No consoles found matching your search.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingConsole} onOpenChange={() => setEditingConsole(null)}>
        <DialogContent aria-describedby="edit-console-description">
          <DialogHeader>
            <DialogTitle>Edit Console</DialogTitle>
            <DialogDescription id="edit-console-description">
              Update the console information including name, manufacturer, release year, and other details.
            </DialogDescription>
          </DialogHeader>
          {editingConsole && (
            <ConsoleForm console={editingConsole} onSubmit={() => {}} onCancel={() => setEditingConsole(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
