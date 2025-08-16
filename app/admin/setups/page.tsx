"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Setup {
  id: string
  title: string
  slug: string
  description: string
  difficulty_level: string
  estimated_time: string
  featured: boolean
  created_at: string
}

export default function AdminSetupsPage() {
  const [setups, setSetups] = useState<Setup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSetups()
  }, [])

  async function fetchSetups() {
    try {
      const { data, error } = await supabase.from("setups").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setSetups(data || [])
    } catch (error) {
      console.error("Error fetching setups:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSetup(id: string) {
    if (!confirm("Are you sure you want to delete this setup?")) return

    try {
      const { error } = await supabase.from("setups").delete().eq("id", id)

      if (error) throw error

      setSetups(setups.filter((setup) => setup.id !== id))
    } catch (error) {
      console.error("Error deleting setup:", error)
      alert("Error deleting setup")
    }
  }

  const filteredSetups = setups.filter(
    (setup) =>
      setup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setup.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="p-8">Loading setups...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔧 Manage Setup Guides</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage comprehensive setup guides for handheld gaming devices
          </p>
        </div>
        <Link
          href="/admin/setups/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          ➕ Add Setup Guide
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Setups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{setups.length}</p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {setups.filter((s) => s.featured).length}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Beginner</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {setups.filter((s) => s.difficulty_level === "beginner").length}
              </p>
            </div>
            <div className="text-3xl">🟢</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expert</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {setups.filter((s) => s.difficulty_level === "expert").length}
              </p>
            </div>
            <div className="text-3xl">🔴</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search setup guides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Setups List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Setup Guide
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
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
              {filteredSetups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-6xl mb-4">🔧</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Setup Guides Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Get started by creating your first setup guide.
                    </p>
                    <Link
                      href="/admin/setups/new"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      ➕ Add Setup Guide
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredSetups.map((setup) => (
                  <tr key={setup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{setup.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {setup.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          setup.difficulty_level === "beginner"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : setup.difficulty_level === "intermediate"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : setup.difficulty_level === "advanced"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {setup.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{setup.estimated_time}</td>
                    <td className="px-6 py-4">
                      {setup.featured ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(setup.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/setups/${setup.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                      >
                        🔗 View
                      </Link>
                      <Link
                        href={`/admin/setups/${setup.id}/edit`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => deleteSetup(setup.id)}
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
