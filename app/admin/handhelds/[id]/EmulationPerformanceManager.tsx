"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface EmulationPerformance {
  id: string
  console_id: string
  performance_rating: string
  fps_range: string | null
  resolution_supported: string | null
  notes: string | null
  tested_games: string[] | null
  settings_notes: string | null
  console: {
    name: string
    manufacturer: string | null
  }
}

interface Console {
  id: string
  name: string
  manufacturer: string | null
}

interface EmulationPerformanceManagerProps {
  handheldId: string
}

export function EmulationPerformanceManager({ handheldId }: EmulationPerformanceManagerProps) {
  const [performances, setPerformances] = useState<EmulationPerformance[]>([])
  const [consoles, setConsoles] = useState<Console[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    console_id: "",
    performance_rating: "good",
    fps_range: "",
    resolution_supported: "",
    notes: "",
    tested_games: "",
    settings_notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [handheldId])

  async function fetchData() {
    try {
      const [performancesResult, consolesResult] = await Promise.all([
        supabase
          .from("emulation_performance")
          .select(`
            *,
            console:consoles (
              name,
              manufacturer
            )
          `)
          .eq("handheld_id", handheldId),
        supabase.from("consoles").select("id, name, manufacturer").order("name"),
      ])

      if (performancesResult.error) throw performancesResult.error
      if (consolesResult.error) throw consolesResult.error

      setPerformances(performancesResult.data || [])
      setConsoles(consolesResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      handheld_id: Number.parseInt(handheldId),
      console_id: formData.console_id,
      performance_rating: formData.performance_rating,
      fps_range: formData.fps_range || null,
      resolution_supported: formData.resolution_supported || null,
      notes: formData.notes || null,
      tested_games: formData.tested_games ? formData.tested_games.split(",").map((g) => g.trim()) : null,
      settings_notes: formData.settings_notes || null,
    }

    try {
      if (editingId) {
        const { error } = await supabase.from("emulation_performance").update(data).eq("id", editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("emulation_performance").insert(data)
        if (error) throw error
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving performance data:", error)
      alert("Error saving performance data")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this performance data?")) return

    try {
      const { error } = await supabase.from("emulation_performance").delete().eq("id", id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error deleting performance data:", error)
      alert("Error deleting performance data")
    }
  }

  function handleEdit(performance: EmulationPerformance) {
    setEditingId(performance.id)
    setFormData({
      console_id: performance.console_id,
      performance_rating: performance.performance_rating,
      fps_range: performance.fps_range || "",
      resolution_supported: performance.resolution_supported || "",
      notes: performance.notes || "",
      tested_games: performance.tested_games?.join(", ") || "",
      settings_notes: performance.settings_notes || "",
    })
    setShowAddForm(true)
  }

  function resetForm() {
    setFormData({
      console_id: "",
      performance_rating: "good",
      fps_range: "",
      resolution_supported: "",
      notes: "",
      tested_games: "",
      settings_notes: "",
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  if (loading) {
    return <div>Loading performance data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingId ? "Edit" : "Add"} Performance Data
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Console *</label>
                <select
                  value={formData.console_id}
                  onChange={(e) => setFormData({ ...formData, console_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Console</option>
                  {consoles.map((console) => (
                    <option key={console.id} value={console.id}>
                      {console.name} {console.manufacturer && `(${console.manufacturer})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Performance Rating *
                </label>
                <select
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({ ...formData, performance_rating: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="excellent">🟢 Excellent</option>
                  <option value="good">🔵 Good</option>
                  <option value="fair">🟡 Fair</option>
                  <option value="poor">🟠 Poor</option>
                  <option value="unplayable">🔴 Unplayable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FPS Range</label>
                <input
                  type="text"
                  value={formData.fps_range}
                  onChange={(e) => setFormData({ ...formData, fps_range: e.target.value })}
                  placeholder="e.g., 55-60, 30-45"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resolution Supported
                </label>
                <input
                  type="text"
                  value={formData.resolution_supported}
                  onChange={(e) => setFormData({ ...formData, resolution_supported: e.target.value })}
                  placeholder="e.g., 1080p, 720p"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tested Games (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tested_games}
                onChange={(e) => setFormData({ ...formData, tested_games: e.target.value })}
                placeholder="e.g., Super Mario Odyssey, Zelda BOTW"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="General performance notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Settings Notes</label>
              <textarea
                value={formData.settings_notes}
                onChange={(e) => setFormData({ ...formData, settings_notes: e.target.value })}
                placeholder="Recommended emulator settings..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                💾 {editingId ? "Update" : "Add"} Performance Data
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Performance List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Performance Data ({performances.length})
          </h4>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ➕ Add Performance Data
            </button>
          )}
        </div>

        {performances.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-gray-500 dark:text-gray-400">No performance data yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {performances.map((perf) => (
              <div key={perf.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{perf.console.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          perf.performance_rating === "excellent"
                            ? "bg-green-600 text-white"
                            : perf.performance_rating === "good"
                              ? "bg-blue-600 text-white"
                              : perf.performance_rating === "fair"
                                ? "bg-yellow-600 text-white"
                                : perf.performance_rating === "poor"
                                  ? "bg-orange-600 text-white"
                                  : "bg-red-600 text-white"
                        }`}
                      >
                        {perf.performance_rating.toUpperCase()}
                      </span>
                      {perf.fps_range && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{perf.fps_range} FPS</span>
                      )}
                      {perf.resolution_supported && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{perf.resolution_supported}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(perf)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(perf.id)}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {perf.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{perf.notes}</p>}

                {perf.tested_games && perf.tested_games.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tested Games: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{perf.tested_games.join(", ")}</span>
                  </div>
                )}

                {perf.settings_notes && (
                  <div className="bg-gray-100 dark:bg-gray-600 rounded p-3 mt-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{perf.settings_notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
