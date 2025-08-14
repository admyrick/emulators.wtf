import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, ArrowRight, Cpu, Monitor, Battery } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Handheld {
  id: string
  slug: string
  name: string
  manufacturer: string
  description: string | null
  image_url: string | null
  price_range: string | null
  cpu: string | null
  screen_size: string | null
  battery_life: string | null
  release_date: string | null
}

async function getFeaturedHandhelds() {
  try {
    const { data, error } = await supabase
      .from("handhelds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching handhelds:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching handhelds:", error)
    return []
  }
}

function HandheldCard({ handheld }: { handheld: Handheld }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {handheld.image_url ? (
              <Image
                src={handheld.image_url || "/placeholder.svg"}
                alt={handheld.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {handheld.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/handheld/${handheld.slug}`}>{handheld.name}</Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground dark:text-gray-300">{handheld.manufacturer}</p>
            </div>
          </div>
          {handheld.price_range && (
            <Badge variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
              {handheld.price_range}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {handheld.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{handheld.description}</p>
        )}

        <div className="space-y-2 mb-4">
          {handheld.cpu && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
              <Cpu className="w-3 h-3" />
              <span>{handheld.cpu}</span>
            </div>
          )}
          {handheld.screen_size && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
              <Monitor className="w-3 h-3" />
              <span>{handheld.screen_size}</span>
            </div>
          )}
          {handheld.battery_life && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
              <Battery className="w-3 h-3" />
              <span>{handheld.battery_life}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
          asChild
        >
          <Link href={`/handheld/${handheld.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function FeaturedHandhelds() {
  const handhelds = await getFeaturedHandhelds()

  if (handhelds.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gaming Handhelds</h2>
              <p className="text-gray-600 dark:text-gray-300">Portable gaming devices and specifications</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/handhelds">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {handhelds.map((handheld) => (
            <HandheldCard key={handheld.id} handheld={handheld} />
          ))}
        </div>
      </div>
    </section>
  )
}
