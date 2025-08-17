// app/compare/page.tsx
import { supabase } from "@/lib/supabase"
import CompareClient from "./CompareClient"

export const dynamic = "force-dynamic"

type SearchParams = { ids?: string }

async function getInitialHandhelds(idsParam?: string) {
  if (!idsParam) return []
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (!ids.length) return []

  const { data, error } = await supabase
    .from("handhelds")
    .select(
      "id,name,slug,image_url,manufacturer,price_range,release_date,screen_size,processor,ram,storage,battery_life,weight,dimensions",
    )
    .in("id", ids)
    .order("name", { ascending: true })

  if (error) {
    console.error("Failed to fetch initial handhelds:", error.message)
    return []
  }
  return data ?? []
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const initialHandhelds = await getInitialHandhelds(searchParams?.ids)
  const initialIds = initialHandhelds.map((h) => h.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Handheld Comparison</h1>
      <p className="text-muted-foreground mb-8">
        Add handhelds to compare specs side-by-side. Your selection is saved in the URL so you can share it.
      </p>
      <CompareClient initialHandhelds={initialHandhelds} initialIds={initialIds} />
    </div>
  )
}
