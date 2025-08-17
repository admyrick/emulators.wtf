import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface RecentItem {
  id: string
  name: string
  slug: string
  type: string
  created_at: string
  image_url?: string | null
  manufacturer?: string | null
  developer?: string | null
}

async function getRecentAdditions() {
  try {
    const [consoles, handhelds, emulators, firmware, tools] = await Promise.all([
      supabase
        .from("consoles")
        .select("id, name, slug, created_at, image_url, manufacturer")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("handhelds")
        .select("id, name, slug, created_at, image_url, manufacturer")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("emulators")
        .select("id, name, slug, created_at, image_url, developer")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("custom_firmware")
        .select("id, name, slug, created_at, image_url")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("tools")
        .select("id, name, slug, created_at, image_url, developer")
        .order("created_at", { ascending: false })
        .limit(2),
    ])

    const items: RecentItem[] = []

    if (consoles.data) {
      items.push(...consoles.data.map((item) => ({ ...item, type: "console", manufacturer: item.manufacturer })))
    }
    if (handhelds.data) {
      items.push(...handhelds.data.map((item) => ({ ...item, type: "handheld", manufacturer: item.manufacturer })))
    }
    if (emulators.data) {
      items.push(...emulators.data.map((item) => ({ ...item, type: "emulator", developer: item.developer })))
    }
    if (firmware.data) {
      items.push(...firmware.data.map((item) => ({ ...item, type: "firmware" })))
    }
    if (tools.data) {
      items.push(...tools.data.map((item) => ({ ...item, type: "tool", developer: item.developer })))
    }

    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)
  } catch (error) {
    console.error("Error fetching recent additions:", error)
    return []
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "console":
      return "🖥️"
    case "handheld":
      return "📱"
    case "emulator":
      return "🎮"
    case "firmware":
      return "💾"
    case "tool":
      return "🔧"
    default:
      return "🖥️"
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "console":
      return "text-blue-600"
    case "handheld":
      return "text-green-600"
    case "emulator":
      return "text-purple-600"
    case "firmware":
      return "text-pink-600"
    case "tool":
      return "text-orange-600"
    default:
      return "text-gray-600"
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "console":
      return "Console"
    case "handheld":
      return "Handheld"
    case "emulator":
      return "Emulator"
    case "firmware":
      return "Firmware"
    case "tool":
      return "Tool"
    default:
      return "Item"
  }
}

function getItemLink(item: RecentItem) {
  switch (item.type) {
    case "console":
      return `/console/${item.slug}`
    case "handheld":
      return `/handheld/${item.slug}`
    case "emulator":
      return `/emulator/${item.slug}`
    case "firmware":
      return `/custom-firmware/${item.slug}`
    case "tool":
      return `/tool/${item.slug}`
    default:
      return "/"
  }
}

function RecentItemCard({ item }: { item: RecentItem }) {
  const icon = getTypeIcon(item.type)
  const typeColor = getTypeColor(item.type)
  const typeLabel = getTypeLabel(item.type)
  const itemLink = getItemLink(item)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {item.image_url ? (
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {item.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-base group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={itemLink}>{item.name}</Link>
              </CardTitle>
              {(item.manufacturer || item.developer) && (
                <p className="text-xs text-muted-foreground dark:text-gray-300">
                  {item.manufacturer || item.developer}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${typeColor} dark:border-gray-500`}>
            <span className="mr-1">{icon}</span>
            {typeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
          <span>🕒</span>
          <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function RecentAdditions() {
  const recentItems = await getRecentAdditions()

  if (recentItems.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕒</span>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Additions</h2>
              <p className="text-gray-600 dark:text-gray-300">Latest items added to the database</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/search">
              Browse All
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <RecentItemCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
