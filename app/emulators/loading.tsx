import { Skeleton } from "@/components/ui/skeleton"
import { Monitor } from "lucide-react"

export default function EmulatorsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emulators</h1>
          <p className="text-gray-600 dark:text-gray-300">Discover the best emulators for retro gaming</p>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-full md:w-48 h-10" />
          <Skeleton className="w-full md:w-48 h-10" />
          <Skeleton className="w-20 h-10" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
