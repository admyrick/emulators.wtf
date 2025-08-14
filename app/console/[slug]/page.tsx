"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, ExternalLink, Gamepad2, Cpu, HardDrive, Download } from "lucide-react"

async function getConsoleBySlug(slug: string) {
  const { data, error } = await supabase.from("consoles").select("*").eq("slug", slug).single()

  if (error) throw error
  return data
}

async function getConsoleLinks(consoleId: string) {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("entity_type", "console")
    .eq("entity_id", consoleId)
    .order("display_order", { ascending: true })

  if (error) throw error
  return data || []
}

async function getConsoleEmulators(consoleId: string) {
  const { data, error } = await supabase
    .from("emulators")
    .select("*")
    .contains("console_ids", [consoleId])
    .eq("recommended", true)
    .limit(6)

  if (error) throw error
  return data || []
}

async function getConsoleGames(consoleId: string) {
  const { data, error } = await supabase.from("games").select("*").eq("console_id", consoleId).limit(8)

  if (error) throw error
  return data || []
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

export default function ConsolePage({ params }: { params: { slug: string } }) {
  const { data: console, isLoading: consoleLoading } = useQuery({
    queryKey: ["console", params.slug],
    queryFn: () => getConsoleBySlug(params.slug),
  })

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ["console-links", console?.id],
    queryFn: () => getConsoleLinks(console!.id),
    enabled: !!console?.id,
  })

  const { data: emulators, isLoading: emulatorsLoading } = useQuery({
    queryKey: ["console-emulators", console?.id],
    queryFn: () => getConsoleEmulators(console!.id),
    enabled: !!console?.id,
  })

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["console-games", console?.id],
    queryFn: () => getConsoleGames(console!.id),
    enabled: !!console?.id,
  })

  if (consoleLoading) {
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

  if (!console) {
    notFound()
  }

  // Separate primary and secondary links
  const primaryLinks = links?.filter((link) => link.is_primary) || []
  const secondaryLinks = links?.filter((link) => !link.is_primary) || []

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <div className="aspect-square relative mb-4">
            <Image
              src={console.image_url || "/placeholder.svg?height=400&width=400&query=gaming console"}
              alt={console.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* Primary Links */}
          {primaryLinks.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5" />
                  Featured Resources
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
                <p>No resources available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{console.name}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{console.manufacturer}</Badge>
            {console.release_date && (
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(console.release_date).getFullYear()}
              </Badge>
            )}
            {console.generation && (
              <Badge variant="outline">
                <Gamepad2 className="w-3 h-3 mr-1" />
                {console.generation} Gen
              </Badge>
            )}
          </div>

          {console.description && <p className="text-muted-foreground mb-6 leading-relaxed">{console.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {console.cpu && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Processor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{console.cpu}</p>
                </CardContent>
              </Card>
            )}

            {console.storage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{console.storage}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Emulators */}
      {emulators && emulators.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Recommended Emulators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emulators.map((emulator) => (
                <Card key={emulator.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={emulator.image_url || "/placeholder.svg?height=48&width=48&query=emulator software"}
                          alt={emulator.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{emulator.name}</h3>
                        <p className="text-sm text-muted-foreground">{emulator.developer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Popular Games */}
      {games && games.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Popular Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="aspect-square relative mb-2">
                      <Image
                        src={game.image_url || "/placeholder.svg?height=120&width=120&query=game cover"}
                        alt={game.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <h3 className="font-medium text-sm truncate">{game.name}</h3>
                    {game.release_date && (
                      <p className="text-xs text-muted-foreground">{new Date(game.release_date).getFullYear()}</p>
                    )}
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
