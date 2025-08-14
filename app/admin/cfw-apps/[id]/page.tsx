"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, X, Save, ArrowLeft, ExternalLink, User, LinkIcon, Smartphone, Cpu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CfwApp {
  id: string
  slug: string
  app_name: string
  app_url: string | null
  description: string | null
  requirements: string | null
  app_type: string | null
  category: string | null
  image_url: string | null
  last_updated: string | null
}

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

interface Handheld {
  id: string
  name: string
  manufacturer: string
}

interface CustomFirmware {
  id: string
  name: string
  version: string | null
}

interface FirmwareCompatibility {
  id: string
  custom_firmware_id: string
  compatibility_notes: string | null
  custom_firmware: CustomFirmware
}

interface HandheldCompatibility {
  id: string
  handheld_id: string
  compatibility_notes: string | null
  handheld: Handheld
}

export default function CfwAppDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [app, setApp] = useState<CfwApp | null>(null)

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
  const [handheldCompatibility, setHandheldCompatibility] = useState<HandheldCompatibility[]>([])
  const [firmwareCompatibility, setFirmwareCompatibility] = useState<FirmwareCompatibility[]>([])

  // Available options
  const [availableHandhelds, setAvailableHandhelds] = useState<Handheld[]>([])
  const [availableFirmware, setAvailableFirmware] = useState<CustomFirmware[]>([])

  // New item states
  const [newDeveloper, setNewDeveloper] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newLink, setNewLink] = useState({ link_name: "", url: "" })
  const [selectedHandheld, setSelectedHandheld] = useState("")
  const [handheldNotes, setHandheldNotes] = useState("")
  const [selectedFirmware, setSelectedFirmware] = useState("")
  const [firmwareNotes, setFirmwareNotes] = useState("")

  useEffect(() => {
    loadAvailableOptions()
    if (!isNew) {
      loadApp()
    }
  }, [params.id, isNew])

  async function loadAvailableOptions() {
    try {
      const [handheldsRes, firmwareRes] = await Promise.all([
        supabase.from("handhelds").select("id, name, manufacturer").order("name"),
        supabase.from("custom_firmware").select("id, name, version").order("name"),
      ])

      if (handheldsRes.data) setAvailableHandhelds(handheldsRes.data)
      if (firmwareRes.data) setAvailableFirmware(firmwareRes.data)
    } catch (error: any) {
      console.error("Error loading options:", error)
    }
  }

  async function loadApp() {
    try {
      const { data, error } = await supabase.from("cfw_apps").select("*").eq("id", params.id).single()

      if (error) throw error

      setApp(data)
      setFormData({
        app_name: data.app_name || "",
        slug: data.slug || "",
        app_url: data.app_url || "",
        description: data.description || "",
        requirements: data.requirements || "",
        app_type: data.app_type || "",
        category: data.category || "",
        image_url: data.image_url || "",
        last_updated: data.last_updated || "",
      })

      // Load related data
      const [developersRes, featuresRes, linksRes, handheldRes, firmwareRes] = await Promise.all([
        supabase.from("cfw_app_developers").select("*").eq("cfw_app_id", params.id),
        supabase.from("cfw_app_features").select("*").eq("cfw_app_id", params.id),
        supabase.from("cfw_app_links").select("*").eq("cfw_app_id", params.id),
        supabase
          .from("cfw_app_handheld_compatibility")
          .select(`
            id,
            handheld_id,
            compatibility_notes,
            handheld:handhelds(id, name, manufacturer)
          `)
          .eq("cfw_app_id", params.id),
        supabase
          .from("cfw_app_firmware_compatibility")
          .select(`
            id,
            custom_firmware_id,
            compatibility_notes,
            custom_firmware:custom_firmware(id, name, version)
          `)
          .eq("cfw_app_id", params.id),
      ])

      if (developersRes.data) setDevelopers(developersRes.data)
      if (featuresRes.data) setFeatures(featuresRes.data)
      if (linksRes.data) setLinks(linksRes.data)
      if (handheldRes.data) setHandheldCompatibility(handheldRes.data as HandheldCompatibility[])
      if (firmwareRes.data) setFirmwareCompatibility(firmwareRes.data as FirmwareCompatibility[])
    } catch (error: any) {
      console.error("Error loading CFW app:", error)
      toast({
        title: "Error",
        description: "Failed to load CFW app data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

      let result
      if (isNew) {
        const { data, error } = await supabase.from("cfw_apps").insert([cfwAppData]).select().single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from("cfw_apps")
          .update({ ...cfwAppData, updated_at: new Date().toISOString() })
          .eq("id", params.id)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      toast({
        title: "Success",
        description: `CFW app ${isNew ? "created" : "updated"} successfully`,
      })

      if (isNew) {
        router.push(`/admin/cfw-apps/${result.id}`)
      }
    } catch (error: any) {
      console.error("Error saving CFW app:", error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} CFW app: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function addDeveloper() {
    if (!newDeveloper.trim()) return

    try {
      if (!isNew) {
        const { data, error } = await supabase
          .from("cfw_app_developers")
          .insert([{ cfw_app_id: params.id, developer_name: newDeveloper.trim() }])
          .select()
          .single()

        if (error) throw error
        setDevelopers([...developers, data])
      } else {
        setDevelopers([...developers, { id: Date.now().toString(), developer_name: newDeveloper.trim() }])
      }

      setNewDeveloper("")
      toast({ title: "Developer added successfully" })
    } catch (error: any) {
      toast({ title: "Failed to add developer", description: error.message, variant: "destructive" })
    }
  }

  async function removeDeveloper(index: number) {
    const developer = developers[index]
    try {
      if (developer.id && !isNew) {
        const { error } = await supabase.from("cfw_app_developers").delete().eq("id", developer.id)
        if (error) throw error
      }
      setDevelopers(developers.filter((_, i) => i !== index))
      toast({ title: "Developer removed successfully" })
    } catch (error: any) {
      toast({ title: "Failed to remove developer", description: error.message, variant: "destructive" })
    }
  }

  async function addFeature() {
    if (!newFeature.trim()) return

    try {
      if (!isNew) {
        const { data, error } = await supabase
          .from("cfw_app_features")
          .insert([{ cfw_app_id: params.id, feature_name: newFeature.trim() }])
          .select()
          .single()

        if (error) throw error
        setFeatures([...features, data])
      } else {
        setFeatures([...features, { id: Date.now().toString(), feature_name: newFeature.trim() }])
      }

      setNewFeature("")
      toast({ title: "Feature added successfully" })
    } catch (error: any) {
      toast({ title: "Failed to add feature", description: error.message, variant: "destructive" })
    }
  }

  async function removeFeature(index: number) {
    const feature = features[index]
    try {
      if (feature.id && !isNew) {
        const { error } = await supabase.from("cfw_app_features").delete().eq("id", feature.id)
        if (error) throw error
      }
      setFeatures(features.filter((_, i) => i !== index))
      toast({ title: "Feature removed successfully" })
    } catch (error: any) {
      toast({ title: "Failed to remove feature", description: error.message, variant: "destructive" })
    }
  }

  async function addLink() {
    if (!newLink.link_name.trim() || !newLink.url.trim()) return

    try {
      if (!isNew) {
        const { data, error } = await supabase
          .from("cfw_app_links")
          .insert([{ cfw_app_id: params.id, link_name: newLink.link_name.trim(), url: newLink.url.trim() }])
          .select()
          .single()

        if (error) throw error
        setLinks([...links, data])
      } else {
        setLinks([...links, { id: Date.now().toString(), ...newLink }])
      }

      setNewLink({ link_name: "", url: "" })
      toast({ title: "Link added successfully" })
    } catch (error: any) {
      toast({ title: "Failed to add link", description: error.message, variant: "destructive" })
    }
  }

  async function removeLink(index: number) {
    const link = links[index]
    try {
      if (link.id && !isNew) {
        const { error } = await supabase.from("cfw_app_links").delete().eq("id", link.id)
        if (error) throw error
      }
      setLinks(links.filter((_, i) => i !== index))
      toast({ title: "Link removed successfully" })
    } catch (error: any) {
      toast({ title: "Failed to remove link", description: error.message, variant: "destructive" })
    }
  }

  async function addHandheldCompatibility() {
    if (!selectedHandheld || isNew) return

    try {
      const { data, error } = await supabase
        .from("cfw_app_handheld_compatibility")
        .insert([
          {
            cfw_app_id: params.id,
            handheld_id: selectedHandheld,
            compatibility_notes: handheldNotes.trim() || null,
          },
        ])
        .select(`
          id,
          handheld_id,
          compatibility_notes,
          handheld:handhelds(id, name, manufacturer)
        `)
        .single()

      if (error) throw error

      setHandheldCompatibility([...handheldCompatibility, data as HandheldCompatibility])
      setSelectedHandheld("")
      setHandheldNotes("")
      toast({ title: "Handheld compatibility added successfully" })
    } catch (error: any) {
      console.error("Error adding handheld compatibility:", error)
      toast({ title: "Failed to add handheld compatibility", description: error.message, variant: "destructive" })
    }
  }

  async function removeHandheldCompatibility(index: number) {
    const compatibility = handheldCompatibility[index]
    try {
      const { error } = await supabase.from("cfw_app_handheld_compatibility").delete().eq("id", compatibility.id)
      if (error) throw error

      setHandheldCompatibility(handheldCompatibility.filter((_, i) => i !== index))
      toast({ title: "Handheld compatibility removed successfully" })
    } catch (error: any) {
      toast({ title: "Failed to remove handheld compatibility", description: error.message, variant: "destructive" })
    }
  }

  async function addFirmwareCompatibility() {
    if (!selectedFirmware || isNew) return

    try {
      console.log("Adding firmware compatibility:", {
        cfw_app_id: params.id,
        custom_firmware_id: selectedFirmware,
        compatibility_notes: firmwareNotes.trim() || null,
      })

      const { data, error } = await supabase
        .from("cfw_app_firmware_compatibility")
        .insert([
          {
            cfw_app_id: params.id,
            custom_firmware_id: selectedFirmware,
            compatibility_notes: firmwareNotes.trim() || null,
          },
        ])
        .select(`
          id,
          custom_firmware_id,
          compatibility_notes,
          custom_firmware:custom_firmware(id, name, version)
        `)
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Successfully added firmware compatibility:", data)
      setFirmwareCompatibility([...firmwareCompatibility, data as FirmwareCompatibility])
      setSelectedFirmware("")
      setFirmwareNotes("")
      toast({ title: "Firmware compatibility added successfully" })
    } catch (error: any) {
      console.error("Error adding firmware compatibility:", error)
      toast({
        title: "Failed to add firmware compatibility",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  async function removeFirmwareCompatibility(index: number) {
    const compatibility = firmwareCompatibility[index]
    try {
      const { error } = await supabase.from("cfw_app_firmware_compatibility").delete().eq("id", compatibility.id)
      if (error) throw error

      setFirmwareCompatibility(firmwareCompatibility.filter((_, i) => i !== index))
      toast({ title: "Firmware compatibility removed successfully" })
    } catch (error: any) {
      toast({ title: "Failed to remove firmware compatibility", description: error.message, variant: "destructive" })
    }
  }

  const availableHandheldsForSelection = availableHandhelds.filter(
    (handheld) => !handheldCompatibility.some((comp) => comp.handheld_id === handheld.id),
  )

  const availableFirmwareForSelection = availableFirmware.filter(
    (firmware) => !firmwareCompatibility.some((comp) => comp.custom_firmware_id === firmware.id),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/cfw-apps">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CFW Apps
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? "Create CFW App" : `Edit ${app?.app_name}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isNew ? "Add a new custom firmware application" : "Update CFW app information"}
            </p>
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
                  <User className="w-5 h-5" />
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
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {developers.map((developer, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {developer.developer_name}
                      <button type="button" onClick={() => removeDeveloper(index)} className="ml-1">
                        <X className="w-3 h-3" />
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
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {feature.feature_name}
                      <button type="button" onClick={() => removeFeature(index)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Handheld Compatibility */}
            {!isNew && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Compatible Handhelds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Select value={selectedHandheld} onValueChange={setSelectedHandheld}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select handheld" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHandheldsForSelection.map((handheld) => (
                          <SelectItem key={handheld.id} value={handheld.id}>
                            {handheld.name} ({handheld.manufacturer})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Compatibility notes (optional)"
                      value={handheldNotes}
                      onChange={(e) => setHandheldNotes(e.target.value)}
                    />
                    <Button type="button" onClick={addHandheldCompatibility} disabled={!selectedHandheld}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {handheldCompatibility.map((compatibility, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{compatibility.handheld.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({compatibility.handheld.manufacturer})
                          </span>
                          {compatibility.compatibility_notes && (
                            <p className="text-sm text-muted-foreground mt-1">{compatibility.compatibility_notes}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHandheldCompatibility(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Firmware Compatibility */}
            {!isNew && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    Compatible Custom Firmware
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Select value={selectedFirmware} onValueChange={setSelectedFirmware}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select firmware" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFirmwareForSelection.map((firmware) => (
                          <SelectItem key={firmware.id} value={firmware.id}>
                            {firmware.name} {firmware.version && `(${firmware.version})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Compatibility notes (optional)"
                      value={firmwareNotes}
                      onChange={(e) => setFirmwareNotes(e.target.value)}
                    />
                    <Button type="button" onClick={addFirmwareCompatibility} disabled={!selectedFirmware}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {firmwareCompatibility.map((compatibility, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{compatibility.custom_firmware.name}</span>
                          {compatibility.custom_firmware.version && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (v{compatibility.custom_firmware.version})
                            </span>
                          )}
                          {compatibility.compatibility_notes && (
                            <p className="text-sm text-muted-foreground mt-1">{compatibility.compatibility_notes}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFirmwareCompatibility(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <ExternalLink className="w-5 h-5" />
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
                  <LinkIcon className="w-5 h-5" />
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
                      <Plus className="w-4 h-4" />
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
                        <X className="w-4 h-4" />
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
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : isNew ? "Create CFW App" : "Update CFW App"}
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
