"use client"

import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface PresetItem {
  id: string
  type: "emulator" | "game" | "cfw_app" | "tool" | "custom_firmware"
  name: string
  description: string
  image_url?: string
  notes?: string
}

interface PresetBuilderClientProps {
  emulators: any[]
  games: any[]
  cfwApps: any[]
  tools: any[]
  customFirmware: any[]
  handhelds: any[]
}

export function PresetBuilderClient({
  emulators,
  games,
  cfwApps,
  tools,
  customFirmware,
  handhelds,
}: PresetBuilderClientProps) {
  const [selectedItems, setSelectedItems] = useState<PresetItem[]>([])
  const [activeTab, setActiveTab] = useState<string>("emulators")
  const [presetName, setPresetName] = useState("")
  const [presetDescription, setPresetDescription] = useState("")
  const [selectedHandheld, setSelectedHandheld] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: "emulators", name: "Emulators", icon: "🎮", data: emulators },
    { id: "games", name: "Games", icon: "🕹️", data: games },
    { id: "cfw_apps", name: "CFW Apps", icon: "📱", data: cfwApps },
    { id: "tools", name: "Tools", icon: "🔧", data: tools },
    { id: "custom_firmware", name: "Custom Firmware", icon: "💻", data: customFirmware },
  ]

  const activeTabData = tabs.find((tab) => tab.id === activeTab)?.data || []

  const filteredData = activeTabData.filter((item) => {
    const name = item.name || item.app_name || ""
    const description = item.description || ""
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const addItem = (item: any, type: PresetItem["type"]) => {
    const presetItem: PresetItem = {
      id: item.id,
      type,
      name: item.name || item.app_name,
      description: item.description || "",
      image_url: item.image_url,
    }

    if (!selectedItems.find((selected) => selected.id === item.id && selected.type === type)) {
      setSelectedItems([...selectedItems, presetItem])
    }
  }

  const removeItem = (id: string, type: PresetItem["type"]) => {
    setSelectedItems(selectedItems.filter((item) => !(item.id === id && item.type === type)))
  }

  const updateItemNotes = (id: string, type: PresetItem["type"], notes: string) => {
    setSelectedItems(selectedItems.map((item) => (item.id === id && item.type === type ? { ...item, notes } : item)))
  }

  const savePreset = async () => {
    if (!presetName.trim()) {
      alert("Please enter a preset name")
      return
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item for your preset")
      return
    }

    setSaving(true)

    try {
      // Create the preset
      const { data: preset, error: presetError } = await supabase
        .from("presets")
        .insert({
          name: presetName,
          description: presetDescription,
          handheld_id: selectedHandheld ? Number.parseInt(selectedHandheld) : null,
          created_by: "anonymous", // In a real app, this would be the user ID
          is_public: isPublic,
        })
        .select()
        .single()

      if (presetError) throw presetError

      // Add preset items
      const presetItems = selectedItems.map((item, index) => ({
        preset_id: preset.id,
        item_type: item.type,
        item_id: item.id,
        notes: item.notes || null,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase.from("preset_items").insert(presetItems)

      if (itemsError) throw itemsError

      alert("Preset saved successfully!")

      // Reset form
      setPresetName("")
      setPresetDescription("")
      setSelectedHandheld("")
      setSelectedItems([])
    } catch (error) {
      console.error("Error saving preset:", error)
      alert("Error saving preset. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Item Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSearchTerm("")
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.icon} {tab.name} ({tab.data.length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder={`Search ${activeTabData.length} ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredData.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Items Found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredData.map((item) => {
              const itemName = item.name || item.app_name
              const isSelected = selectedItems.some(
                (selected) => selected.id === item.id && selected.type === activeTab,
              )

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {item.image_url && (
                      <div className="flex-shrink-0 w-16 h-16 relative">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={itemName}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{itemName}</h4>

                      {item.developer && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">by {item.developer}</p>
                      )}

                      {item.category && <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>}

                      {item.version && <p className="text-sm text-gray-500 dark:text-gray-400">v{item.version}</p>}

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.description}</p>

                      {item.supported_systems && item.supported_systems.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.supported_systems.slice(0, 3).map((system: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                            >
                              {system}
                            </span>
                          ))}
                          {item.supported_systems.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              +{item.supported_systems.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3">
                        {isSelected ? (
                          <button
                            onClick={() => removeItem(item.id, activeTab as PresetItem["type"])}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            ✓ Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addItem(item, activeTab as PresetItem["type"])}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            + Add to Preset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Preset Builder Sidebar */}
      <div className="space-y-6">
        {/* Preset Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📦 Your Preset</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preset Name *</label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Awesome Gaming Setup"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe your preset and what makes it special..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Handheld (Optional)
              </label>
              <select
                value={selectedHandheld}
                onChange={(e) => setSelectedHandheld(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Any Device</option>
                {handhelds.map((handheld) => (
                  <option key={handheld.id} value={handheld.id}>
                    {handheld.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                Make this preset public
              </label>
            </div>
          </div>
        </div>

        {/* Selected Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Selected Items ({selectedItems.length})</h4>

          {selectedItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No items selected yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  {item.image_url && (
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.type}</p>

                    <textarea
                      placeholder="Add notes (optional)..."
                      value={item.notes || ""}
                      onChange={(e) => updateItemNotes(item.id, item.type, e.target.value)}
                      rows={2}
                      className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => removeItem(item.id, item.type)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={savePreset}
          disabled={saving || !presetName.trim() || selectedItems.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "💾 Save Preset"}
        </button>
      </div>
    </div>
  )
}
