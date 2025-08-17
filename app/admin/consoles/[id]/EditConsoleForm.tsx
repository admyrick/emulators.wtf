"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Console {
  id: number
  name: string
  slug: string
  manufacturer: string | null
  release_year: number | null
  release_date: string | null
  discontinued_date: string | null
  generation: number | null
  description: string | null
  image_url: string | null
}

interface EditConsoleFormProps {
  console: Console
  onSuccess: () => void
}

export function EditConsoleForm({ console, onSuccess }: EditConsoleFormProps) {
  const [formData, setFormData] = useState({
    name: console.name || "",
    slug: console.slug || "",
    manufacturer: console.manufacturer || "",
    release_year: console.release_year?.toString() || "",
    release_date: console.release_date || "",
    discontinued_date: console.discontinued_date || "",
    generation: console.generation?.toString() || "",
    description: console.description || "",
    image_url: console.image_url || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        manufacturer: formData.manufacturer || null,
        release_year: formData.release_year ? Number.parseInt(formData.release_year) : null,
        release_date: formData.release_date || null,
        discontinued_date: formData.discontinued_date || null,
        generation: formData.generation ? Number.parseInt(formData.generation) : null,
        description: formData.description || null,
        image_url: formData.image_url || null,
      }

      const { error } = await supabase.from("consoles").update(updateData).eq("id", console.id)

      if (error) throw error

      toast.success("Console updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating console:", error)
      toast.error("Failed to update console")
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
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="generation">Generation</Label>
          <Input
            id="generation"
            type="number"
            value={formData.generation}
            onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
            placeholder="Console generation (1-9)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="release_year">Release Year</Label>
          <Input
            id="release_year"
            type="number"
            value={formData.release_year}
            onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
            placeholder="1985"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="release_date">Release Date</Label>
          <Input
            id="release_date"
            type="date"
            value={formData.release_date}
            onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discontinued_date">Discontinued Date</Label>
          <Input
            id="discontinued_date"
            type="date"
            value={formData.discontinued_date}
            onChange={(e) => setFormData({ ...formData, discontinued_date: e.target.value })}
          />
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
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Console"}
      </Button>
    </form>
  )
}
