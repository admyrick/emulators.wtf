import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Server Action defined inline to avoid client importing issues.
async function createNewHandheld(formData: FormData) {
  "use server"

  const name = (formData.get("name") as string | null)?.trim() || ""
  if (!name) {
    // Model expected errors as return values (could be wired to useActionState if needed) [^1][^4]
    return { success: false, error: "Name is required." }
  }

  const manufacturer = (formData.get("manufacturer") as string | null)?.trim() || null
  const release_date = (formData.get("release_date") as string | null) || null
  const image_url = (formData.get("image_url") as string | null)?.trim() || null
  const description = (formData.get("description") as string | null)?.trim() || null

  const providedSlug = (formData.get("slug") as string | null)?.trim()
  const slug =
    providedSlug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const { data, error } = await supabaseAdmin
    .from("handhelds")
    .insert([
      {
        name,
        manufacturer,
        release_date,
        slug,
        image_url,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate the listing and redirect on success
  revalidatePath("/admin/handhelds")
  redirect("/admin/handhelds")
}

export const metadata: Metadata = {
  title: "Add New Handheld - Admin",
  description: "Add a new handheld gaming device to the database",
}

export default function NewHandheldPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Add New Handheld</h1>
        <p className="text-slate-400">Provide basic details and create a new handheld entry.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Handheld details</CardTitle>
        </CardHeader>

        {/* Post directly to the inline Server Action. No client import required. */}
        <form action={createNewHandheld}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-200">Name</Label>
              <input
                id="name"
                name="name"
                required
                placeholder="e.g., TrimUI Brick"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manufacturer" className="text-slate-200">Manufacturer</Label>
              <input
                id="manufacturer"
                name="manufacturer"
                placeholder="e.g., TrimUI"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="release_date" className="text-slate-200">Release date</Label>
                <input
                  id="release_date"
                  name="release_date"
                  type="date"
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_url" className="text-slate-200">Image URL</Label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://example.com/handheld.jpg"
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-200">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the handheld..."
                className="min-h-[120px] border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus-visible:ring-purple-600"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-slate-200">Custom slug (optional)</Label>
              <input
                id="slug"
                name="slug"
                placeholder="auto-generated from name if left blank"
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Handheld
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
