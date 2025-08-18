import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface PresetItem {
  id: string
  item_type: string
  item_id: string
  notes: string | null
  sort_order: number
  item_data?: any
}

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
  items: PresetItem[]
}

async function getPreset(id: string): Promise<Preset | null> {
  try {
    // Get preset details
    const { data: presetData, error: presetError } = await supabase
      .from("presets")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .single()

    if (presetError || !presetData) return null

    // Get device info if available
    let device = null
    if (presetData.device_id) {
      const { data: deviceData } = await supabase
        .from("devices_unified")
        .select("name")
        .eq("id", presetData.device_id)
        .single()

      if (deviceData) {
        device = { name: deviceData.name }
      } else {
        const { data: mappingData } = await supabase
          .from("handheld_uuid_map")
          .select("handheld_id")
          .eq("device_id", presetData.device_id)
          .single()

        if (mappingData) {
          const { data: handheldData } = await supabase
            .from("handhelds")
            .select("name")
            .eq("id", mappingData.handheld_id)
            .single()

          if (handheldData) {
            device = { name: handheldData.name }
          }
        }
      }
    }

    // Get preset items
    const { data: itemsData, error: itemsError } = await supabase
      .from("preset_items")
      .select("*")
      .eq("preset_id", id)
      .order("sort_order")

    if (itemsError) throw itemsError

    // Fetch item details for each preset item
    const itemsWithData = await Promise.all(
      (itemsData || []).map(async (item) => {
        let itemData = null
        const tableName = item.item_type === "cfw_app" ? "cfw_apps" : `${item.item_type}s`

        try {
          const { data } = await supabase.from(tableName).select("*").eq("id", item.item_id).single()

          itemData = data
        } catch (error) {
          console.error(`Error fetching ${item.item_type} with id ${item.item_id}:`, error)
        }

        return { ...item, item_data: itemData }
      }),
    )

    return {
      ...presetData,
      device,
      items: itemsWithData,
    }
  } catch (error) {
    console.error("Error fetching preset:", error)
    return null
  }
}

export default async function PresetDetailPage({ params }: { params: { id: string } }) {
  const preset = await getPreset(params.id)

  if (!preset) {
    notFound()
  }

  const itemsByType = preset.items.reduce(
    (acc, item) => {
      if (!acc[item.item_type]) {
        acc[item.item_type] = []
      }
      acc[item.item_type].push(item)
      return acc
    },
    {} as Record<string, PresetItem[]>,
  )

  const typeLabels = {
    emulator: "🎮 Emulators",
    game: "🕹️ Games",
    cfw_app: "📱 CFW Apps",
    tool: "🔧 Tools",
    custom_firmware: "💻 Custom Firmware",
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/presets"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Presets
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{preset.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <span>👤</span>
                    <span className="ml-1">Created by {preset.created_by}</span>
                  </div>
                  <div className="flex items-center">
                    <span>📅</span>
                    <span className="ml-1">{new Date(preset.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span>⬇️</span>
                    <span className="ml-1">{Number(preset.download_count) || 0} downloads</span>
                  </div>
                </div>
              </div>

              {preset.device?.name && (
                <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">📱 {preset.device.name}</span>
                </div>
              )}
            </div>

            {preset.description && <p className="text-gray-700 dark:text-gray-300 mb-6">{preset.description}</p>}

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">{preset.items.length} items in this preset</div>
            </div>
          </div>
        </div>

        {/* Preset Items */}
        <div className="space-y-8">
          {Object.entries(itemsByType).map(([type, items]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {typeLabels[type as keyof typeof typeLabels] || type} ({items.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const itemData = item.item_data
                  const itemName = itemData?.name || itemData?.app_name || "Unknown Item"

                  return (
                    <div
                      key={`${item.item_type}-${item.item_id}`}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex gap-3">
                        {itemData?.image_url && (
                          <div className="flex-shrink-0 w-12 h-12 relative">
                            <Image
                              src={itemData.image_url || "/placeholder.svg"}
                              alt={itemName}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{itemName}</h4>

                          {itemData?.developer && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">by {itemData.developer}</p>
                          )}

                          {itemData?.version && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">v{itemData.version}</p>
                          )}

                          {item.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{item.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back to Presets */}
        <div className="mt-8 text-center">
          <Link
            href="/presets"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Browse More Presets
          </Link>
        </div>
      </div>
    </div>
  )
}
