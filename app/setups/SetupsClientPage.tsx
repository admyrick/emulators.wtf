"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

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

interface SetupsClientPageProps {
  initialSetups: Setup[]
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function SetupsClientPage({ initialSetups }: SetupsClientPageProps) {
  const [setups] = useState<Setup[]>(initialSetups)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  const filteredSetups = setups.filter((setup) => {
    const matchesSearch =
      setup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setup.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === "all" || setup.difficulty_level === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  const featuredSetups = filteredSetups.filter((setup) => setup.featured)
  const regularSetups = filteredSetups.filter((setup) => !setup.featured)

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search setup guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Featured Setups */}
      {featuredSetups.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Setup Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredSetups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} featured />
            ))}
          </div>
        </section>
      )}

      {/* All Setups */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          All Setup Guides ({filteredSetups.length})
        </h2>
        {filteredSetups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Setup Guides Found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularSetups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SetupCard({ setup, featured = false }: { setup: Setup; featured?: boolean }) {
  return (
    <Link href={`/setups/${setup.slug}`}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${featured ? "ring-2 ring-blue-500" : ""}`}
      >
        {setup.image_url && (
          <div className="relative h-48 w-full">
            <Image src={setup.image_url || "/placeholder.svg"} alt={setup.title} fill className="object-cover" />
            {featured && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                Featured
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[setup.difficulty_level as keyof typeof difficultyColors]}`}
            >
              {setup.difficulty_level}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">⏱️ {setup.estimated_time}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{setup.title}</h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{setup.description}</p>

          {setup.requirements && setup.requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Requirements:</p>
              <div className="flex flex-wrap gap-1">
                {setup.requirements.slice(0, 3).map((req, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {req}
                  </span>
                ))}
                {setup.requirements.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    +{setup.requirements.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>View Guide →</span>
            <span>{new Date(setup.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
