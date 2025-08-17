import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { AddToCompareButton } from "@/components/compare/AddToCompareButton"

interface Handheld {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  description: string | null
  image_url: string | null
  price_range: string | null
  release_year: number | null
  screen_size: string | null
  cpu: string | null
  ram: string | null
  internal_storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  key_features: string[] | null
  created_at: string
  updated_at: string
}

interface HandheldLink {
  id: string
  name: string
  url: string
  link_type: string
  description: string | null
  is_primary: boolean
  display_order: number
}

interface CompatibleTool {
  id: string
  compatibility_notes: string | null
  tool: {
    id: string
    name: string
    slug: string
    developer: string | null // Made developer optional since tools table doesn't have this column
    category: string | null // Changed from string[] to string since database stores as varchar
    image_url: string | null
  }
}

interface CompatibleCustomFirmware {
  id: string
  compatibility_notes: string | null
  custom_firmware: {
    id: string
    name: string
    slug: string
    version: string | null
    description: string | null
  }
}

interface EmulationPerformance {
  id: string
  performance_rating: string
  fps_range: string | null
  resolution_supported: string | null
  notes: string | null
  tested_games: string[] | null
  settings_notes: string | null
  console: {
    id: string
    name: string
    slug: string
    image_url: string | null
    manufacturer: string | null
  }
}

async function getHandheld(slug: string): Promise<Handheld | null> {
  try {
    const { data, error } = await supabase.from("handhelds").select("*").eq("slug", slug)

    if (error) {
      console.error("Error fetching handheld:", error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in getHandheld:", error)
    return null
  }
}

type UiLink = {
  id: string
  name: string
  url: string
  link_type?: string | null
  is_primary?: boolean | null
  display_order?: number | null
}

function normalizeLinks(rows: any[]): UiLink[] {
  return (rows ?? []).map((row: any) => {
    const url = row.url ?? row.link ?? row.href ?? ""
    let name = row.name ?? row.label ?? row.title ?? (typeof row.link_type === "string" ? row.link_type : null)
    if (!name) {
      try {
        name = url ? new URL(url).hostname : "Link"
      } catch {
        name = "Link"
      }
    }
    return {
      id: row.id,
      name,
      url,
      link_type: row.link_type ?? row.type ?? null,
      is_primary: row.is_primary ?? row.primary ?? null,
      display_order: row.display_order ?? row.order ?? null,
    }
  })
}

async function getHandheldLinks(handheldId: string): Promise<UiLink[]> {
  const poly = await supabase.from("links").select("*").eq("entity_type", "handheld").eq("entity_id", handheldId)
  if (!poly.error && (poly.data?.length ?? 0) > 0) {
    const links = normalizeLinks(poly.data!)
    links.sort(
      (a, b) =>
        Number(!!b.is_primary) - Number(!!a.is_primary) ||
        (a.display_order ?? 9999) - (b.display_order ?? 9999) ||
        a.name.localeCompare(b.name),
    )
    return links
  }

  if (poly.error) console.warn("Links query error:", poly.error)
  return []
}

async function getCompatibleTools(handheldId: string): Promise<CompatibleTool[]> {
  try {
    const { data, error } = await supabase
      .from("tool_handheld_compatibility")
      .select(`
        id,
        compatibility_notes,
        tool:tools (
          id,
          name,
          slug,
          category,
          image_url
        )
      `) // Removed developer field since it doesn't exist in tools table
      .eq("handheld_id", handheldId)

    if (error) {
      console.error("Error fetching compatible tools:", error)
      return []
    }

    const mappedData = (data || []).map((item) => ({
      ...item,
      tool: {
        ...item.tool,
        developer: null, // Set developer to null since tools table doesn't have this field
      },
    }))

    return mappedData
  } catch (error) {
    console.error("Error in getCompatibleTools:", error)
    return []
  }
}

async function getCompatibleCustomFirmware(handheldId: string): Promise<CompatibleCustomFirmware[]> {
  try {
    const { data, error } = await supabase
      .from("handheld_custom_firmware")
      .select(`
        id,
        compatibility_notes,
        custom_firmware:custom_firmware (
          id,
          name,
          slug,
          version,
          description
        )
      `)
      .eq("handheld_id", handheldId)

    if (error) {
      console.error("Error fetching compatible custom firmware:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCompatibleCustomFirmware:", error)
    return []
  }
}

async function getEmulationPerformance(handheldId: string): Promise<EmulationPerformance[]> {
  try {
    const { data, error } = await supabase
      .from("emulation_performance")
      .select(`
        id,
        performance_rating,
        fps_range,
        resolution_supported,
        notes,
        tested_games,
        settings_notes,
        console:consoles (
          id,
          name,
          slug,
          image_url,
          manufacturer
        )
      `)
      .eq("handheld_id", handheldId)
      .order("performance_rating", { ascending: false })

    if (error) {
      console.error("Error fetching emulation performance:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getEmulationPerformance:", error)
    return []
  }
}

const linkTypeIcons = {
  download: () => "📥",
  official: () => "🔗",
  documentation: () => "📄",
  forum: () => "👥",
  wiki: () => "📄",
  source: () => "💻",
  general: () => "🔗",
}

export default async function HandheldDevicePage({
  params,
}: {
  params: { slug: string }
}) {
  const handheld = await getHandheld(params.slug)

  if (!handheld) {
    notFound()
  }

  const [links, compatibleTools, compatibleCustomFirmware, emulationPerformance] = await Promise.all([
    getHandheldLinks(handheld.id),
    getCompatibleTools(handheld.id),
    getCompatibleCustomFirmware(handheld.id),
    getEmulationPerformance(handheld.id),
  ])

  const primaryLinks = links.filter((link) => !!link.is_primary)
  const secondaryLinks = links.filter((link) => !link.is_primary)

  const performanceColors = {
    excellent: "bg-green-600 text-white",
    good: "bg-blue-600 text-white",
    fair: "bg-yellow-600 text-white",
    poor: "bg-orange-600 text-white",
    unplayable: "bg-red-600 text-white",
  }

  const getPerformanceIcon = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "🟢"
      case "good":
        return "🔵"
      case "fair":
        return "🟡"
      case "poor":
        return "🟠"
      case "unplayable":
        return "🔴"
      default:
        return "⚪"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Handheld Image */}
            {handheld.image_url && (
              <div className="lg:w-1/3">
                <div className="aspect-video relative bg-slate-800 rounded-lg overflow-hidden">
                  <Image
                    src={handheld.image_url || "/placeholder.svg"}
                    alt={handheld.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Handheld Info */}
            <div className="lg:w-2/3 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{handheld.name}</h1>
                  <AddToCompareButton handheldId={handheld.id} label />
                </div>
                {handheld.manufacturer && (
                  <p className="text-xl text-slate-300 flex items-center gap-2">
                    <span>👥</span>
                    by {handheld.manufacturer}
                  </p>
                )}
                {handheld.release_year && (
                  <p className="text-lg text-slate-400 flex items-center gap-2">
                    <span>📅</span>
                    Released in {handheld.release_year}
                  </p>
                )}
              </div>

              {/* Price Range */}
              {handheld.price_range && (
                <div>
                  <Badge variant="secondary" className="bg-green-600 text-white text-lg px-3 py-1">
                    {handheld.price_range}
                  </Badge>
                </div>
              )}

              {/* Key Features */}
              {handheld.key_features && handheld.key_features.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">KEY FEATURES</h3>
                  <div className="flex flex-wrap gap-2">
                    {handheld.key_features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                        <span className="mr-1">⚡</span>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Links */}
              {primaryLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {primaryLinks.map((link) => {
                    const iconEmoji = linkTypeIcons[link.link_type as keyof typeof linkTypeIcons]?.() || "🔗"
                    return (
                      <Button key={link.id} asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <span className="mr-2">{iconEmoji}</span>
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
            {handheld.description && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{handheld.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Technical Specifications */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>💻</span>
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {handheld.screen_size && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">🖥️</span>
                      <div>
                        <div className="text-sm text-slate-400">Display</div>
                        <div className="text-white font-medium">{handheld.screen_size}</div>
                      </div>
                    </div>
                  )}
                  {handheld.cpu && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">💻</span>
                      <div>
                        <div className="text-sm text-slate-400">Processor</div>
                        <div className="text-white font-medium">{handheld.cpu}</div>
                      </div>
                    </div>
                  )}
                  {handheld.ram && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">💾</span>
                      <div>
                        <div className="text-sm text-slate-400">Memory</div>
                        <div className="text-white font-medium">{handheld.ram}</div>
                      </div>
                    </div>
                  )}
                  {handheld.internal_storage && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">💽</span>
                      <div>
                        <div className="text-sm text-slate-400">Storage</div>
                        <div className="text-white font-medium">{handheld.internal_storage}</div>
                      </div>
                    </div>
                  )}
                  {handheld.battery_life && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">🔋</span>
                      <div>
                        <div className="text-sm text-slate-400">Battery Life</div>
                        <div className="text-white font-medium">{handheld.battery_life}</div>
                      </div>
                    </div>
                  )}
                  {handheld.weight && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">⚖️</span>
                      <div>
                        <div className="text-sm text-slate-400">Weight</div>
                        <div className="text-white font-medium">{handheld.weight}</div>
                      </div>
                    </div>
                  )}
                  {handheld.dimensions && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">📏</span>
                      <div>
                        <div className="text-sm text-slate-400">Dimensions</div>
                        <div className="text-white font-medium">{handheld.dimensions}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {emulationPerformance.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span>🎮</span>
                    Emulation Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {emulationPerformance.map((perf) => (
                      <div key={perf.id} className="border border-slate-600 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* Console Image */}
                          {perf.console.image_url && (
                            <div className="w-16 h-16 relative bg-slate-700 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={perf.console.image_url || "/placeholder.svg"}
                                alt={perf.console.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Console Name and Performance Rating */}
                            <div className="flex items-center gap-3 mb-2">
                              <Link
                                href={`/consoles/${perf.console.slug}`}
                                className="text-lg font-medium text-white hover:text-purple-300 transition-colors"
                              >
                                {perf.console.name}
                              </Link>
                              <Badge
                                className={`${performanceColors[perf.performance_rating as keyof typeof performanceColors]} font-medium`}
                              >
                                {getPerformanceIcon(perf.performance_rating)} {perf.performance_rating.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Performance Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              {perf.fps_range && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-sm">📊 FPS:</span>
                                  <span className="text-white font-medium">{perf.fps_range}</span>
                                </div>
                              )}
                              {perf.resolution_supported && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-sm">🖥️ Resolution:</span>
                                  <span className="text-white font-medium">{perf.resolution_supported}</span>
                                </div>
                              )}
                              {perf.console.manufacturer && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 text-sm">🏢 By:</span>
                                  <span className="text-white font-medium">{perf.console.manufacturer}</span>
                                </div>
                              )}
                            </div>

                            {/* Performance Notes */}
                            {perf.notes && <p className="text-slate-300 text-sm mb-3">{perf.notes}</p>}

                            {/* Tested Games */}
                            {perf.tested_games && perf.tested_games.length > 0 && (
                              <div className="mb-3">
                                <p className="text-slate-400 text-sm mb-2">🎯 Tested Games:</p>
                                <div className="flex flex-wrap gap-2">
                                  {perf.tested_games.map((game, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 text-xs"
                                    >
                                      {game}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Settings Notes */}
                            {perf.settings_notes && (
                              <div className="bg-slate-700 rounded p-3">
                                <p className="text-slate-400 text-sm mb-1">⚙️ Recommended Settings:</p>
                                <p className="text-slate-300 text-sm">{perf.settings_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatible Tools */}
            {compatibleTools.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Compatible Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compatibleTools.map((compat) => (
                      <Link
                        key={compat.id}
                        href={`/tools/${compat.tool.slug}`}
                        className="block p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {compat.tool.image_url && (
                            <div className="w-12 h-12 relative bg-slate-600 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={compat.tool.image_url || "/placeholder.svg"}
                                alt={compat.tool.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{compat.tool.name}</h4>
                            {compat.tool.developer && (
                              <p className="text-sm text-slate-400">by {compat.tool.developer}</p>
                            )}
                            {compat.tool.category && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                  {compat.tool.category}
                                </Badge>
                              </div>
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

            {/* Compatible Custom Firmware */}
            {compatibleCustomFirmware.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Compatible Custom Firmware</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibleCustomFirmware.map((compat) => (
                      <Link
                        key={compat.id}
                        href={`/custom-firmware/${compat.custom_firmware.slug}`}
                        className="block p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{compat.custom_firmware.name}</h4>
                            {compat.custom_firmware.version && (
                              <p className="text-sm text-slate-400">Version {compat.custom_firmware.version}</p>
                            )}
                            {compat.custom_firmware.description && (
                              <p className="text-sm text-slate-300 mt-1">{compat.custom_firmware.description}</p>
                            )}
                            {compat.compatibility_notes && (
                              <p className="text-xs text-slate-500 mt-2 italic">{compat.compatibility_notes}</p>
                            )}
                          </div>
                          <span className="ml-2 flex-shrink-0">🔗</span>
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
            {/* Quick Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Manufacturer:</span>
                  <span className="text-white">{handheld.manufacturer || "Unknown"}</span>
                </div>
                {handheld.release_year && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Release Year:</span>
                    <span className="text-white">{handheld.release_year}</span>
                  </div>
                )}
                {handheld.price_range && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price Range:</span>
                    <span className="text-white">{handheld.price_range}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Compatible Tools:</span>
                  <span className="text-white">{compatibleTools.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custom Firmware:</span>
                  <span className="text-white">{compatibleCustomFirmware.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emulation Tests:</span>
                  <span className="text-white">{emulationPerformance.length}</span>
                </div>
                {emulationPerformance.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Performance:</span>
                    <span className="text-white flex items-center gap-1">
                      {getPerformanceIcon(emulationPerformance[0].performance_rating)}
                      <span className="capitalize">{emulationPerformance[0].performance_rating}</span>
                    </span>
                  </div>
                )}
                <Separator className="bg-slate-600" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Added:</span>
                  <span className="text-white flex items-center gap-1">
                    <span>📅</span>
                    {new Date(handheld.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Links */}
            {secondaryLinks.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Links & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {secondaryLinks.map((link) => {
                      const iconEmoji = linkTypeIcons[link.link_type as keyof typeof linkTypeIcons]?.() || "🔗"
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group"
                        >
                          <span className="text-slate-400 group-hover:text-white">{iconEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white group-hover:text-purple-300">{link.name}</div>
                            {link.description && (
                              <div className="text-sm text-slate-400 truncate">{link.description}</div>
                            )}
                          </div>
                          <span className="text-slate-500 group-hover:text-slate-300">🔗</span>
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
