import { Suspense } from "react"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import { PresetBuilderClient } from "./PresetBuilderClient"

interface Emulator {
  id: string
  name: string
  description: string
  image_url: string
  developer: string
  supported_systems: string[]
  features: string[]
}

interface Game {
  id: string
  name: string
  description: string
  image_url: string
  platform: string
  genre: string
  developer: string
  publisher: string
}

interface CfwApp {
  id: string
  app_name: string
  description: string
  image_url: string
  category: string
  app_type: string
  requirements: string
}

interface Tool {
  id: string
  name: string
  description: string
  category: string
  version: string
  compatibility: string[]
}

interface CustomFirmware {
  id: string
  name: string
  description: string
  version: string
  compatibility: string[]
  download_url: string
}

interface Handheld {
  id: number
  name: string
  manufacturer: string
  description: string
  image_url: string
}

async function getPresetBuilderData() {
  const [emulatorsResult, gamesResult, cfwAppsResult, toolsResult, customFirmwareResult, handheldsResult] =
    await Promise.all([
      supabase.from("emulators").select("*").order("name"),
      supabase.from("games").select("*").order("name").limit(50),
      supabase.from("cfw_apps").select("*").order("app_name"),
      supabase.from("tools").select("*").order("name"),
      supabase.from("custom_firmware").select("*").order("name"),
      supabase.from("handhelds").select("*").order("name"),
    ])

  return {
    emulators: emulatorsResult.data || [],
    games: gamesResult.data || [],
    cfwApps: cfwAppsResult.data || [],
    tools: toolsResult.data || [],
    customFirmware: customFirmwareResult.data || [],
    handhelds: handheldsResult.data || [],
  }
}

export default async function PresetBuilderPage() {
  const data = await getPresetBuilderData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Preset Builder</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create custom collections of emulators, games, apps, and tools. Build the perfect setup for your handheld
            gaming device and share it with the community.
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading preset builder...</div>}>
          <PresetBuilderClient {...data} />
        </Suspense>
      </div>
    </div>
  )
}
