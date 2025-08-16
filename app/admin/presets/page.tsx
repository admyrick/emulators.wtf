"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Preset {
  id: string
  name: string
  description: string
  handheld_id: number | null
  created_by: string
  download_count: number
  is_public: boolean
  created_at: string
  handhelds?: {
    name: string
  }
}

export default function AdminPresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPresets()
  }, [])

  async function fetchPresets() {
    try {
      const { data, error } = await supabase
        .from("presets")
        .select(`
          *,
          handhelds(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPresets(data || [])
    } catch (error) {
      console.error("Error fetching presets:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deletePreset(id: string) {
    if (!confirm("Are you sure you want to delete this preset?")) return

    try {
      const { error } = await supabase.from("presets").delete().eq("id", id)

      if (error) throw error

      setPresets(presets.filter((preset) => preset.id !== id))
    } catch (error) {
      console.error("Error deleting preset:", error)
      alert("Error deleting preset")
    }
  }

  async function togglePublic(id: string, isPublic: boolean) {
    try {
      const { error } = await supabase.from("presets").update({ is_public: !isPublic }).eq("id", id)

      if (error) throw error

      setPresets(presets.map((preset) => (preset.id === id ? { ...preset, is_public: !isPublic } : preset)))
    } catch (error) {
      console.error("Error updating preset:", error)
      alert("Error updating preset")
    }
  }

  const filteredPresets = presets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="p-8">Loading presets...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Manage Presets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage user-created preset collections and downloads</p>
        </div>
        <Link
          href="/preset-builder"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          ➕ Create Preset
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Presets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{presets.length}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Public</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {presets.filter((p) => p.is_public).length}
              </p>
            </div>
            <div className="text-3xl">🌐</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Private</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {presets.filter((p) => !p.is_public).length}
              </p>
            </div>
            <div className="text-3xl">🔒</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {presets.reduce((sum, p) => sum + p.download_count, 0)}
              </p>
            </div>
            <div className="text-3xl">⬇️</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search presets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Presets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Preset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Target Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredPresets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Presets Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Users haven't created any presets yet, or try adjusting your search.
                    </p>
                    <Link
                      href="/preset-builder"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      ➕ Create First Preset
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredPresets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {preset.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {preset.handhelds?.name || "Any Device"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{preset.created_by}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{preset.download_count}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublic(preset.id, preset.is_public)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          preset.is_public
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {preset.is_public ? "🌐 Public" : "🔒 Private"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(preset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/presets/${preset.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                      >
                        🔗 View
                      </Link>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
