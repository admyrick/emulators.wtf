import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2, Calendar, User, Building, ExternalLink, Download, Github, FileText } from 'lucide-react'
import Link from "next/link"

async function getGame(slug: string) {
  try {
    const { data, error } = await supabase
      .from("games")
      .select(`
        *,
        consoles (
          id,
          name,
          slug,
          manufacturer
        )
      `)
      .eq("slug", slug)
      .single()

    if (error) {
      console.error("Error fetching game:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching game:", error)
    return null
  }
}

async function getGameLinks(gameId: string) {
  try {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("entity_type", "game")
      .eq("entity_id", gameId)
      .order("created_at")

    if (error) {
      console.error("Error fetching game links:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching game links:", error)
    return []
  }
}

function getLinkIcon(url: string) {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('github')) return Github
  if (urlLower.includes('download') || urlLower.includes('.zip') || urlLower.includes('.exe')) return Download
  if (urlLower.includes('doc') || urlLower.includes('wiki') || urlLower.includes('readme')) return FileText
  return ExternalLink
}

function getLinkTitle(url: string, title?: string) {
  if (title) return title
  
  const urlLower = url.toLowerCase()
  if (urlLower.includes('github')) return 'GitHub Repository'
  if (urlLower.includes('download')) return 'Download'
  if (urlLower.includes('doc') || urlLower.includes('wiki')) return 'Documentation'
  
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return 'External Link'
  }
}

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const game = await getGame(params.slug)

  if (!game) {
    notFound()
  }

  const links = await getGameLinks(game.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/games" className="hover:text-foreground">Games</Link>
        <span>/</span>
        <span className="text-foreground">{game.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {game.genre && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Gamepad2 className="h-3 w-3" />
                  {game.genre}
                </Badge>
              )}
              {game.release_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(game.release_date).getFullYear()}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{game.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Links & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {links.map((link) => {
                    const IconComponent = getLinkIcon(link.url)
                    const linkTitle = getLinkTitle(link.url, link.title)
                    
                    return (
                      <Button
                        key={link.id}
                        variant="outline"
                        className="justify-start h-auto p-3"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{linkTitle}</span>
                        </a>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {game.developer && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Developer</div>
                    <div className="font-medium">{game.developer}</div>
                  </div>
                </div>
              )}
              
              {game.publisher && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Publisher</div>
                    <div className="font-medium">{game.publisher}</div>
                  </div>
                </div>
              )}

              {game.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Release Date</div>
                    <div className="font-medium">
                      {new Date(game.release_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Console */}
          {game.consoles && (
            <Card>
              <CardHeader>
                <CardTitle>Console</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/console/${game.consoles.slug}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{game.consoles.name}</div>
                      <div className="text-sm text-muted-foreground">{game.consoles.manufacturer}</div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
