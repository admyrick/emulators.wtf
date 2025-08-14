"use client"

import type React from "react"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createGame } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ConsoleOption = {
  id: string
  name: string
  manufacturer: string | null
}

export default function NewGameForm({
  consoles = [],
}: {
  consoles?: ConsoleOption[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [consoleId, setConsoleId] = useState("")
  const [developer, setDeveloper] = useState("")
  const [publisher, setPublisher] = useState("")
  const [genre, setGenre] = useState("")
  const [releaseDate, setReleaseDate] = useState("")

  const manufacturerGroups = useMemo(() => {
    const groups: Record<string, ConsoleOption[]> = {}
    consoles.forEach((c) => {
      const key = c.manufacturer || "Other"
      groups[key] ||= []
      groups[key].push(c)
    })
    return groups
  }, [consoles])

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  function onNameChange(val: string) {
    setName(val)
    setSlug((prev) => (prev ? prev : generateSlug(val)))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const fd = new FormData()
    fd.set("name", name.trim())
    fd.set("slug", slug.trim() || generateSlug(name))
    if (description.trim()) fd.set("description", description.trim())
    fd.set("console_id", consoleId) // required
    if (developer.trim()) fd.set("developer", developer.trim())
    if (publisher.trim()) fd.set("publisher", publisher.trim())
    if (genre.trim()) fd.set("genre", genre.trim())
    if (releaseDate) fd.set("release_date", releaseDate)

    startTransition(async () => {
      const res = await createGame(fd)
      if (!res?.success) {
        toast({
          title: "Error creating game",
          description: res?.error || "Failed to create game",
          variant: "destructive",
        })
        return
      }
      toast({ title: "Game created", description: "Your game has been added." })
      router.push("/admin/games")
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Super Example World"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="super-example-world"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Brief description of the game..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Console</Label>
          <Select value={consoleId} onValueChange={setConsoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a console" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(manufacturerGroups).map(([maker, list]) => (
                <div key={maker}>
                  <div className="px-2 py-1 text-xs text-muted-foreground">{maker}</div>
                  {list.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Action, RPG, Puzzle..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="developer">Developer</Label>
          <Input
            id="developer"
            value={developer}
            onChange={(e) => setDeveloper(e.target.value)}
            placeholder="Studio Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Publisher Name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="release_date">Release date</Label>
        <Input id="release_date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
      </div>

      <Button type="submit" disabled={isPending || !consoleId} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Create Game
          </>
        )}
      </Button>
    </form>
  )
}
