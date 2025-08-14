import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Emulator {
  id: string
  slug: string
  name: string
  description: string | null
  developer: string | null
  image_url: string | null
  recommended: boolean | null
  features: string[] | null
  supported_platforms: string[] | null
  last_updated: string | null
}

async function getFeaturedEmulators() {
  try {
    const { data, error } = await supabase
      .from("emulators")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching emulators:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching emulators:", error)
    return []
  }
}

function EmulatorCard({ emulator }: { emulator: Emulator }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {emulator.image_url ? (
              <Image
                src={emulator.image_url || "/placeholder.svg"}
                alt={emulator.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {emulator.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/emulator/${emulator.slug}`}>{emulator.name}</Link>
              </CardTitle>
              {emulator.developer && (
                <p className="text-sm text-muted-foreground dark:text-gray-300">{emulator.developer}</p>
              )}
            </div>
          </div>
          {emulator.recommended && (
            <Badge variant="default" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {emulator.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{emulator.description}</p>
        )}

        {emulator.supported_platforms && emulator.supported_platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {emulator.supported_platforms.slice(0, 3).map((platform) => (
              <Badge key={platform} variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
                {platform}
              </Badge>
            ))}
            {emulator.supported_platforms.length > 3 && (
              <Badge variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
                +{emulator.supported_platforms.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
          asChild
        >
          <Link href={`/emulator/${emulator.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function FeaturedEmulators() {
  const emulators = await getFeaturedEmulators()

  if (emulators.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emulators</h2>
              <p className="text-gray-600 dark:text-gray-300">Software to run classic games on modern devices</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/emulators">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emulators.map((emulator) => (
            <EmulatorCard key={emulator.id} emulator={emulator} />
          ))}
        </div>
      </div>
    </section>
  )
}
