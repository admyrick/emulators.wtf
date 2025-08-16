"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CfwAppDeveloper {
  id: string
  developer_name: string
}

interface CfwAppFeature {
  id: string
  feature_name: string
}

interface CfwAppLink {
  id: string
  link_name: string
  url: string
}

export default function NewCfwAppForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // Form state with guaranteed non-null values
  const [formData, setFormData] = useState({
    app_name: "",
    slug: "",
    app_url: "",
    description: "",
    requirements: "",
    app_type: "",
    category: "",
    image_url: "",
    last_updated: "",
  })

  // Dynamic lists
  const [developers, setDevelopers] = useState<CfwAppDeveloper[]>([])
  const [features, setFeatures] = useState<CfwAppFeature[]>([])
  const [links, setLinks] = useState<CfwAppLink[]>([])

  // New item states
  const [newDeveloper, setNewDeveloper] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newLink, setNewLink] = useState({ link_name: "", url: "" })

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-generate slug from app name
    if (field === "app_name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Prepare data with proper null handling
      const cfwAppData = {
        app_name: formData.app_name,
        slug: formData.slug,
        app_url: formData.app_url || null,
        description: formData.description || null,
        requirements: formData.requirements || null,
        app_type: formData.app_type || null,
        category: formData.category || null,
        image_url: formData.image_url || null,
        last_updated: formData.last_updated || null,
      }

      console.log("Creating CFW app with data:", cfwAppData)

      const { data, error } = await supabase.from("cfw_apps").insert([cfwAppData]).select().single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("CFW app created successfully:", data)

      // Create related data if any
      const appId = data.id

      // Add developers
      if (developers.length > 0) {
        const developerData = developers.map((dev) => ({
          cfw_app_id: appId,
          developer_name: dev.developer_name,
        }))

        const { error: devError } = await supabase.from("cfw_app_developers").insert(developerData)

        if (devError) {
          console.error("Error adding developers:", devError)
        }
      }

      // Add features
      if (features.length > 0) {
        const featureData = features.map((feature) => ({
          cfw_app_id: appId,
          feature_name: feature.feature_name,
        }))

        const { error: featureError } = await supabase.from("cfw_app_features").insert(featureData)

        if (featureError) {
          console.error("Error adding features:", featureError)
        }
      }

      // Add links
      if (links.length > 0) {
        const linkData = links.map((link) => ({
          cfw_app_id: appId,
          link_name: link.link_name,
          url: link.url,
        }))

        const { error: linkError } = await supabase.from("cfw_app_links").insert(linkData)

        if (linkError) {
          console.error("Error adding links:", linkError)
        }
      }

      toast({
        title: "Success",
        description: "CFW app created successfully",
      })

      router.push(`/admin/cfw-apps/${data.id}`)
    } catch (error: any) {
      console.error("Error creating CFW app:", error)
      toast({
        title: "Error",
        description: `Failed to create CFW app: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function addDeveloper() {
    if (!newDeveloper.trim()) return

    setDevelopers([...developers, { id: Date.now().toString(), developer_name: newDeveloper.trim() }])
    setNewDeveloper("")
    toast({ title: "Developer added successfully" })
  }

  function removeDeveloper(index: number) {
    setDevelopers(developers.filter((_, i) => i !== index))
    toast({ title: "Developer removed successfully" })
  }

  function addFeature() {
    if (!newFeature.trim()) return

    setFeatures([...features, { id: Date.now().toString(), feature_name: newFeature.trim() }])
    setNewFeature("")
    toast({ title: "Feature added successfully" })
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index))
    toast({ title: "Feature removed successfully" })
  }

  function addLink() {
    if (!newLink.link_name.trim() || !newLink.url.trim()) return

    setLinks([...links, { id: Date.now().toString(), ...newLink }])
    setNewLink({ link_name: "", url: "" })
    toast({ title: "Link added successfully" })
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index))
    toast({ title: "Link removed successfully" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cfw-apps">
            <span className="mr-2">←</span>
            Back to CFW Apps
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create CFW App</h1>
            <p className="text-gray-600 dark:text-gray-300">Add a new custom firmware application</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app_name">App Name *</Label>
                    <Input
                      id="app_name"
                      value={formData.app_name}
                      onChange={(e) => handleInputChange("app_name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app_type">App Type</Label>
                    <Select value={formData.app_type} onValueChange={(value) => handleInputChange("app_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select app type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emulator">Emulator</SelectItem>
                        <SelectItem value="Game">Game</SelectItem>
                        <SelectItem value="Utility">Utility</SelectItem>
                        <SelectItem value="Media Player">Media Player</SelectItem>
                        <SelectItem value="System Tool">System Tool</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      placeholder="e.g., Entertainment, Productivity"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    rows={3}
                    placeholder="System requirements and prerequisites"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Developers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>👤</span>
                  Developers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Developer name"
                    value={newDeveloper}
                    onChange={(e) => setNewDeveloper(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDeveloper())}
                  />
                  <Button type="button" onClick={addDeveloper}>
                    <span>➕</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {developers.map((developer, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {developer.developer_name}
                      <button type="button" onClick={() => removeDeveloper(index)} className="ml-1">
                        <span className="text-xs">❌</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Feature name"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>
                    <span>➕</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {feature.feature_name}
                      <button type="button" onClick={() => removeFeature(index)} className="ml-1">
                        <span>❌</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <Image
                      src={formData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URLs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔗</span>
                  URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="app_url">App URL</Label>
                  <Input
                    id="app_url"
                    type="url"
                    value={formData.app_url}
                    onChange={(e) => handleInputChange("app_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="last_updated">Last Updated</Label>
                  <Input
                    id="last_updated"
                    type="date"
                    value={formData.last_updated}
                    onChange={(e) => handleInputChange("last_updated", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔗</span>
                  Additional Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Link name"
                      value={newLink.link_name}
                      onChange={(e) => setNewLink({ ...newLink, link_name: e.target.value })}
                    />
                    <Input
                      placeholder="URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                    <Button type="button" onClick={addLink}>
                      <span>➕</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{link.link_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{link.url}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(index)}>
                        <span>❌</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <span className="mr-2">💾</span>
                    {saving ? "Creating..." : "Create CFW App"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/admin/cfw-apps">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
