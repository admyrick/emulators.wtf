import { supabase } from "@/lib/supabase"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
      // If table doesn't exist, return empty array instead of crashing
      if (error.message?.includes("does not exist")) {
        console.log("[v0] Tools table does not exist - database setup required")
        return []
      }
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching tools:", error)
    return []
  }
}

export default async function FeaturedTools() {
  const tools = await getFeaturedTools()

  if (tools.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <span className="text-6xl mb-4 block">🔧</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tools & Utilities</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Database setup required to display tools</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Run the database setup script to populate this section
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔧</span>
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
              <span className="ml-2">→</span>
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
