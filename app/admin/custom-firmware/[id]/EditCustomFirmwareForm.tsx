"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CustomFirmware {
  id: string
  name: string
  slug: string
  description: string | null
  version: string | null
  website: string | null
  repo_url: string | null
  docs_url: string | null
  download_url: string | null
  image_url: string | null
  license: string | null
  installer_type: string | null
  installation_guide_url: string | null
  stability: string | null
  features: string | null
  developers: string | null
  notes: string | null
  supported_devices: string[] | null
}

interface EditCustomFirmwareFormProps {
  firmware: CustomFirmware
  onSuccess: () => void
}

export function EditCustomFirmwareForm({ firmware, onSuccess }: EditCustomFirmwareFormProps) {
  const [formData, setFormData] = useState({
    name: firmware.name || "",
    slug: firmware.slug || "",
    description: firmware.description || "",
    version: firmware.version || "",
    website: firmware.website || "",
    repo_url: firmware.repo_url || "",
    docs_url: firmware.docs_url || "",
    download_url: firmware.download_url || "",
    image_url: firmware.image_url || "",
    license: firmware.license || "",
    installer_type: firmware.installer_type || "",
    installation_guide_url: firmware.installation_guide_url || "",
    stability: firmware.stability || "",
    features: firmware.features || "",
    developers: firmware.developers || "",
    notes: firmware.notes || "",
    supported_devices: firmware.supported_devices?.join(", ") || "",
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
        version: formData.version || null,
        website: formData.website || null,
        repo_url: formData.repo_url || null,
        docs_url: formData.docs_url || null,
        download_url: formData.download_url || null,
        image_url: formData.image_url || null,
        license: formData.license || null,
        installer_type: formData.installer_type || null,
        installation_guide_url: formData.installation_guide_url || null,
        stability: formData.stability || null,
        features: formData.features || null,
        developers: formData.developers || null,
        notes: formData.notes || null,
        supported_devices: formData.supported_devices
          ? formData.supported_devices
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
          : null,
      }

      const { error } = await supabase.from("custom_firmware").update(updateData).eq("id", firmware.id)

      if (error) throw error

      toast.success("Custom firmware updated successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error updating custom firmware:", error)
      toast.error("Failed to update custom firmware")
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
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="1.0.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="developers">Developers</Label>
          <Input
            id="developers"
            value={formData.developers}
            onChange={(e) => setFormData({ ...formData, developers: e.target.value })}
            placeholder="Developer names"
          />
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="docs_url">Documentation URL</Label>
          <Input
            id="docs_url"
            type="url"
            value={formData.docs_url}
            onChange={(e) => setFormData({ ...formData, docs_url: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="installation_guide_url">Installation Guide URL</Label>
          <Input
            id="installation_guide_url"
            type="url"
            value={formData.installation_guide_url}
            onChange={(e) => setFormData({ ...formData, installation_guide_url: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="license">License</Label>
          <Input
            id="license"
            value={formData.license}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            placeholder="MIT, GPL-3.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="installer_type">Installer Type</Label>
          <Input
            id="installer_type"
            value={formData.installer_type}
            onChange={(e) => setFormData({ ...formData, installer_type: e.target.value })}
            placeholder="Script, Manual, GUI"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stability">Stability</Label>
          <Select value={formData.stability} onValueChange={(value) => setFormData({ ...formData, stability: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select stability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="experimental">Experimental</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Features</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          rows={2}
          placeholder="Key features and capabilities"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supported_devices">Supported Devices (comma-separated)</Label>
        <Input
          id="supported_devices"
          value={formData.supported_devices}
          onChange={(e) => setFormData({ ...formData, supported_devices: e.target.value })}
          placeholder="Steam Deck, ROG Ally, Legion Go"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="Additional notes or warnings"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Custom Firmware"}
      </Button>
    </form>
  )
}
