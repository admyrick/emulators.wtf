import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface Console {
  id: string
  slug: string
  name: string
  manufacturer: string
  description: string | null
  image_url: string | null
  created_at: string
}

async function getFeaturedConsoles() {
  try {
    const { data, error } = await supabase
      .from("consoles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching consoles:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching consoles:", error)
    return []
  }
}

function ConsoleCard({ console: consoleData }: { console: Console }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {consoleData.image_url ? (
              <Image
                src={consoleData.image_url || "/placeholder.svg"}
                alt={consoleData.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {consoleData.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/console/${consoleData.slug}`}>{consoleData.name}</Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground dark:text-gray-300">{consoleData.manufacturer}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {consoleData.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{consoleData.description}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
          asChild
        >
          <Link href={`/console/${consoleData.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function FeaturedConsoles() {
  const consoles = await getFeaturedConsoles()

  if (consoles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gaming Consoles</h2>
              <p className="text-gray-600 dark:text-gray-300">Classic and modern gaming systems</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/consoles">
              View All
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consoles.map((console) => (
            <ConsoleCard key={console.id} console={console} />
          ))}
        </div>
      </div>
    </section>
  )
}
