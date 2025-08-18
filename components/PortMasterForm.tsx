"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export type PurchaseLink = { label: string; url: string }

export type PortEntry = {
  id?: string
  name: string
  image_url?: string
  description?: string
  genre: string[]
  ready_to_run: boolean
  necessary_files: string[]
  portmaster_link?: string
  purchase_links: PurchaseLink[]
  instructions?: string
  slug?: string
}

export default function PortMasterForm({ existing }: { existing?: PortEntry }) {
  const [form, setForm] = useState<PortEntry>(
    existing ?? {
      name: "",
      image_url: "",
      description: "",
      genre: [],
      ready_to_run: false,
      necessary_files: [],
      portmaster_link: "",
      purchase_links: [],
      instructions: "",
      slug: "",
    },
  )
  const [addingGenre, setAddingGenre] = useState("")
  const [addingFile, setAddingFile] = useState("")
  const [pLabel, setPLabel] = useState("")
  const [pUrl, setPUrl] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  async function save() {
    setBusy(true)
    setMessage(null)

    try {
      const { slug, ...basePayload } = form
      const payload = {
        ...basePayload,
        purchase_links: form.purchase_links,
      }

      let result
      if (existing?.id) {
        console.log("[v0] Updating PortMaster port without slug:", payload)
        result = await supabase.from("portmaster_ports").update(payload).eq("id", existing.id).select().single()
      } else {
        console.log("[v0] Inserting new PortMaster port without slug:", payload)
        result = await supabase.from("portmaster_ports").insert(payload).select().single()
      }

      const { data, error } = result

      if (error) {
        console.error("[v0] Database error:", error)
        setMessage(`Error: ${error.message}`)
        return
      }

      console.log("[v0] Successfully saved PortMaster port:", data)
      setMessage("Saved!")
    } catch (err) {
      console.error("[v0] Unexpected error saving PortMaster port:", err)
      setMessage(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className="text-sm opacity-80">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={form.name}
            onChange={(e) => {
              const newName = e.target.value
              setForm({
                ...form,
                name: newName,
                slug: generateSlug(newName),
              })
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated from name"
            disabled
          />
        </div>

        <div>
          <label className="text-sm font-medium">Image URL</label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Genre</label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Add genre and press +"
              value={addingGenre}
              onChange={(e) => setAddingGenre(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!addingGenre.trim()) return
                setForm({ ...form, genre: [...new Set([...form.genre, addingGenre.trim()])] })
                setAddingGenre("")
              }}
            >
              +
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.genre.map((g) => (
              <Badge
                key={g}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setForm({ ...form, genre: form.genre.filter((x) => x !== g) })}
              >
                {g} ✕
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Files Required or Ready to Run?</label>
          <div className="flex gap-3 items-center text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.ready_to_run}
                onChange={(e) => setForm({ ...form, ready_to_run: e.target.checked })}
              />
              Ready to run
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Necessary Files</label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Add filename/note and press +"
              value={addingFile}
              onChange={(e) => setAddingFile(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!addingFile.trim()) return
                setForm({ ...form, necessary_files: [...form.necessary_files, addingFile.trim()] })
                setAddingFile("")
              }}
            >
              +
            </Button>
          </div>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {form.necessary_files.map((f, i) => (
              <li
                key={i}
                className="cursor-pointer"
                onClick={() =>
                  setForm({ ...form, necessary_files: form.necessary_files.filter((_, idx) => idx !== i) })
                }
              >
                {f} ✕
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="text-sm font-medium">PortMaster Link</label>
          <Input value={form.portmaster_link} onChange={(e) => setForm({ ...form, portmaster_link: e.target.value })} />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Dynamic Purchase Links</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <Input placeholder="Label (Steam, Itch.io)" value={pLabel} onChange={(e) => setPLabel(e.target.value)} />
            <Input placeholder="https://..." value={pUrl} onChange={(e) => setPUrl(e.target.value)} />
            <Button
              type="button"
              onClick={() => {
                if (!pLabel.trim() || !pUrl.trim()) return
                setForm({
                  ...form,
                  purchase_links: [...form.purchase_links, { label: pLabel.trim(), url: pUrl.trim() }],
                })
                setPLabel("")
                setPUrl("")
              }}
            >
              Add
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {form.purchase_links.map((p, i) => (
              <li key={i} className="flex justify-between items-center text-sm border rounded px-2 py-1">
                <span>
                  {p.label} — {p.url}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setForm({ ...form, purchase_links: form.purchase_links.filter((_, idx) => idx !== i) })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Instructions (Markdown)</label>
          <Textarea
            rows={6}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={save} disabled={busy} className="w-full">
        {busy ? "Saving..." : "Save Port"}
      </Button>
    </div>
  )
}
