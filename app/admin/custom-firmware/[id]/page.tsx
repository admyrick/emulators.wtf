import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CustomFirmwareForm } from "./CustomFirmwareForm"
import { CompatibleHandheldsManager } from "./CompatibleHandheldsManager"
import { DeleteCustomFirmwareButton } from "../DeleteCustomFirmwareButton"

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

async function getCustomFirmware(id: string): Promise<CustomFirmware | null> {
  try {
    const { data, error } = await supabase.from("custom_firmware").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching custom firmware:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getCustomFirmware:", error)
    return null
  }
}

async function getCompatibleHandhelds(firmwareId: string): Promise<CompatibleHandheld[]> {
  try {
    const { data, error } = await supabase
      .from("cfw_compatible_handhelds")
      .select(`
        id,
        handheld_id,
        compatibility_notes,
        handheld:handhelds(
          id,
          name,
          manufacturer,
          slug
        )
      `)
      .eq("custom_firmware_id", firmwareId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching compatible handhelds:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCompatibleHandhelds:", error)
    return []
  }
}

async function getAllHandhelds() {
  try {
    const { data, error } = await supabase
      .from("handhelds")
      .select("id, name, manufacturer, slug")
      .order("manufacturer", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching handhelds:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllHandhelds:", error)
    return []
  }
}

export default async function CustomFirmwareDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [firmware, compatibleHandhelds, allHandhelds] = await Promise.all([
    getCustomFirmware(params.id),
    getCompatibleHandhelds(params.id),
    getAllHandhelds(),
  ])

  if (!firmware) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/custom-firmware">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Custom Firmware
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{firmware.name}</h1>
          <p className="text-muted-foreground">Edit custom firmware details and manage compatibility</p>
        </div>
        <DeleteCustomFirmwareButton firmwareId={firmware.id} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firmware Details</CardTitle>
              <CardDescription>Update the basic information for this custom firmware</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomFirmwareForm firmware={firmware} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compatible Handhelds</CardTitle>
              <CardDescription>Manage which handheld devices are compatible with this firmware</CardDescription>
            </CardHeader>
            <CardContent>
              <CompatibleHandheldsManager
                firmwareId={firmware.id}
                compatibleHandhelds={compatibleHandhelds}
                allHandhelds={allHandhelds}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
