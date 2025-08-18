import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Preset {
  id: string
  name: string
  description: string
  device_id: string | null
  created_by: string
  download_count: number
  created_at: string
  device?: {
    name: string
  }
}

async function getPublicPresets() {
  try {
    const { data: presetsData, error: presetsError } = await supabase
      .from("presets")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (presetsError) throw presetsError

    const presetsWithDevices = await Promise.all(
      (presetsData || []).map(async (preset) => {
        if (preset.device_id) {
          const { data: deviceData } = await supabase
            .from("devices_unified")
            .select("name")
            .eq("id", preset.device_id)
            .single()

          if (deviceData) {
            return { ...preset, device: { name: deviceData.name } }
          }

          const { data: mappingData } = await supabase
            .from("handheld_uuid_map")
            .select("handheld_id")
            .eq("device_id", preset.device_id)
            .single()

          if (mappingData) {
            const { data: handheldData } = await supabase
              .from("handhelds")
              .select("name")
              .eq("id", mappingData.handheld_id)
              .single()

            if (handheldData) {
              return { ...preset, device: { name: handheldData.name } }
            }
          }
        }
        return preset
      }),
    )

    return presetsWithDevices
  } catch (error) {
    console.error("Error fetching public presets:", error)
    return []
  }
}

export default async function PresetsPage() {
  const presets = await getPublicPresets()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">📦 Community Presets</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover curated collections of emulators, games, apps, and tools created by the community. Find the perfect
            setup for your handheld gaming device.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{presets.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Public Presets</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">⬇️</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {presets.reduce((sum, p) => sum + (Number(p.download_count) || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(presets.map((p) => p.created_by)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Contributors</div>
          </div>
        </div>

        {/* Create Preset CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Own Preset</h2>
          <p className="text-blue-100 mb-4">
            Build a custom collection of your favorite emulators, games, and tools to share with the community.
          </p>
          <Link
            href="/preset-builder"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            🛠️ Start Building
          </Link>
        </div>

        {/* Presets Grid */}
        {presets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Public Presets Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create and share a preset with the community!
            </p>
            <Link
              href="/preset-builder"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🛠️ Create First Preset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{preset.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-2">
                      <span>⬇️</span>
                      <span className="ml-1">{Number(preset.download_count) || 0}</span>
                    </div>
                  </div>

                  {preset.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{preset.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <span>👤</span>
                      <span className="ml-1">{preset.created_by}</span>
                    </div>
                    {preset.device?.name && (
                      <div className="flex items-center">
                        <span>📱</span>
                        <span className="ml-1">{preset.device.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(preset.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/presets/${preset.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Preset
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
