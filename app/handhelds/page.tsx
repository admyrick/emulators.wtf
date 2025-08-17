import { Suspense } from "react"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import HandheldsClientPage from "./HandheldsClientPage"
import { Skeleton } from "@/components/ui/skeleton"

export const revalidate = 60 // cache for 60s, adjust as needed

async function getHandhelds() {
  try {
    console.log("[v0] Starting handhelds query...")

    const { data: testData, error: testError } = await supabase.from("handhelds").select("*").limit(1)

    if (testError) {
      console.error("[v0] Test query error:", testError)
    } else {
      console.log(
        "[v0] Test query successful, available columns:",
        testData?.[0] ? Object.keys(testData[0]) : "No data",
      )
    }

    const { data, error } = await supabase
      .from("handhelds")
      .select("*")
      .order("created_at", { ascending: false })
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Main query error:", error)
      throw error
    }

    console.log("[v0] Query successful, found", data?.length || 0, "handhelds")
    return data ?? []
  } catch (e) {
    console.error("Error fetching handhelds:", e)
    return [] // don't crash the page
  }
}

function HandheldsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2 bg-slate-800" />
        <Skeleton className="h-6 w-96 mb-6 bg-slate-800" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-2 bg-slate-800" />
              <Skeleton className="h-4 w-20 mx-auto bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full bg-slate-800" />
            <Skeleton className="h-6 w-3/4 bg-slate-800" />
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-2/3 bg-slate-800" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 bg-slate-800" />
              <Skeleton className="h-8 w-20 bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function HandheldsContent() {
  const handhelds = await getHandhelds()

  return <HandheldsClientPage handhelds={handhelds} />
}

export default function HandheldsPage() {
  return (
    <Suspense fallback={<HandheldsSkeleton />}>
      <HandheldsContent />
    </Suspense>
  )
}
