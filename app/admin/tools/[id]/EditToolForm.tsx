"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Tool {
  id: number
  name: string
  slug: string
  description: string | null
  developer: string | null
  category: string | null
  supported_platforms: string[] | null
  features: string[] | null
  requirements: string | null
  price: string | null
  image_url: string | null
  download_url: string | null
  official_website: string | null
}

interface EditToolFormProps {
  tool: Tool
  onSuccess: () => void
}

export function EditToolForm({ tool, onSuccess }: EditToolFormProps) {
  const [formData, setFormData] = useState({
    name: tool.name || "",
    slug: tool.slug || "",
    description: tool.description || "",
    developer: tool.developer || "",
    category: tool.category || "",
    supported_platforms: tool.supported_platforms?.join(", ") || "",
    features: tool.features?.join(", ") || "",
    requirements: tool.requirements || "",
    price: tool.price || "",
    image_url: tool.image_url || "",
    download_url: tool.download_url || "",
    official_website: tool.official_website || "",
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
        developer: formData.developer || null,
        category: formData.category || null,
        supported_platforms: formData.supported_platforms
          ? formData.supported_platforms
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : null,
        features: formData.features
          ? formData.features
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
          : null,
        requirements: formData.requirements || null,
        price: formData.price || null,
        image_url: formData.image_url || null,
        download_url: formData.download_url || null,
        official_website: formData.official_website || null,
      }

      const { error } = await supabase.from("tools").update(updateData).eq("id", tool.id)

      if (error) throw error

      toast.success("Tool updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating tool:", error)
      toast.error("Failed to update tool")
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
          <Label htmlFor="developer">Developer</Label>
          <Input
            id="developer"
            value={formData.developer}
            onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Free, $19.99, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="official_website">Official Website</Label>
          <Input
            id="official_website"
            type="url"
            value={formData.official_website}
            onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="download_url">Download URL</Label>
          <Input
            id="download_url"
            type="url"
            value={formData.download_url}
            onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categories (comma-separated)</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="ROM Management, Save States, Cheats"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supported_platforms">Supported Platforms (comma-separated)</Label>
        <Input
          id="supported_platforms"
          value={formData.supported_platforms}
          onChange={(e) => setFormData({ ...formData, supported_platforms: e.target.value })}
          placeholder="Windows, macOS, Linux"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Input
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Batch Processing, GUI Interface, Command Line"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">System Requirements</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          rows={2}
          placeholder="4GB RAM, DirectX 11"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Tool"}
      </Button>
    </form>
  )
}
