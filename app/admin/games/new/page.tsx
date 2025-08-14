import NewGameForm from "./NewGameForm"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewGamePage() {
  const { data: consoles, error } = await supabase
    .from("consoles")
    .select("id, name, manufacturer")
    .order("manufacturer", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    // Render a simple inline fallback instead of throwing to avoid boundary
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-500">Failed to load consoles: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add a new game</CardTitle>
        </CardHeader>
        <CardContent>
          <NewGameForm consoles={consoles || []} />
        </CardContent>
      </Card>
    </div>
  )
}
