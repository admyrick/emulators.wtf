"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createCustomFirmware } from "../cfw-actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NewCustomFirmwareForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [compatibility, setCompatibility] = useState<string[]>([])
  const [newCompatibility, setNewCompatibility] = useState("")

  const addCompatibility = () => {
    if (newCompatibility.trim() && !compatibility.includes(newCompatibility.trim())) {
      setCompatibility([...compatibility, newCompatibility.trim()])
      setNewCompatibility("")
    }
  }

  const removeCompatibility = (item: string) => {
    setCompatibility(compatibility.filter((c) => c !== item))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      formData.set("compatibility", JSON.stringify(compatibility))

      const result = await createCustomFirmware(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Custom firmware created successfully",
        })
        router.push("/admin/custom-firmware")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create custom firmware",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Custom Firmware</h1>
        <p className="text-muted-foreground">Add a new custom firmware to the database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" placeholder="e.g., CFW Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" name="version" placeholder="e.g., 1.0.0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the custom firmware..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="download_url">Download URL</Label>
              <Input id="download_url" name="download_url" type="url" placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compatibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCompatibility}
                onChange={(e) => setNewCompatibility(e.target.value)}
                placeholder="Add compatible device..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCompatibility())}
              />
              <Button type="button" onClick={addCompatibility} size="sm">
                ➕
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {compatibility.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCompatibility(item)}
                    className="ml-1 hover:text-destructive"
                  >
                    ❌
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Custom Firmware"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
