"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { addCfwCompatibleHandheld, removeCfwCompatibleHandheld } from "../cfw-actions"
import { useRouter } from "next/navigation"

interface CompatibleHandheld {
  id: string
  handheld_id: string
  compatibility_notes: string | null
  handheld: {
    id: string
    name: string
    manufacturer: string
    slug: string
  }
}

interface Handheld {
  id: string
  name: string
  manufacturer: string
  slug: string
}

interface CompatibleHandheldsManagerProps {
  firmwareId: string
  compatibleHandhelds: CompatibleHandheld[]
  allHandhelds: Handheld[]
}

export function CompatibleHandheldsManager({
  firmwareId,
  compatibleHandhelds,
  allHandhelds,
}: CompatibleHandheldsManagerProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedHandheld, setSelectedHandheld] = useState("")
  const [compatibilityNotes, setCompatibilityNotes] = useState("")
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  // Filter out handhelds that are already compatible
  const availableHandhelds = allHandhelds.filter(
    (handheld) => !compatibleHandhelds.some((ch) => ch.handheld_id === handheld.id)
  )

  const handleAdd = async () => {
    if (!selectedHandheld) {
      toast({
        title: "Error",
        description: "Please select a handheld",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const result = await addCfwCompatibleHandheld(firmwareId, selectedHandheld, compatibilityNotes)

      if (result.success) {
        toast({
          title: "Success",
          description: "Compatible handheld added successfully",
        })
        setSelectedHandheld("")
        setCompatibilityNotes("")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add compatible handheld",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding compatible handheld:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async (relationshipId: string) => {
    setRemovingIds((prev) => new Set(prev).add(relationshipId))
    try {
      const result = await removeCfwCompatibleHandheld(relationshipId, firmwareId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Compatible handheld removed successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove compatible handheld",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing compatible handheld:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(relationshipId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Compatible Handheld */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Compatible Handheld</CardTitle>
          <CardDescription>Select a handheld device that is compatible with this firmware</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handheld-select">Handheld Device</Label>
            <Select value={selectedHandheld} onValueChange={setSelectedHandheld}>
              <SelectTrigger>
                <SelectValue placeholder="Select a handheld..." />
              </SelectTrigger>
              <SelectContent>
                {availableHandhelds.map((handheld) => (
                  <SelectItem key={handheld.id} value={handheld.id}>
                    {handheld.manufacturer} {handheld.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compatibility-notes">Compatibility Notes (Optional)</Label>
            <Textarea
              id="compatibility-notes"
              value={compatibilityNotes}
              onChange={(e) => setCompatibilityNotes(e.target.value)}
              placeholder="Any specific notes about compatibility, installation requirements, etc."
              rows={3}
            />
          </div>

          <Button onClick={handleAdd} disabled={isAdding || !selectedHandheld} className="w-full">
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Compatible Handheld
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Compatible Handhelds */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compatible Handhelds ({compatibleHandhelds.length})</h3>
        {compatibleHandhelds.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No compatible handhelds added yet. Add one above to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {compatibleHandhelds.map((compatible) => (
              <Card key={compatible.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{compatible.handheld.manufacturer}</Badge>
                        <h4 className="font-medium">{compatible.handheld.name}</h4>
                      </div>
                      {compatible.compatibility_notes && (
                        <p className="text-sm text-muted-foreground">{compatible.compatibility_notes}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(compatible.id)}
                      disabled={removingIds.has(compatible.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      {removingIds.has(compatible.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
