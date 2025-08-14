import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { EmulatorsClientPage } from "./EmulatorsClientPage"
import { Skeleton } from "@/components/ui/skeleton"

async function getEmulators() {
  try {
    const response = await supabase
      .from("emulators")
      .select(
        "id, name, slug, developer, description, image_url, supported_platforms, features, recommended, created_at, updated_at, console_id, console_ids",
      )
      .order("name", { ascending: true })
      .limit(100) // Add limit to prevent large queries

    // Check if response exists and has expected structure
    if (!response) {
      console.error("No response from Supabase")
      return []
    }

    const { data, error } = response

    if (error) {
      console.error("Supabase error fetching emulators:", error.message || error)
      return []
    }

    // Ensure data is an array and has expected structure
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from Supabase:", typeof data)
      return []
    }

    return data
  } catch (err: any) {
    console.error("Exception in getEmulators:", err?.message || err)
    if (err?.message?.includes("JSON")) {
      console.error("JSON parsing error - likely rate limited or connection issue")
    }
    return []
  }
}

async function getConsoles() {
  try {
    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))

    const { data, error } = await supabase
      .from("consoles")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(20) // Reduced limit further

    if (error) {
      console.error("Supabase error fetching consoles:", error)
      return getConsolesFallback()
    }

    if (!Array.isArray(data)) {
      console.error("Unexpected console data format:", typeof data)
      return getConsolesFallback()
    }

    return data
  } catch (err: any) {
    console.error("Exception in getConsoles:", err)
    return getConsolesFallback()
  }
}

function getConsolesFallback() {
  return [
    { id: "1", name: "Nintendo Switch" },
    { id: "2", name: "PlayStation 5" },
    { id: "3", name: "Xbox Series X/S" },
    { id: "4", name: "Nintendo 3DS" },
    { id: "5", name: "PlayStation 4" },
    { id: "6", name: "Nintendo DS" },
    { id: "7", name: "Game Boy Advance" },
    { id: "8", name: "PlayStation 2" },
    { id: "9", name: "GameCube" },
    { id: "10", name: "Nintendo 64" },
  ]
}

function EmulatorsSkeleton() {
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-6" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <Skeleton className="h-32 w-full mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function EmulatorsContent() {
  const emulators = await getEmulators()

  // Fetch consoles separately with additional error handling
  let consoles = []
  try {
    consoles = await getConsoles()
  } catch (err) {
    console.error("Failed to fetch consoles, using fallback:", err)
    consoles = getConsolesFallback()
  }

  return <EmulatorsClientPage emulators={emulators} consoles={consoles} />
}

export default function EmulatorsPage() {
  return (
    <Suspense fallback={<EmulatorsSkeleton />}>
      <EmulatorsContent />
    </Suspense>
  )
}
