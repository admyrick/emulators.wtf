"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { createEmulator } from "../../actions"
import { toast } from "@/hooks/use-toast"

async function getConsoles() {
  const { data, error } = await supabase.from("consoles").select("id, name, manufacturer").order("name")
  if (error) throw error
  return data
}

export function NewEmulatorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConsoles, setSelectedConsoles] = useState<string[]>([])
  const router = useRouter()

  const { data: consoles } = useQuery({
    queryKey: ["consoles-list"],
    queryFn: getConsoles,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    // Add selected consoles to form data as JSON string
    formData.append("console_ids", JSON.stringify(selectedConsoles))

    try {
      const result = await createEmulator(formData)

      if (result.success) {
        toast({ title: "Emulator created successfully" })
        router.push("/admin/emulators")
      } else {
        toast({
          title: "Failed to create emulator",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Failed to create emulator",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConsoleToggle = (consoleId: string) => {
    setSelectedConsoles((prev) =>
      prev.includes(consoleId) ? prev.filter((id) => id !== consoleId) : [...prev, consoleId],
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/emulators">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Emulators
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emulator Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" required placeholder="e.g., RetroArch" />
                </div>

                <div>
                  <Label htmlFor="developer">Developer</Label>
                  <Input id="developer" name="developer" placeholder="e.g., Libretro Team" />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" placeholder="auto-generated from name if empty" />
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input id="image_url" name="image_url" placeholder="https://example.com/image.png" />
                </div>

                <div>
                  <Label htmlFor="supported_platforms">Supported Platforms (comma-separated)</Label>
                  <Input
                    id="supported_platforms"
                    name="supported_platforms"
                    placeholder="Windows, macOS, Linux, Android"
                  />
                </div>

                <div>
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input id="features" name="features" placeholder="Save States, Netplay, Cheats, Shaders" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="recommended" name="recommended" value="true" />
                  <Label htmlFor="recommended">Recommended Emulator</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Describe the emulator's capabilities and features..."
                  />
                </div>

                {/* Console Selection */}
                <div>
                  <Label>Supported Consoles</Label>
                  <div className="mt-2 max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                    {consoles?.map((console) => (
                      <div key={console.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`console-${console.id}`}
                          checked={selectedConsoles.includes(console.id)}
                          onCheckedChange={() => handleConsoleToggle(console.id)}
                        />
                        <Label htmlFor={`console-${console.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" />
                            <span>{console.name}</span>
                            {console.manufacturer && (
                              <Badge variant="outline" className="text-xs">
                                {console.manufacturer}
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select which gaming consoles this emulator supports
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Emulator"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/emulators">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
