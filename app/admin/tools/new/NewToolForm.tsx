"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { createTool } from "../../actions"

export default function NewToolForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      console.log("Form data entries:", Object.fromEntries(formData))

      const result = await createTool(formData)

      if (result.success) {
        toast({ 
          title: "Success",
          description: "Tool created successfully" 
        })
        router.push("/admin/tools")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create tool",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Tool</h1>
        <p className="text-muted-foreground">Create a new emulation tool entry</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Tool name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="developer">Developer</Label>
                <Input 
                  id="developer" 
                  name="developer" 
                  placeholder="Developer name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  name="version" 
                  placeholder="1.0.0"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="license">License</Label>
                <Input 
                  id="license" 
                  name="license" 
                  placeholder="MIT, GPL, etc."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="download_url">Download URL</Label>
              <Input 
                id="download_url" 
                name="download_url" 
                type="url"
                placeholder="https://example.com/download"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the tool..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Tool"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
