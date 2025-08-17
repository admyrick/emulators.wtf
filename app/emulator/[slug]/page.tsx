"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Download, ExternalLink, Calendar, User, Gamepad2 } from "lucide-react"

async function getEmulatorBySlug(slug: string) {
  const { data, error } = await supabase.from("emulators").select("*").eq("slug", slug).single()

  if (error) throw error
  return data
}

async function getEmulatorLinks(emulatorId: string) {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("entity_type", "emulator")
    .eq("entity_id", emulatorId)
    .order("display_order", { ascending: true })

  if (error) throw error
  return data || []
}

async function getEmulatorConsoles(consoleIds: string[]) {
  if (!consoleIds || consoleIds.length === 0) return []

  const { data, error } = await supabase.from("consoles").select("*").in("id", consoleIds)

  if (error) throw error
  return data
}

async function getCompatibleGames(emulatorId: string) {
  try {
    const { data, error } = await supabase
      .from("game_emulator_compatibility")
      .select(`
        id,
        compatibility_notes,
        game:games (
          id,
          name,
          slug,
          genre,
          release_year
        )
      `)
      .eq("emulator_id", emulatorId)
      .limit(12) // Limit to first 12 games for performance

    if (error) {
      console.error("Error fetching compatible games:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCompatibleGames:", error)
    return []
  }
}

async function getCompatibleHandhelds(emulatorId: string) {
  try {
    const { data, error } = await supabase
      .from("emulator_handheld_compatibility")
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
      .eq("emulator_id", emulatorId)

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

const linkTypeLabels: Record<string, string> = {
  download: "Download",
  official: "Official Site",
  documentation: "Documentation",
  forum: "Forum",
  wiki: "Wiki",
  source: "Source Code",
  general: "General",
}

const linkTypeColors: Record<string, string> = {
  download: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  official: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  documentation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  forum: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  wiki: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  source: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  general: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
}

export default function EmulatorPage({ params }: { params: { slug: string } }) {
  const { data: emulator, isLoading: emulatorLoading } = useQuery({
    queryKey: ["emulator", params.slug],
    queryFn: () => getEmulatorBySlug(params.slug),
  })

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ["emulator-links", emulator?.id],
    queryFn: () => getEmulatorLinks(emulator!.id),
    enabled: !!emulator?.id,
  })

  const { data: consoles, isLoading: consolesLoading } = useQuery({
    queryKey: ["emulator-consoles", emulator?.console_ids],
    queryFn: () => getEmulatorConsoles(emulator!.console_ids || []),
    enabled: !!emulator?.console_ids,
  })

  const { data: compatibleGames } = useQuery({
    queryKey: ["emulator-games", emulator?.id],
    queryFn: () => getCompatibleGames(emulator!.id),
    enabled: !!emulator?.id,
  })

  const { data: compatibleHandhelds } = useQuery({
    queryKey: ["emulator-handhelds", emulator?.id],
    queryFn: () => getCompatibleHandhelds(emulator!.id),
    enabled: !!emulator?.id,
  })

  if (emulatorLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-4" />
          <div className="h-64 bg-muted rounded mb-8" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!emulator) {
    notFound()
  }

  // Separate primary and secondary links
  const primaryLinks = links?.filter((link) => link.is_primary) || []
  const secondaryLinks = links?.filter((link) => !link.is_primary) || []

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <div className="aspect-video relative mb-4">
            <Image
              src={emulator.image_url || "/placeholder.svg?height=400&width=600&query=emulator software"}
              alt={emulator.name}
              fill
              className="object-cover rounded-lg"
            />
            {emulator.recommended && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-yellow-900">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}
          </div>

          {/* Primary Links - Featured prominently */}
          {primaryLinks.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5" />
                  Featured Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {primaryLinks.map((link) => (
                    <Button key={link.id} asChild className="w-full justify-start h-auto p-4">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-3 w-full">
                          <ExternalLink className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{link.name}</div>
                            {link.description && <div className="text-sm opacity-80 mt-1">{link.description}</div>}
                          </div>
                          <Badge className={linkTypeColors[link.link_type]} variant="secondary">
                            {linkTypeLabels[link.link_type]}
                          </Badge>
                        </div>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Links */}
          {secondaryLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {secondaryLinks.map((link) => (
                    <Button key={link.id} asChild variant="outline" className="w-full justify-start bg-transparent">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-2 w-full">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1 text-left truncate">{link.name}</span>
                          <Badge className={linkTypeColors[link.link_type]} variant="secondary" className="text-xs">
                            {linkTypeLabels[link.link_type]}
                          </Badge>
                        </div>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show message if no links */}
          {!linksLoading && (!links || links.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No download links available yet.</p>
              </CardContent>
            </Card>
          )}

          {/* Loading state for links */}
          {linksLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{emulator.name}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {emulator.developer && (
              <Badge variant="secondary">
                <User className="w-3 h-3 mr-1" />
                {emulator.developer}
              </Badge>
            )}
            {emulator.last_updated && (
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Updated {new Date(emulator.last_updated).toLocaleDateString()}
              </Badge>
            )}
            {compatibleGames && compatibleGames.length > 0 && (
              <Badge variant="outline">
                <Gamepad2 className="w-3 h-3 mr-1" />
                {compatibleGames.length}+ Games
              </Badge>
            )}
            {compatibleHandhelds && compatibleHandhelds.length > 0 && (
              <Badge variant="outline">
                <Gamepad2 className="w-3 h-3 mr-1" />
                {compatibleHandhelds.length} Handhelds
              </Badge>
            )}
          </div>

          {emulator.description && <p className="text-muted-foreground mb-6 leading-relaxed">{emulator.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emulator.supported_platforms && emulator.supported_platforms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Supported Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {emulator.supported_platforms.map((platform) => (
                      <Badge key={platform} variant="outline">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {emulator.features && emulator.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {emulator.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {compatibleHandhelds && compatibleHandhelds.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Compatible Handhelds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compatibleHandhelds.map((compat) => (
                <Card key={compat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={`/handhelds/${compat.handheld.slug}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                          <Image
                            src={
                              compat.handheld.image_url ||
                              "/placeholder.svg?height=48&width=48&query=handheld gaming device"
                            }
                            alt={compat.handheld.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold hover:text-primary transition-colors truncate">
                            {compat.handheld.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{compat.handheld.manufacturer}</p>
                          {compat.compatibility_notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {compat.compatibility_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {compatibleGames && compatibleGames.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Compatible Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {compatibleGames.map((compat) => (
                <Card key={compat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={`/game/${compat.game.slug}`} className="block">
                      <div className="space-y-2">
                        <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                          {compat.game.name}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {compat.game.genre && (
                            <Badge variant="outline" className="text-xs">
                              {compat.game.genre}
                            </Badge>
                          )}
                          {compat.game.release_year && (
                            <Badge variant="outline" className="text-xs">
                              {compat.game.release_year}
                            </Badge>
                          )}
                        </div>
                        {compat.compatibility_notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{compat.compatibility_notes}</p>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            {compatibleGames.length >= 12 && (
              <div className="text-center mt-4">
                <Button variant="outline" asChild>
                  <Link href={`/games?emulator=${emulator.id}`}>View All Compatible Games</Link>
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {consoles && consoles.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Supported Consoles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consoles.map((console) => (
                <Card key={console.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={`/console/${console.slug}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                          <Image
                            src={console.image_url || "/placeholder.svg?height=48&width=48&query=gaming console"}
                            alt={console.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold hover:text-primary transition-colors">{console.name}</h3>
                          <p className="text-sm text-muted-foreground">{console.manufacturer}</p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
