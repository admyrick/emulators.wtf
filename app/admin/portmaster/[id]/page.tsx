import { supabase } from "@/lib/supabase"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import PortMasterForm from "@/components/PortMasterForm"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

interface PortMasterPort {
  id: string
  name: string
  slug: string
  description: string
  genre: string[]
  image_url: string
  ready_to_run: boolean
  necessary_files: string[]
  portmaster_link: string
  purchase_links: { label: string; url: string }[]
  instructions: string
  created_at: string
  updated_at: string
}

async function getPortMasterPort(id: string) {
  try {
    console.log("[v0] Fetching PortMaster port with ID:", id)
    const { data: port, error } = await supabase.from("portmaster_ports").select("*").eq("id", id).single()

    if (error) {
      console.log("[v0] Database error:", error)
      return null
    }

    if (!port) {
      console.log("[v0] No port found for ID:", id)
      return null
    }

    console.log("[v0] Successfully fetched port:", port.name)
    return port as PortMasterPort
  } catch (error) {
    console.error("[v0] Error in getPortMasterPort:", error)
    return null
  }
}

type Params = {
  id: string
}

export default async function EditPortMasterPortPage({ params }: { params: Params }) {
  try {
    console.log("[v0] EditPortMasterPortPage called with params:", params)

    if (params.id === "new") {
      console.log("[v0] Redirecting 'new' parameter to correct route")
      redirect("/admin/portmaster/new")
    }

    if (!params.id || !isUUID(params.id)) {
      console.log("[v0] Invalid ID parameter, redirecting to not found")
      notFound()
    }

    const supabase = createClient()

    const { data, error } = await supabase.from("portmaster_ports").select("*").eq("id", params.id).single()

    if (error || !data) {
      console.log("[v0] Port not found, calling notFound()")
      notFound()
    }

    return (
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit: {data.name}</h1>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/portmaster">Back to list</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/portmaster">View site</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl">
          <PortMasterForm existing={data as any} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Unhandled error in EditPortMasterPortPage:", error)
    notFound()
  }
}
