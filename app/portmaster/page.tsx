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

export default async function PortMasterPage() {
  const ports = await getPortMasterPorts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">PortMaster Ports</h1>
        <p className="text-lg text-slate-300 mb-6">
          Discover game ports available through PortMaster for your handheld devices
        </p>

        <div className="flex gap-4 mb-6">
          <Input placeholder="Search ports..." className="max-w-md" />
          <Button variant="outline">Filter by Genre</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ports.map((port) => (
          <Link key={port.id} href={`/portmaster/${port.slug}`}>
            <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors cursor-pointer">
              {port.image_url && (
                <img
                  src={port.image_url || "/placeholder.svg"}
                  alt={port.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="text-xl font-semibold mb-2">{port.name}</h3>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">{port.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {port.genre?.slice(0, 3).map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {port.ready_to_run ? (
                    <Badge variant="default" className="bg-green-600">
                      Ready to Run
                    </Badge>
                  ) : (
                    <Badge variant="outline">Files Required</Badge>
                  )}
                </div>

                {port.purchase_links?.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {port.purchase_links.length} Purchase Option{port.purchase_links.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {ports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No PortMaster ports found.</p>
        </div>
      )}
    </div>
  )
}
