"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Handheld {
  id: number
  name: string
  slug: string
  manufacturer: string | null
  description: string | null
  image_url: string | null
  price_range: string | null
  release_date: string | null
  screen_size: string | null
  processor: string | null
  ram: string | null
  storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  connectivity: string[] | null
  supported_formats: string[] | null
  operating_system: string | null
  official_website: string | null
}

interface EditHandheldFormProps {
  handheld: Handheld
  onSuccess: () => void
}

export function EditHandheldForm({ handheld, onSuccess }: EditHandheldFormProps) {
  const [formData, setFormData] = useState({
    name: handheld.name || "",
    slug: handheld.slug || "",
    manufacturer: handheld.manufacturer || "",
    description: handheld.description || "",
    image_url: handheld.image_url || "",
    price_range: handheld.price_range || "",
    release_date: handheld.release_date || "",
    screen_size: handheld.screen_size || "",
    processor: handheld.processor || "",
    ram: handheld.ram || "",
    storage: handheld.storage || "",
    battery_life: handheld.battery_life || "",
    weight: handheld.weight || "",
    dimensions: handheld.dimensions || "",
    connectivity: handheld.connectivity?.join(", ") || "",
    supported_formats: handheld.supported_formats?.join(", ") || "",
    operating_system: handheld.operating_system || "",
    official_website: handheld.official_website || "",
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
        description: formData.description || null,
        image_url: formData.image_url || null,
        price_range: formData.price_range || null,
        release_date: formData.release_date || null,
        screen_size: formData.screen_size || null,
        processor: formData.processor || null,
        ram: formData.ram || null,
        storage: formData.storage || null,
        battery_life: formData.battery_life || null,
        weight: formData.weight || null,
        dimensions: formData.dimensions || null,
        connectivity: formData.connectivity
          ? formData.connectivity
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : null,
        supported_formats: formData.supported_formats
          ? formData.supported_formats
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
          : null,
        operating_system: formData.operating_system || null,
        official_website: formData.official_website || null,
      }

      const { error } = await supabase.from("handhelds").update(updateData).eq("id", handheld.id)

      if (error) throw error

      toast.success("Handheld updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating handheld:", error)
      toast.error("Failed to update handheld")
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
          <Label htmlFor="operating_system">Operating System</Label>
          <Input
            id="operating_system"
            value={formData.operating_system}
            onChange={(e) => setFormData({ ...formData, operating_system: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_range">Price Range</Label>
          <Input
            id="price_range"
            value={formData.price_range}
            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
            placeholder="$399-$699"
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

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="screen_size">Screen Size</Label>
          <Input
            id="screen_size"
            value={formData.screen_size}
            onChange={(e) => setFormData({ ...formData, screen_size: e.target.value })}
            placeholder="7-inch 1280x800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="processor">Processor</Label>
          <Input
            id="processor"
            value={formData.processor}
            onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
            placeholder="AMD Ryzen Z1 Extreme"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ram">RAM</Label>
          <Input
            id="ram"
            value={formData.ram}
            onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
            placeholder="16GB LPDDR5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storage">Storage</Label>
          <Input
            id="storage"
            value={formData.storage}
            onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
            placeholder="512GB NVMe SSD"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="battery_life">Battery Life</Label>
          <Input
            id="battery_life"
            value={formData.battery_life}
            onChange={(e) => setFormData({ ...formData, battery_life: e.target.value })}
            placeholder="2-8 hours"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="608g"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={formData.dimensions}
            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
            placeholder="298×111×21mm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="connectivity">Connectivity (comma-separated)</Label>
        <Input
          id="connectivity"
          value={formData.connectivity}
          onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
          placeholder="Wi-Fi 6, Bluetooth 5.2, USB-C"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supported_formats">Supported Formats (comma-separated)</Label>
        <Input
          id="supported_formats"
          value={formData.supported_formats}
          onChange={(e) => setFormData({ ...formData, supported_formats: e.target.value })}
          placeholder="ROM, ISO, CHD, ZIP"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="official_website">Official Website</Label>
        <Input
          id="official_website"
          type="url"
          value={formData.official_website}
          onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Handheld"}
      </Button>
    </form>
  )
}
