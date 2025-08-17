"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    repo_url: "",
    latest_version: "",
  })

  const [developers, setDevelopers] = useState<CfwAppDeveloper[]>([])
  const [features, setFeatures] = useState<CfwAppFeature[]>([])
  const [links, setLinks] = useState<CfwAppLink[]>([])

  const [newDeveloper, setNewDeveloper] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newLink, setNewLink] = useState({ link_name: "", url: "" })

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const cfwAppData = {
        name: formData.name,
        website: formData.website || null,
        description: formData.description || null,
        repo_url: formData.repo_url || null,
        latest_version: formData.latest_version || null,
      }

      console.log("Creating CFW app with data:", cfwAppData)

      const { data, error } = await supabase.from("cfw_apps").insert([cfwAppData]).select().single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("CFW app created successfully:", data)

      toast({
        title: "Success",
        description: "CFW app created successfully",
      })

      router.push(`/admin/cfw-apps`)
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">App Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
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
                    <Label htmlFor="repo_url">Repository URL</Label>
                    <Input
                      id="repo_url"
                      type="url"
                      value={formData.repo_url}
                      onChange={(e) => handleInputChange("repo_url", e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="latest_version">Latest Version</Label>
                    <Input
                      id="latest_version"
                      value={formData.latest_version}
                      onChange={(e) => handleInputChange("latest_version", e.target.value)}
                      placeholder="v1.0.0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔗</span>
                  URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

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
