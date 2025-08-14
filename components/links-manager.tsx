"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ExternalLink, GripVertical } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createLink, updateLink, deleteLink } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/supabase"

type Link = Database["public"]["Tables"]["links"]["Row"]
type LinkType = Link["link_type"]
type EntityType = Link["entity_type"]

interface LinksManagerProps {
  entityType: EntityType
  entityId: string
  links: Link[]
  onLinksChange?: () => void
}

const linkTypeLabels: Record<LinkType, string> = {
  download: "Download",
  official: "Official Site",
  documentation: "Documentation",
  forum: "Forum",
  wiki: "Wiki",
  source: "Source Code",
  general: "General",
}

const linkTypeColors: Record<LinkType, string> = {
  download: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  official: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  documentation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  forum: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  wiki: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  source: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  general: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
}

export function LinksManager({ entityType, entityId, links, onLinksChange }: LinksManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const router = useRouter()

  const sortedLinks = [...links].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

  const handleDelete = async (linkId: string) => {
    const result = await deleteLink(linkId)
    if (result.success) {
      toast({ title: "Link deleted successfully" })
      onLinksChange?.()
      router.refresh()
    } else {
      toast({ title: "Failed to delete link", variant: "destructive" })
    }
  }

  const LinkForm = ({ link, onCancel }: { link?: Link; onCancel: () => void }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.target as HTMLFormElement)

      // Ensure entity_type and entity_id are properly set
      const linkData = {
        entity_type: entityType,
        entity_id: entityId,
        name: formData.get("name") as string,
        url: formData.get("url") as string,
        description: (formData.get("description") as string) || null,
        link_type: (formData.get("link_type") as string) || "general",
        is_primary: formData.get("is_primary") === "true",
        display_order: Number.parseInt(formData.get("display_order") as string) || 0,
      }

      try {
        let result
        if (link) {
          result = await updateLink(link.id, linkData)
        } else {
          result = await createLink(linkData)
        }

        if (result.success) {
          toast({ title: `Link ${link ? "updated" : "created"} successfully` })
          onCancel()
          onLinksChange?.()
          router.refresh()
        } else {
          toast({
            title: `Failed to ${link ? "update" : "create"} link`,
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error: any) {
        toast({
          title: `Failed to ${link ? "update" : "create"} link`,
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">
            Link Name *
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={link?.name || ""}
            required
            placeholder="e.g., Official Download"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <div>
          <Label htmlFor="url" className="text-white">
            URL *
          </Label>
          <Input
            id="url"
            name="url"
            type="url"
            defaultValue={link?.url || ""}
            required
            placeholder="https://example.com"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <div>
          <Label htmlFor="link_type" className="text-white">
            Link Type
          </Label>
          <Select name="link_type" defaultValue={link?.link_type || "general"}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {Object.entries(linkTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-white hover:bg-slate-600">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description" className="text-white">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={link?.description || ""}
            placeholder="Optional description of this link"
            rows={2}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <div>
          <Label htmlFor="display_order" className="text-white">
            Display Order
          </Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            defaultValue={link?.display_order || 0}
            placeholder="0"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="is_primary" name="is_primary" value="true" defaultChecked={link?.is_primary || false} />
          <Label htmlFor="is_primary" className="text-white">
            Primary link (featured)
          </Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
            {isSubmitting ? "Saving..." : link ? "Update" : "Create"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white">Links & Resources</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700" aria-describedby="create-link-description">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Link</DialogTitle>
                <DialogDescription id="create-link-description" className="text-slate-300">
                  Add a link to downloads, documentation, official sites, or other resources for this {entityType}.
                </DialogDescription>
              </DialogHeader>
              <LinkForm onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedLinks.length === 0 ? (
          <p className="text-slate-400 text-sm">No links added yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 p-3 border border-slate-600 rounded-lg bg-slate-700"
              >
                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate text-white">{link.name}</span>
                    <Badge className={linkTypeColors[link.link_type]} variant="secondary">
                      {linkTypeLabels[link.link_type]}
                    </Badge>
                    {link.is_primary && (
                      <Badge variant="default" className="text-xs bg-purple-600 text-white">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <ExternalLink className="w-3 h-3" />
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">
                      {link.url}
                    </a>
                  </div>
                  {link.description && <p className="text-sm text-slate-400 mt-1">{link.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLink(link)}
                    className="border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(link.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
          <DialogContent className="bg-slate-800 border-slate-700" aria-describedby="edit-link-description">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Link</DialogTitle>
              <DialogDescription id="edit-link-description" className="text-slate-300">
                Update the link information, type, and display settings.
              </DialogDescription>
            </DialogHeader>
            {editingLink && <LinkForm link={editingLink} onCancel={() => setEditingLink(null)} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
