import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

async function getPortMasterPorts() {
  const { data: ports, error } = await supabase.from("portmaster_ports").select("*").order("name")

  if (error) {
    console.error("Error fetching PortMaster ports:", error)
    return []
  }

  return ports as PortMasterPort[]
}

export default async function AdminPortMasterPage() {
  const ports = await getPortMasterPorts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">PortMaster Ports</h1>
          <p className="text-slate-400 mt-2">Manage PortMaster game ports</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/portmaster/new">Add Port</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input placeholder="Search ports..." className="max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ports.map((port) => (
          <div key={port.id} className="bg-slate-800 rounded-lg p-6">
            {port.image_url && (
              <img
                src={port.image_url || "/placeholder.svg"}
                alt={port.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}

            <h3 className="text-xl font-semibold mb-2">{port.name}</h3>

            <p className="text-slate-300 text-sm mb-4 line-clamp-2">{port.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {port.genre?.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              {port.ready_to_run ? (
                <Badge variant="default" className="bg-green-600 text-xs">
                  Ready to Run
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Files Required
                </Badge>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/portmaster/${port.slug}`}>View</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/admin/portmaster/${port.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No PortMaster ports found.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/portmaster/new">Add your first port</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
