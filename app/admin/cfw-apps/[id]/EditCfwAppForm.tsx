"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CfwApp {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  repo_url: string | null
  latest_version: string | null
  cfw_id: string | null
}

interface EditCfwAppFormProps {
  app: CfwApp
  onSuccess: () => void
}

export function EditCfwAppForm({ app, onSuccess }: EditCfwAppFormProps) {
  const [formData, setFormData] = useState({
    name: app.name || "",
    slug: app.slug || "",
    description: app.description || "",
    website: app.website || "",
    repo_url: app.repo_url || "",
    latest_version: app.latest_version || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        website: formData.website || null,
        repo_url: formData.repo_url || null,
        latest_version: formData.latest_version || null,
      }

      const { error } = await supabase.from("cfw_apps").update(updateData).eq("id", app.id)

      if (error) throw error

      toast.success("CFW app updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating CFW app:", error)
      toast.error("Failed to update CFW app")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="repo_url">Repository URL</Label>
          <Input
            id="repo_url"
            type="url"
            value={formData.repo_url}
            onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="latest_version">Latest Version</Label>
        <Input
          id="latest_version"
          value={formData.latest_version}
          onChange={(e) => setFormData({ ...formData, latest_version: e.target.value })}
          placeholder="v1.0.0"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update CFW App"}
      </Button>
    </form>
  )
}
