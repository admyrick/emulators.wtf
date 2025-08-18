import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  release_date: string | null
  screen_size: string | null
  resolution: string | null
  processor: string | null
  ram: string | null
  storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  operating_system: string | null
  connectivity: string | null
  supported_formats: string | null
  features: string[] | null
  specifications: any | null
  created_at: string
  updated_at: string
  display_name?: string
  recommended?: boolean
  official_website?: string
}

interface CompatibleTool {
  id: string
  compatibility_notes: string | null // Updated to match database schema
  tool: {
    id: string
    name: string
    slug: string
    category: string | null
    image_url: string | null
  }
}

interface CompatibleCustomFirmware {
  id: string
  status: string | null
  install_notes: string | null
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
    console.log("[v0] Starting handhelds query...")
    const supabase = await createClient()

    const testQuery = await supabase.from("handhelds").select("*").limit(1)
    if (testQuery.data && testQuery.data.length > 0) {
      console.log("[v0] Test query successful, available columns:", Object.keys(testQuery.data[0]))
    }

    const { data, error } = await supabase.from("handhelds").select("*").eq("slug", slug).single()

    if (error) {
      console.error("Error fetching handheld:", error)
      return null
    }

    if (!data) {
      console.log("[v0] No handheld found with slug:", slug)
      return null
    }

    console.log("[v0] Query successful, found handheld:", data.name)
    return data
  } catch (error) {
    console.error("Error in getHandheld:", error)
    return null
  }
}

async function getHandheldUUID(handheldId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("handheld_uuid_map")
      .select("device_id")
      .eq("handheld_id", Number.parseInt(handheldId))
      .single()

    if (error || !data) {
      console.log("[v0] No UUID mapping found for handheld ID:", handheldId)
      return null
    }

    console.log("[v0] Found UUID mapping:", data.device_id)
    return data.device_id
  } catch (error) {
    console.error("Error getting handheld UUID:", error)
    return null
  }
}

async function getCompatibleTools(handheldId: string): Promise<CompatibleTool[]> {
  try {
    const supabase = await createClient()

    const deviceUUID = await getHandheldUUID(handheldId)
    if (!deviceUUID) {
      console.log("[v0] No device UUID found for handheld ID:", handheldId)
      return []
    }

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
      `)
      .eq("device_id", deviceUUID) // Using UUID instead of integer ID

    if (error) {
      console.error("Error fetching compatible tools:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCompatibleTools:", error)
    return []
  }
}

async function getCompatibleCustomFirmware(handheldId: string): Promise<CompatibleCustomFirmware[]> {
  try {
    const supabase = await createClient()

    const deviceUUID = await getHandheldUUID(handheldId)
    if (!deviceUUID) {
      console.log("[v0] No device UUID found for handheld ID:", handheldId)
      return []
    }

    const { data, error } = await supabase
      .from("handheld_custom_firmware")
      .select(`
        id,
        status,
        install_notes,
        custom_firmware:custom_firmware (
          id,
          name,
          slug,
          version,
          description
        )
      `)
      .eq("device_id", deviceUUID) // Using UUID instead of integer ID

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
    const supabase = await createClient()

    const deviceUUID = await getHandheldUUID(handheldId)
    if (!deviceUUID) {
      console.log("[v0] No device UUID found for handheld ID:", handheldId)
      return []
    }

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
      .eq("device_id", deviceUUID) // Using UUID instead of integer ID
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

export default async function HandheldDevicePage({
  params,
}: {
  params: { slug: string }
}) {
  const handheld = await getHandheld(params.slug)

  if (!handheld) {
    notFound()
  }

  const handheldId = handheld.id
  console.log("[v0] Using handheld ID for compatibility queries:", handheldId)

  const [compatibleTools, compatibleCustomFirmware, emulationPerformance] = await Promise.all([
    getCompatibleTools(handheldId),
    getCompatibleCustomFirmware(handheldId),
    getEmulationPerformance(handheldId),
  ])

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
                  <h1 className="text-4xl font-bold text-white">{handheld.display_name || handheld.name}</h1>
                  <AddToCompareButton handheldId={handheld.id} label />
                  {handheld.recommended && (
                    <Badge variant="default" className="bg-yellow-600 text-white">
                      ⭐ Recommended
                    </Badge>
                  )}
                </div>
                {handheld.manufacturer && (
                  <p className="text-xl text-slate-300 flex items-center gap-2">
                    <span>👥</span>
                    by {handheld.manufacturer}
                  </p>
                )}
                {handheld.release_date && (
                  <p className="text-lg text-slate-400 flex items-center gap-2">
                    <span>📅</span>
                    Released {new Date(handheld.release_date).getFullYear()}
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

              {/* Features */}
              {handheld.features && handheld.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">FEATURES</h3>
                  <div className="flex flex-wrap gap-2">
                    {handheld.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-slate-300">
                        <span className="mr-1">⚡</span>
                        {feature}
                      </Badge>
                    ))}
                  </div>
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
                  {handheld.processor && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">💻</span>
                      <div>
                        <div className="text-sm text-slate-400">Processor</div>
                        <div className="text-white font-medium">{handheld.processor}</div>
                      </div>
                    </div>
                  )}
                  {handheld.resolution && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">🖥️</span>
                      <div>
                        <div className="text-sm text-slate-400">Resolution</div>
                        <div className="text-white font-medium">{handheld.resolution}</div>
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
                  {handheld.storage && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">💽</span>
                      <div>
                        <div className="text-sm text-slate-400">Storage</div>
                        <div className="text-white font-medium">{handheld.storage}</div>
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
                            {compat.status && <p className="text-xs text-slate-500 mt-2 italic">{compat.status}</p>}
                            {compat.install_notes && (
                              <p className="text-xs text-slate-500 mt-2 italic">{compat.install_notes}</p>
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

            {/* Official Website */}
            {handheld.official_website && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span>🌐</span>
                    Official Website
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={handheld.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                  >
                    {handheld.official_website}
                    <span>↗️</span>
                  </a>
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
                {handheld.release_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Release Date:</span>
                    <span className="text-white">{new Date(handheld.release_date).getFullYear()}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
