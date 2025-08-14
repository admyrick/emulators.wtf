import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench, ArrowRight, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Tool {
  id: string
  slug: string
  name: string
  description: string | null
  developer: string | null
  image_url: string | null
  price: string | null
  category: string[] | null
  supported_platforms: string[] | null
  features: string[] | null
  last_updated: string | null
}

async function getFeaturedTools() {
  try {
    const { data, error } = await supabase.from("tools").select("*").order("created_at", { ascending: false }).limit(6)

    if (error) {
      console.error("Error fetching tools:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching tools:", error)
    return []
  }
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {tool.image_url ? (
              <Image
                src={tool.image_url || "/placeholder.svg"}
                alt={tool.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {tool.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/tool/${tool.slug}`}>{tool.name}</Link>
              </CardTitle>
              {tool.developer && <p className="text-sm text-muted-foreground dark:text-gray-300">{tool.developer}</p>}
            </div>
          </div>
          {tool.price && (
            <Badge variant="outline" className="text-xs dark:border-gray-500 dark:text-gray-300">
              <DollarSign className="w-3 h-3 mr-1" />
              {tool.price}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {tool.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{tool.description}</p>
        )}

        {tool.category && tool.category.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tool.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                {cat}
              </Badge>
            ))}
            {tool.category.length > 2 && (
              <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                +{tool.category.length - 2} more
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
          <Link href={`/tool/${tool.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function FeaturedTools() {
  const tools = await getFeaturedTools()

  if (tools.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-orange-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tools & Utilities</h2>
              <p className="text-gray-600 dark:text-gray-300">Essential software for gaming and emulation</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/tools">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
