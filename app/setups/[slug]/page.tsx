import { notFound } from "next/navigation"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import Image from "next/image"
import Link from "next/link"

interface Setup {
  id: string
  title: string
  slug: string
  description: string
  long_description: string
  difficulty_level: string
  estimated_time: string
  requirements: string[]
  steps: string[]
  image_url: string
  featured: boolean
  created_at: string
}

interface SetupComponent {
  id: string
  component_type: string
  component_id: string
  is_required: boolean
  notes: string
  sort_order: number
}

async function getSetup(slug: string): Promise<Setup | null> {
  const { data, error } = await supabase.from("setups").select("*").eq("slug", slug).single()

  if (error || !data) {
    return null
  }

  return data
}

async function getSetupComponents(setupId: string): Promise<SetupComponent[]> {
  const { data, error } = await supabase
    .from("setup_components")
    .select("*")
    .eq("setup_id", setupId)
    .order("sort_order")

  if (error) {
    console.error("Error fetching setup components:", error)
    return []
  }

  return data || []
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default async function SetupDetailPage({ params }: { params: { slug: string } }) {
  const setup = await getSetup(params.slug)

  if (!setup) {
    notFound()
  }

  const components = await getSetupComponents(setup.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/setups" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Setup Guides
          </Link>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          {setup.image_url && (
            <div className="relative h-64 md:h-96 w-full">
              <Image src={setup.image_url || "/placeholder.svg"} alt={setup.title} fill className="object-cover" />
              {setup.featured && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured Guide
                </div>
              )}
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[setup.difficulty_level as keyof typeof difficultyColors]}`}
              >
                {setup.difficulty_level}
              </span>
              <span className="text-gray-600 dark:text-gray-400">⏱️ {setup.estimated_time}</span>
              <span className="text-gray-600 dark:text-gray-400">
                📅 {new Date(setup.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{setup.title}</h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{setup.description}</p>

            {setup.long_description && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{setup.long_description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements */}
            {setup.requirements && setup.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📋 Requirements</h2>
                <ul className="space-y-2">
                  {setup.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {setup.steps && setup.steps.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔧 Step-by-Step Guide</h2>
                <div className="space-y-6">
                  {setup.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Components */}
            {components.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🧩 Components Used</h3>
                <div className="space-y-3">
                  {components.map((component) => (
                    <div key={component.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {component.component_type}
                        </span>
                        {component.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{component.notes}</p>
                        )}
                      </div>
                      {component.is_required ? (
                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                          Required
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ℹ️ Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{setup.difficulty_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{setup.estimated_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Published:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(setup.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
