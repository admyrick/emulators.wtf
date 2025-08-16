import { Suspense } from "react"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import { SetupsClientPage } from "./SetupsClientPage"

interface Setup {
  id: string
  title: string
  slug: string
  description: string
  difficulty_level: string
  estimated_time: string
  requirements: string[]
  image_url: string
  featured: boolean
  created_at: string
}

async function getSetups(): Promise<Setup[]> {
  const { data, error } = await supabase
    .from("setups")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching setups:", error)
    return []
  }

  return data || []
}

export default async function SetupsPage() {
  const setups = await getSetups()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Setup Guides</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive guides to set up your handheld gaming devices with emulators, custom firmware, and essential
            apps for the perfect retro gaming experience.
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading setups...</div>}>
          <SetupsClientPage initialSetups={setups} />
        </Suspense>
      </div>
    </div>
  )
}
