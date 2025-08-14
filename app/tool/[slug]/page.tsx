import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, ExternalLink, Github, FileText, Users, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

interface Tool {
  id: string
  name: string
  slug: string
  developer: string | null
  description: string | null
  image_url: string | null
  category: string[] | null
  platforms: string[] | null
  requirements: string | null
  features: string[] | null
  installation_guide: string | null
  created_at: string
  updated_at: string
}

interface ToolLink {
  id: string
  name: string
  url: string
  link_type: string
  description: string | null
  is_primary: boolean
  display_order: number
}

interface CompatibleHandheld {
  id: string
  compatibility_notes: string | null
  handheld: {
    id: string
    name: string
    slug: string
    manufacturer: string | null
    image_url: string | null
  }
}

async function getTool(slug: string): Promise<Tool | null> {
  try {
    const { data, error } = await supabase.from("tools").select("*").eq("slug", slug).single()

    if (error) {
      console.error("Error fetching tool:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getTool:", error)
    return null
  }
}

async function getToolLinks(toolId: string): Promise<ToolLink[]> {
  try {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("entity_type", "tool")
      .eq("entity_id", toolId)
      .order("display_order")

    if (error) {
      console.error("Error fetching tool links:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getToolLinks:", error)
    return []
  }
}

async function getCompatibleHandhelds(toolId: string): Promise<CompatibleHandheld[]> {
  try {
    const { data, error } = await supabase
      .from("tool_handheld_compatibility")
      .select(`
        id,
        compatibility_notes,
        handheld:handhelds (
          id,
          name,
          slug,
          manufacturer,
          image_url
        )
      `)
      .eq("tool_id", toolId)

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

const linkTypeIcons = {
  download: Download,
  official: ExternalLink,
  documentation: FileText,
  forum: Users,
  wiki: FileText,
  source: Github,
  general: ExternalLink,
}

export default async function ToolDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const tool = await getTool(slug)

  if (!tool) {
    notFound()
  }

  const [links, compatibleHandhelds] = await Promise.all([getToolLinks(tool.id), getCompatibleHandhelds(tool.id)])

  const primaryLinks = links.filter((link) => link.is_primary)
  const secondaryLinks = links.filter((link) => !link.is_primary)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tool Image */}
            {tool.image_url && (
              <div className="lg:w-1/3">
                <div className="aspect-video relative bg-slate-800 rounded-lg overflow-hidden">
                  <Image
                    src={tool.image_url || "/placeholder.svg"}
                    alt={tool.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Tool Info */}
            <div className="lg:w-2/3 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{tool.name}</h1>
                {tool.developer && (
                  <p className="text-xl text-slate-300 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    by {tool.developer}
                  </p>
                )}
              </div>

              {/* Categories */}
              {tool.category && tool.category.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tool.category.map((cat, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600 text-white">
                      <Tag className="w-3 h-3 mr-1" />
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Platforms */}
              {tool.platforms && tool.platforms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">SUPPORTED PLATFORMS</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.platforms.map((platform, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Links */}
              {primaryLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {primaryLinks.map((link) => {
                    const IconComponent = linkTypeIcons[link.link_type as keyof typeof linkTypeIcons] || ExternalLink
                    return (
                      <Button key={link.id} asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <IconComponent className="w-4 h-4 mr-2" />
                          {link.name}
                        </a>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {tool.description && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{tool.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Installation Guide */}
            {tool.installation_guide && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Installation Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-300 bg-slate-900 p-4 rounded-lg overflow-x-auto">
                      {tool.installation_guide}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatible Handhelds */}
            {compatibleHandhelds.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Compatible Handhelds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compatibleHandhelds.map((compat) => (
                      <Link
                        key={compat.id}
                        href={`/handheld/${compat.handheld.slug}`}
                        className="block p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {compat.handheld.image_url && (
                            <div className="w-12 h-12 relative bg-slate-600 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={compat.handheld.image_url || "/placeholder.svg"}
                                alt={compat.handheld.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{compat.handheld.name}</h4>
                            {compat.handheld.manufacturer && (
                              <p className="text-sm text-slate-400">{compat.handheld.manufacturer}</p>
                            )}
                            {compat.compatibility_notes && (
                              <p className="text-xs text-slate-500 mt-1">{compat.compatibility_notes}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            {tool.requirements && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">System Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{tool.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Links */}
            {secondaryLinks.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Links & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {secondaryLinks.map((link) => {
                      const IconComponent = linkTypeIcons[link.link_type as keyof typeof linkTypeIcons] || ExternalLink
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group"
                        >
                          <IconComponent className="w-4 h-4 text-slate-400 group-hover:text-white" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white group-hover:text-purple-300">{link.name}</div>
                            {link.description && (
                              <div className="text-sm text-slate-400 truncate">{link.description}</div>
                            )}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tool Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Developer:</span>
                  <span className="text-white">{tool.developer || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Categories:</span>
                  <span className="text-white">{tool.category?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platforms:</span>
                  <span className="text-white">{tool.platforms?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compatible Devices:</span>
                  <span className="text-white">{compatibleHandhelds.length}</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Added:</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(tool.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
