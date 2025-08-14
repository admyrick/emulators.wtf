"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CustomFirmware {
  id: string
  name: string
  slug: string
  description: string | null
  version: string | null
  release_date: string | null
  download_url: string | null
  documentation_url: string | null
  source_code_url: string | null
  license: string | null
  installation_difficulty: string | null
  features: string[] | null
  requirements: string[] | null
  created_at: string
  updated_at: string
}

interface CustomFirmwareFormProps {
  firmware: CustomFirmware
}

async function updateCustomFirmware(id: string, data: any) {
  try {
    const response = await fetch(`/api/admin/custom-firmware/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update custom firmware")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating custom firmware:", error)
    throw error
  }
}

export function CustomFirmwareForm({ firmware }: CustomFirmwareFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: firmware.name,
    slug: firmware.slug,
    description: firmware.description || "",
    version: firmware.version || "",
    release_date: firmware.release_date ? firmware.release_date.split("T")[0] : "",
    download_url: firmware.download_url || "",
    documentation_url: firmware.documentation_url || "",
    source_code_url: firmware.source_code_url || "",
    license: firmware.license || "",
    installation_difficulty: firmware.installation_difficulty || "intermediate",
    features: firmware.features || [],
    requirements: firmware.requirements || [],
  })
  const [newFeature, setNewFeature] = useState("")
  const [newRequirement, setNewRequirement] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData = {
        ...formData,
        release_date: formData.release_date || null,
      }

      console.log("Updating custom firmware with data:", updateData)

      await updateCustomFirmware(firmware.id, updateData)

      toast({
        title: "Success",
        description: "Custom firmware updated successfully",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error updating firmware:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update custom firmware",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    })
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      })
      setNewRequirement("")
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((r) => r !== requirement),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="e.g., 1.0.0"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="download_url">Download URL</Label>
          <Input
            id="download_url"
            type="url"
            value={formData.download_url}
            onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentation_url">Documentation URL</Label>
          <Input
            id="documentation_url"
            type="url"
            value={formData.documentation_url}
            onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="source_code_url">Source Code URL</Label>
          <Input
            id="source_code_url"
            type="url"
            value={formData.source_code_url}
            onChange={(e) => setFormData({ ...formData, source_code_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license">License</Label>
          <Input
            id="license"
            value={formData.license}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            placeholder="e.g., MIT, GPL-3.0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="installation_difficulty">Installation Difficulty</Label>
        <Select
          value={formData.installation_difficulty}
          onValueChange={(value) => setFormData({ ...formData, installation_difficulty: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Features</Label>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature..."
              onKeyPress={(e) => handleKeyPress(e, addFeature)}
            />
            <Button type="button" onClick={addFeature} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <Badge key={`feature-${index}`} variant="secondary" className="flex items-center gap-1">
                {feature}
                <button type="button" onClick={() => removeFeature(feature)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Requirements</Label>
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a requirement..."
              onKeyPress={(e) => handleKeyPress(e, addRequirement)}
            />
            <Button type="button" onClick={addRequirement} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.requirements.map((requirement, index) => (
              <Badge key={`requirement-${index}`} variant="outline" className="flex items-center gap-1">
                {requirement}
                <button
                  type="button"
                  onClick={() => removeRequirement(requirement)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
