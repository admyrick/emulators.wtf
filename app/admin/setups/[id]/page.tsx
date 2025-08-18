"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Setup {
  id: number
  title: string
  slug: string
  description: string
  difficulty: string
  estimated_time: string
  featured: boolean
  guide_content: string
  steps: any[]
  requirements: string[]
  tags: string[]
  image_url: string
  created_at: string
  updated_at: string
}

interface SetupFormData {
  title: string
  slug: string
  description: string
  difficulty: string
  estimated_time: string
  featured: boolean
  guide_content: string
  steps: any[]
  requirements: string[]
  tags: string[]
  image_url: string
}

export default function EditSetupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [setup, setSetup] = useState<Setup | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SetupFormData>({
    title: "",
    slug: "",
    description: "",
    difficulty: "beginner",
    estimated_time: "",
    featured: false,
    guide_content: "",
    steps: [],
    requirements: [],
    tags: [],
    image_url: "",
  })

  useEffect(() => {
    if (params.id === "new") {
      redirect("/admin/setups/new")
      return
    }
    fetchSetup()
  }, [params.id])

  const fetchSetup = async () => {
    try {
      const setupId = Number.parseInt(params.id)
      if (isNaN(setupId)) {
        console.error("Invalid setup ID:", params.id)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from("setups").select("*").eq("id", setupId).single()

      if (error) throw error

      setSetup(data)
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        difficulty: data.difficulty || "beginner",
        estimated_time: data.estimated_time || "",
        featured: data.featured || false,
        guide_content: data.guide_content || "",
        steps: data.steps || [],
        requirements: data.requirements || [],
        tags: data.tags || [],
        image_url: data.image_url || "",
      })
    } catch (error) {
      console.error("Error fetching setup:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from("setups")
        .update({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number.parseInt(params.id))

      if (error) throw error

      router.push("/admin/setups")
    } catch (error) {
      console.error("Error updating setup:", error)
      alert("Error updating setup")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading setup...</div>
  }

  if (!setup) {
    return <div className="p-8">Setup not found</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{setup.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Edit setup guide details and content</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to Setups
        </button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {setup.image_url ? (
                  <img
                    src={setup.image_url || "/placeholder.svg"}
                    alt={setup.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Setup Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
                      <span className="ml-2 capitalize">{setup.difficulty}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="ml-2">{setup.estimated_time}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Featured:</span>
                      <span className="ml-2">{setup.featured ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Slug:</span>
                      <span className="ml-2">{setup.slug}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{setup.description}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Time
                </label>
                <input
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                  placeholder="e.g., 30 minutes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured Setup
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guide Content *</label>
              <textarea
                required
                rows={10}
                value={formData.guide_content}
                onChange={(e) => setFormData({ ...formData, guide_content: e.target.value })}
                placeholder="Write the detailed setup guide content here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Setup Guide"}
              </button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
