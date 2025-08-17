"use client"

import type React from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToolCard } from "@/components/tool-card"
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
const Plus = () => <span className="inline-block">➕</span>
const Edit = () => <span className="inline-block">✏️</span>
const Trash2 = () => <span className="inline-block">🗑️</span>
const Search = () => <span className="inline-block">🔍</span>
const ExternalLink = () => <span className="inline-block">🔗</span>
const Wrench = () => <span className="inline-block">🔧</span>

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { createTool, updateTool, deleteTool } from "../actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

async function getTools(searchQuery?: string) {
  let query = supabase.from("tools").select("*").order("name")

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export default function AdminToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin-tools", searchQuery],
    queryFn: () => getTools(searchQuery),
  })

  const handleDelete = async (id: string) => {
    const result = await deleteTool(id)
    if (result.success) {
      toast({ title: "Tool deleted successfully" })
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] })
    } else {
      toast({ title: "Failed to delete tool", variant: "destructive" })
    }
  }

  const ToolForm = ({ tool, onSubmit, onCancel }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.target as HTMLFormElement)

      try {
        let result
        if (tool) {
          result = await updateTool(tool.id, formData)
        } else {
          result = await createTool(formData)
        }

        if (result.success) {
          toast({ title: `Tool ${tool ? "updated" : "created"} successfully` })
          onCancel()
          queryClient.invalidateQueries({ queryKey: ["admin-tools"] })
        } else {
          toast({ title: `Failed to ${tool ? "update" : "create"} tool`, variant: "destructive" })
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={tool?.name || ""} required />
        </div>
        <div>
          <Label htmlFor="developer">Developer</Label>
          <Input id="developer" name="developer" defaultValue={tool?.developer || ""} />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={tool?.slug || ""} placeholder="auto-generated from name" />
        </div>
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={tool?.image_url || ""} />
        </div>
        <div>
          <Label htmlFor="category">Category (comma-separated)</Label>
          <Input
            id="category"
            name="category"
            defaultValue={tool?.category?.join(", ") || ""}
            placeholder="ROM Management, Save States, Cheats"
          />
        </div>
        <div>
          <Label htmlFor="supported_platforms">Supported Platforms (comma-separated)</Label>
          <Input
            id="supported_platforms"
            name="supported_platforms"
            defaultValue={tool?.supported_platforms?.join(", ") || ""}
            placeholder="Windows, macOS, Linux"
          />
        </div>
        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Input
            id="features"
            name="features"
            defaultValue={tool?.features?.join(", ") || ""}
            placeholder="Batch Processing, GUI Interface, Command Line"
          />
        </div>
        <div>
          <Label htmlFor="requirements">System Requirements</Label>
          <Input
            id="requirements"
            name="requirements"
            defaultValue={tool?.requirements || ""}
            placeholder="4GB RAM, DirectX 11"
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" defaultValue={tool?.price || ""} placeholder="Free, $19.99, etc." />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={tool?.description || ""} rows={3} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : tool ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="text-muted-foreground">Manage emulation tools and utilities</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/tools/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              aria-describedby="create-tool-description"
            >
              <DialogHeader>
                <DialogTitle>Create New Tool</DialogTitle>
                <DialogDescription id="create-tool-description">
                  Add a new emulation tool or utility to the database with details about features, platforms, and
                  requirements.
                </DialogDescription>
              </DialogHeader>
              <ToolForm onSubmit={() => {}} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
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
          {tools?.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTool} onOpenChange={() => setEditingTool(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-tool-description">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription id="edit-tool-description">
              Update the tool information including features, platforms, requirements, and pricing.
            </DialogDescription>
          </DialogHeader>
          {editingTool && <ToolForm tool={editingTool} onSubmit={() => {}} onCancel={() => setEditingTool(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
