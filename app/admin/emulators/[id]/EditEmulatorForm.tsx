"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Emulator {
  id: number
  name: string
  slug: string
  description: string | null
  developer: string | null
  emulated_system: string | null
  official_website: string | null
  download_url: string | null
  image_url: string | null
  recommended: boolean
  supported_platforms: string[] | null
  features: string[] | null
  console_ids: number[] | null
}

interface EditEmulatorFormProps {
  emulator: Emulator
  onSuccess: () => void
}

export function EditEmulatorForm({ emulator, onSuccess }: EditEmulatorFormProps) {
  const [formData, setFormData] = useState({
    name: emulator.name || "",
    slug: emulator.slug || "",
    description: emulator.description || "",
    developer: emulator.developer || "",
    emulated_system: emulator.emulated_system || "",
    official_website: emulator.official_website || "",
    download_url: emulator.download_url || "",
    image_url: emulator.image_url || "",
    recommended: emulator.recommended || false,
    supported_platforms: emulator.supported_platforms?.join(", ") || "",
    features: emulator.features?.join(", ") || "",
    console_ids: emulator.console_ids?.join(", ") || "",
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
        emulated_system: formData.emulated_system || null,
        official_website: formData.official_website || null,
        download_url: formData.download_url || null,
        image_url: formData.image_url || null,
        recommended: formData.recommended,
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
        console_ids: formData.console_ids
          ? formData.console_ids
              .split(",")
              .map((id) => Number.parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : null,
      }

      const { error } = await supabase.from("emulators").update(updateData).eq("id", emulator.id)

      if (error) throw error

      toast.success("Emulator updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating emulator:", error)
      toast.error("Failed to update emulator")
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
          <Label htmlFor="emulated_system">Emulated System</Label>
          <Input
            id="emulated_system"
            value={formData.emulated_system}
            onChange={(e) => setFormData({ ...formData, emulated_system: e.target.value })}
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
          placeholder="Save states, Fast forward, Rewind"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="console_ids">Console IDs (comma-separated)</Label>
        <Input
          id="console_ids"
          value={formData.console_ids}
          onChange={(e) => setFormData({ ...formData, console_ids: e.target.value })}
          placeholder="1, 2, 3"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recommended"
          checked={formData.recommended}
          onCheckedChange={(checked) => setFormData({ ...formData, recommended: checked })}
        />
        <Label htmlFor="recommended">Recommended</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Emulator"}
      </Button>
    </form>
  )
}
