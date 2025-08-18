import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

async function getPortMasterPort(slug: string) {
  const { data: port, error } = await supabase.from("portmaster_ports").select("*").eq("slug", slug).single()

  if (error || !port) {
    return null
  }

  return port as PortMasterPort
}

export default async function PortMasterPortPage({ params }: { params: { slug: string } }) {
  const port = await getPortMasterPort(params.slug)

  if (!port) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/portmaster" className="text-purple-400 hover:text-purple-300">
          ← Back to PortMaster
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            {port.image_url && (
              <img
                src={port.image_url || "/placeholder.svg"}
                alt={port.name}
                className="w-full max-w-md h-64 object-cover rounded-lg mb-6"
              />
            )}

            <h1 className="text-4xl font-bold mb-4">{port.name}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {port.genre?.map((g) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>

            <p className="text-lg text-slate-300 mb-6">{port.description}</p>
          </div>

          {port.instructions && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{port.instructions}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {port.necessary_files?.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {port.necessary_files.map((file, index) => (
                    <li key={index} className="text-slate-300">
                      {file}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Port Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Status:</span>
                <div className="mt-1">
                  {port.ready_to_run ? (
                    <Badge variant="default" className="bg-green-600">
                      Ready to Run
                    </Badge>
                  ) : (
                    <Badge variant="outline">Files Required</Badge>
                  )}
                </div>
              </div>

              {port.portmaster_link && (
                <div>
                  <Button asChild className="w-full">
                    <a href={port.portmaster_link} target="_blank" rel="noopener noreferrer">
                      Download from PortMaster
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {port.purchase_links?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Purchase Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {port.purchase_links.map((link, index) => (
                  <Button key={index} variant="outline" asChild className="w-full bg-transparent">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
