import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { LinksManager } from "@/components/links-manager"

interface Handheld {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  description: string | null
  image_url: string | null
  price_range: string | null
  release_year: number | null
  screen_size: string | null
  cpu: string | null
  ram: string | null
  internal_storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  key_features: string[] | null
  created_at: string
  updated_at: string
}

async function getHandheldWithRelationships(id: string) {
  const [
    handheldResult,
    linksResult,
    customFirmwareResult,
    retailersResult,
    categoriesResult,
    compatibleToolsResult,
    customFirmwareOptionsResult,
    retailersOptionsResult,
    categoriesOptionsResult,
  ] = await Promise.all([
    supabase.from("handhelds").select("*").eq("id", id).single(),
    // Order by updated_at to avoid relying on a non-existent display_order column
    supabase
      .from("links")
      .select("*")
      .eq("entity_type", "handheld")
      .eq("entity_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("handheld_custom_firmware")
      .select(`
          id,
          compatibility_notes,
          custom_firmware:custom_firmware_id ( id, name, slug )
        `)
      .eq("handheld_id", id),
    supabase
      .from("handheld_retailers")
      .select(`
          id,
          price,
          availability,
          product_url,
          retailers:retailer_id ( id, name, website_url )
        `)
      .eq("handheld_id", id),
    supabase
      .from("handheld_device_categories")
      .select(`
          id,
          device_categories:device_category_id ( id, name, description )
        `)
      .eq("handheld_id", id),
    // Request only columns that exist on tools to avoid schema errors
    supabase
      .from("tool_handheld_compatibility")
      .select(`
          id,
          compatibility_notes,
          tool:tool_id ( id, name, slug, developer )
        `)
      .eq("handheld_id", id),
    supabase.from("custom_firmware").select("id, name, slug").order("name"),
    supabase.from("retailers").select("id, name, website_url").order("name"),
    supabase.from("device_categories").select("id, name, description").order("name"),
  ])

  return {
    handheld: handheldResult.data as Handheld | null,
    links: linksResult.data || [],
    customFirmware: customFirmwareResult.data || [],
    retailers: retailersResult.data || [],
    categories: categoriesResult.data || [],
    compatibleTools: compatibleToolsResult.data || [],
    availableCustomFirmware: customFirmwareOptionsResult.data || [],
    availableRetailers: retailersOptionsResult.data || [],
    availableCategories: categoriesOptionsResult.data || [],
  }
}

// Server Actions
export async function updateHandheld(formData: FormData) {
  "use server"
  try {
    const id = String(formData.get("id") || "")
    const slug = String(formData.get("slug") || "")

    const payload = {
      name: String(formData.get("name") || "").trim(),
      slug,
      manufacturer: (formData.get("manufacturer") as string) || null,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      price_range: (formData.get("price_range") as string) || null,
      release_year:
        formData.get("release_year") && formData.get("release_year") !== "0"
          ? Number(formData.get("release_year"))
          : null,
      screen_size: (formData.get("screen_size") as string) || null,
      cpu: (formData.get("cpu") as string) || null,
      ram: (formData.get("ram") as string) || null,
      internal_storage: (formData.get("internal_storage") as string) || null,
      battery_life: (formData.get("battery_life") as string) || null,
      weight: (formData.get("weight") as string) || null,
      dimensions: (formData.get("dimensions") as string) || null,
      key_features: (formData.get("key_features") as string)
        ? String(formData.get("key_features"))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin.from("handhelds").update(payload).eq("id", id)
    if (error) throw new Error(error.message)

    revalidatePath(`/admin/handhelds/${id}`)
    revalidatePath("/admin/handhelds")
    revalidatePath("/handhelds")
    revalidatePath(`/handheld/${slug}`)
    return { ok: true }
  } catch (e) {
    console.error("updateHandheld error:", e)
    // Do not throw to avoid triggering the route error boundary.
    return { ok: false, error: (e as Error)?.message || "Failed to update handheld" }
  }
}

export async function deleteHandheld(formData: FormData) {
  "use server"
  const id = String(formData.get("id") || "")
  const { error } = await supabaseAdmin.from("handhelds").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/handhelds")
  revalidatePath("/handhelds")
  redirect("/admin/handhelds")
}

export async function addCustomFirmware(formData: FormData) {
  "use server"
  const handheld_id = String(formData.get("handheld_id") || "")
  const custom_firmware_id = String(formData.get("custom_firmware_id") || "")
  const compatibility_notes = (formData.get("compatibility_notes") as string) || null
  const { error } = await supabaseAdmin
    .from("handheld_custom_firmware")
    .insert({ handheld_id, custom_firmware_id, compatibility_notes })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export async function removeCustomFirmware(formData: FormData) {
  "use server"
  const id = String(formData.get("id") || "")
  const handheld_id = String(formData.get("handheld_id") || "")
  const { error } = await supabaseAdmin.from("handheld_custom_firmware").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export async function addRetailer(formData: FormData) {
  "use server"
  const handheld_id = String(formData.get("handheld_id") || "")
  const retailer_id = String(formData.get("retailer_id") || "")
  const price = (formData.get("price") as string) || null
  const availability = (formData.get("availability") as string) || null
  const product_url = (formData.get("product_url") as string) || null
  const { error } = await supabaseAdmin
    .from("handheld_retailers")
    .insert({ handheld_id, retailer_id, price, availability, product_url })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export async function removeRetailer(formData: FormData) {
  "use server"
  const id = String(formData.get("id") || "")
  const handheld_id = String(formData.get("handheld_id") || "")
  const { error } = await supabaseAdmin.from("handheld_retailers").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export async function addCategory(formData: FormData) {
  "use server"
  const handheld_id = String(formData.get("handheld_id") || "")
  const category_id = String(formData.get("category_id") || "")
  const { error } = await supabaseAdmin
    .from("handheld_device_categories")
    .insert({ handheld_id, device_category_id: category_id })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export async function removeCategory(formData: FormData) {
  "use server"
  const id = String(formData.get("id") || "")
  const handheld_id = String(formData.get("handheld_id") || "")
  const { error } = await supabaseAdmin.from("handheld_device_categories").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/handhelds/${handheld_id}`)
}

export default async function AdminHandheldDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const data = await getHandheldWithRelationships(id)

  if (!data?.handheld) {
    const currentPath = `/admin/handhelds/${id}`
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Handheld not found</h1>
        <p className="text-slate-400">
          The handheld could not be loaded. It may have been removed or there was a temporary error.
        </p>
        <div className="flex gap-3">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <a href={currentPath}>Reload Page</a>
          </Button>
          <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
            <Link href="/admin/handhelds">Back to Handhelds</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handheld = data.handheld
  const yearOptions: number[] = []
  const now = new Date().getFullYear()
  for (let y = now + 5; y >= now - 25; y--) yearOptions.push(y)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/handhelds">
          <Button
            variant="outline"
            size="sm"
            className="mb-4 bg-transparent border-slate-600 text-white hover:bg-slate-700"
          >
            ← Back to Handhelds
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Handheld</h1>
            <p className="text-slate-400">Update handheld information and manage relationships</p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              <Link href={`/handheld/${handheld.slug}`} target="_blank">
                🔗 View Public Page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateHandheld} className="space-y-4">
                <input type="hidden" name="id" value={handheld.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={handheld.name}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-white">
                      Slug *
                    </Label>
                    <Input
                      id="slug"
                      name="slug"
                      defaultValue={handheld.slug}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer" className="text-white">
                      Manufacturer
                    </Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      defaultValue={handheld.manufacturer || ""}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="release_year" className="text-white">
                      Release Year
                    </Label>
                    <Select name="release_year" defaultValue={handheld.release_year?.toString() || "0"}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select release year" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="0" className="text-white">
                          Not specified
                        </SelectItem>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)} className="text-white">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={handheld.description || ""}
                    rows={3}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_url" className="text-white">
                      Image URL
                    </Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      type="url"
                      defaultValue={handheld.image_url || ""}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_range" className="text-white">
                      Price Range
                    </Label>
                    <Input
                      id="price_range"
                      name="price_range"
                      defaultValue={handheld.price_range || ""}
                      placeholder="e.g., $399-$699"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="screen_size" className="text-white">
                        Screen Size
                      </Label>
                      <Input
                        id="screen_size"
                        name="screen_size"
                        defaultValue={handheld.screen_size || ""}
                        placeholder="e.g., 7-inch 1280x800"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpu" className="text-white">
                        CPU
                      </Label>
                      <Input
                        id="cpu"
                        name="cpu"
                        defaultValue={handheld.cpu || ""}
                        placeholder="e.g., AMD Ryzen Z1 Extreme"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ram" className="text-white">
                        RAM
                      </Label>
                      <Input
                        id="ram"
                        name="ram"
                        defaultValue={handheld.ram || ""}
                        placeholder="e.g., 16GB LPDDR5"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="internal_storage" className="text-white">
                        Internal Storage
                      </Label>
                      <Input
                        id="internal_storage"
                        name="internal_storage"
                        defaultValue={handheld.internal_storage || ""}
                        placeholder="e.g., 512GB NVMe SSD"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="battery_life" className="text-white">
                        Battery Life
                      </Label>
                      <Input
                        id="battery_life"
                        name="battery_life"
                        defaultValue={handheld.battery_life || ""}
                        placeholder="e.g., 2-8 hours"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-white">
                        Weight
                      </Label>
                      <Input
                        id="weight"
                        name="weight"
                        defaultValue={handheld.weight || ""}
                        placeholder="e.g., 608g"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions" className="text-white">
                        Dimensions
                      </Label>
                      <Input
                        id="dimensions"
                        name="dimensions"
                        defaultValue={handheld.dimensions || ""}
                        placeholder="e.g., 298×111×21mm"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="key_features" className="text-white">
                    Key Features (comma-separated)
                  </Label>
                  <Textarea
                    id="key_features"
                    name="key_features"
                    defaultValue={handheld.key_features?.join(", ") || ""}
                    rows={2}
                    placeholder="e.g., Steam OS, Hall Effect Joysticks, VRR Display"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  💾 Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <LinksManager entityType="handheld" entityId={handheld.id} links={data.links} onLinksChange={() => {}} />
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {handheld.image_url && (
                  <div className="aspect-video relative bg-slate-700 rounded-lg overflow-hidden">
                    <Image
                      src={handheld.image_url || "/placeholder.svg?height=360&width=640&query=handheld-image"}
                      alt={handheld.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-white">{handheld.name}</h3>
                  {handheld.manufacturer && <p className="text-sm text-slate-400">{handheld.manufacturer}</p>}
                  {handheld.release_year && (
                    <Badge
                      variant="secondary"
                      className="mt-2 flex items-center gap-1 w-fit bg-slate-700 text-slate-200"
                    >
                      📅 {handheld.release_year}
                    </Badge>
                  )}
                </div>
                {handheld.description && <p className="text-sm text-slate-300">{handheld.description}</p>}
                {handheld.key_features?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {handheld.key_features.slice(0, 3).map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {f}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <Button asChild size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href={`/handheld/${handheld.slug}`} target="_blank">
                    🔗 View Public Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Custom Firmware:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {data.customFirmware.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retailers:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {data.retailers.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Categories:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {data.categories.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compatible Tools:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {data.compatibleTools.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Links:</span>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {data.links.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    🗑️ Delete Handheld
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                      This will permanently delete "{handheld.name}" and related data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 text-white hover:bg-slate-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <form action={deleteHandheld}>
                        <input type="hidden" name="id" value={handheld.id} />
                        <Button type="submit" variant="destructive">
                          Delete Handheld
                        </Button>
                      </form>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
