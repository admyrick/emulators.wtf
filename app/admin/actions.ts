"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Console actions
export async function createConsole(formData: FormData) {
  try {
    console.log("Creating console with form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const manufacturer = formData.get("manufacturer") as string
    const release_date = formData.get("release_date") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string

    if (!name?.trim()) {
      throw new Error("Console name is required")
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const consoleData = {
      name: name.trim(),
      slug,
      manufacturer: manufacturer?.trim() || null,
      release_date: release_date || null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
    }

    console.log("Inserting console data:", consoleData)

    const { data, error } = await supabase.from("consoles").insert([consoleData]).select().single()

    if (error) {
      console.error("Database error creating console:", error)
      throw new Error(`Failed to create console: ${error.message}`)
    }

    console.log("Console created successfully:", data)
    revalidatePath("/admin/consoles")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createConsole:", error)
    throw error
  }
}

export async function updateConsole(id: string, formData: FormData) {
  try {
    console.log("Updating console with ID:", id, "Form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const manufacturer = formData.get("manufacturer") as string
    const release_year = formData.get("release_year") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string
    const slug = formData.get("slug") as string

    if (!name?.trim()) {
      return { success: false, error: "Console name is required" }
    }

    const finalSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const consoleData = {
      name: name.trim(),
      slug: finalSlug,
      manufacturer: manufacturer?.trim() || null,
      release_year: release_year ? Number.parseInt(release_year, 10) : null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    console.log("Updating console data:", consoleData)

    const { data, error } = await supabase.from("consoles").update(consoleData).eq("id", id).select()

    if (error) {
      console.error("Database error updating console:", error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error("No console found with ID:", id)
      return { success: false, error: "Console not found" }
    }

    const updatedConsole = data[0]
    console.log("Console updated successfully:", updatedConsole)
    revalidatePath("/admin/consoles")
    revalidatePath(`/admin/consoles/${id}`)
    return { success: true, data: updatedConsole }
  } catch (error: any) {
    console.error("Error in updateConsole:", error)
    return { success: false, error: error.message || "Failed to update console" }
  }
}

export async function deleteConsole(id: string) {
  try {
    console.log("Deleting console with ID:", id)

    const { error } = await supabase.from("consoles").delete().eq("id", id)

    if (error) {
      console.error("Database error deleting console:", error)
      throw new Error(`Failed to delete console: ${error.message}`)
    }

    console.log("Console deleted successfully")
    revalidatePath("/admin/consoles")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteConsole:", error)
    throw error
  }
}

// Game actions
export async function createGame(formData: FormData) {
  try {
    console.log("Creating game with form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const developer = formData.get("developer") as string
    const publisher = formData.get("publisher") as string
    const release_date = formData.get("release_date") as string
    const description = formData.get("description") as string
    const genre = formData.get("genre") as string
    const console_id = formData.get("console_id") as string

    if (!name?.trim()) {
      return { success: false, error: "Game name is required" }
    }

    if (!console_id) {
      return { success: false, error: "Console selection is required" }
    }

    const gameData = {
      name: name.trim(),
      slug:
        slug?.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      developer: developer?.trim() || null,
      publisher: publisher?.trim() || null,
      release_date: release_date || null,
      description: description?.trim() || null,
      genre: genre?.trim() || null,
      console_id: console_id,
    }

    console.log("Inserting game data:", gameData)

    const { data, error } = await supabase.from("games").insert([gameData]).select()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    console.log("Game created successfully:", data)

    revalidatePath("/admin/games")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createGame:", error)
    return { success: false, error: "Failed to create game" }
  }
}

export async function updateGame(id: string, formData: FormData) {
  try {
    console.log("Updating game with ID:", id, "Form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const developer = formData.get("developer") as string
    const publisher = formData.get("publisher") as string
    const release_date = formData.get("release_date") as string
    const description = formData.get("description") as string
    const genre = formData.get("genre") as string
    const console_id = formData.get("console_id") as string

    if (!name?.trim()) {
      return { success: false, error: "Game name is required" }
    }

    if (!console_id) {
      return { success: false, error: "Console selection is required" }
    }

    const gameData = {
      name: name.trim(),
      slug:
        slug?.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      developer: developer?.trim() || null,
      publisher: publisher?.trim() || null,
      release_date: release_date || null,
      description: description?.trim() || null,
      genre: genre?.trim() || null,
      console_id: console_id,
      updated_at: new Date().toISOString(),
    }

    console.log("Updating game data:", gameData)

    const { data, error } = await supabase.from("games").update(gameData).eq("id", id).select()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error("No game found with ID:", id)
      return { success: false, error: "Game not found" }
    }

    const updatedGame = data[0]
    console.log("Game updated successfully:", updatedGame)

    revalidatePath("/admin/games")
    revalidatePath(`/admin/games/${id}`)
    return { success: true, data: updatedGame }
  } catch (error: any) {
    console.error("Error in updateGame:", error)
    return { success: false, error: error.message || "Failed to update game" }
  }
}

export async function deleteGame(id: string) {
  try {
    console.log("Deleting game with ID:", id)

    const { error } = await supabase.from("games").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    console.log("Game deleted successfully")

    revalidatePath("/admin/games")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteGame:", error)
    return { success: false, error: "Failed to delete game" }
  }
}

// Emulator actions
export async function createEmulator(formData: FormData) {
  try {
    console.log("Creating emulator with form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const developer = formData.get("developer") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string
    const supported_platforms = formData.get("supported_platforms") as string
    const features = formData.get("features") as string
    const recommended = formData.get("recommended") === "true"
    const console_ids = formData.get("console_ids") as string

    if (!name?.trim()) {
      return { success: false, error: "Emulator name is required" }
    }

    // Parse console_ids - it comes as a JSON string from the form
    let parsedConsoleIds: string[] = []
    if (console_ids) {
      try {
        parsedConsoleIds = JSON.parse(console_ids)
      } catch {
        // If JSON parsing fails, try splitting by comma
        parsedConsoleIds = console_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      }
    }

    if (!parsedConsoleIds.length) {
      return { success: false, error: "At least one console selection is required" }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Parse comma-separated values
    const parsedPlatforms = supported_platforms
      ? supported_platforms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null
    const parsedFeatures = features
      ? features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null

    const primaryConsoleId = parsedConsoleIds.length ? parsedConsoleIds[0] : null

    const emulatorData = {
      name: name.trim(),
      slug,
      developer: developer?.trim() || null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      supported_platforms: parsedPlatforms,
      features: parsedFeatures,
      recommended,
      console_ids: parsedConsoleIds,
      console_id: primaryConsoleId,
    }

    console.log("Inserting emulator data:", emulatorData)

    const { data, error } = await supabase.from("emulators").insert([emulatorData]).select().single()

    if (error) {
      console.error("Database error creating emulator:", error)
      return { success: false, error: error.message }
    }

    console.log("Emulator created successfully:", data)
    revalidatePath("/admin/emulators")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error in createEmulator:", error)
    return { success: false, error: error.message || "Failed to create emulator" }
  }
}

export async function updateEmulator(id: string, formData: FormData) {
  try {
    console.log("Updating emulator with ID:", id, "Form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const developer = formData.get("developer") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string
    const supported_platforms = formData.get("supported_platforms") as string
    const features = formData.get("features") as string
    const recommended = formData.get("recommended") === "true"
    const console_ids = formData.get("console_ids") as string

    if (!name?.trim()) {
      return { success: false, error: "Emulator name is required" }
    }

    // Parse console_ids
    let parsedConsoleIds: string[] = []
    if (console_ids) {
      try {
        parsedConsoleIds = JSON.parse(console_ids)
      } catch {
        parsedConsoleIds = console_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      }
    }

    if (!parsedConsoleIds.length) {
      return { success: false, error: "At least one console selection is required" }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const parsedPlatforms = supported_platforms
      ? supported_platforms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null
    const parsedFeatures = features
      ? features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null

    const primaryConsoleId = parsedConsoleIds.length ? parsedConsoleIds[0] : null

    const emulatorData = {
      name: name.trim(),
      slug,
      developer: developer?.trim() || null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      supported_platforms: parsedPlatforms,
      features: parsedFeatures,
      recommended,
      console_ids: parsedConsoleIds,
      console_id: primaryConsoleId,
      updated_at: new Date().toISOString(),
    }

    console.log("Updating emulator data:", emulatorData)

    const { data, error } = await supabase.from("emulators").update(emulatorData).eq("id", id).select()

    if (error) {
      console.error("Database error updating emulator:", error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error("No emulator found with ID:", id)
      return { success: false, error: "Emulator not found" }
    }

    const updatedEmulator = data[0]
    console.log("Emulator updated successfully:", updatedEmulator)
    revalidatePath("/admin/emulators")
    revalidatePath(`/admin/emulators/${id}`)
    return { success: true, data: updatedEmulator }
  } catch (error: any) {
    console.error("Error in updateEmulator:", error)
    return { success: false, error: error.message || "Failed to update emulator" }
  }
}

export async function deleteEmulator(id: string) {
  try {
    console.log("Deleting emulator with ID:", id)

    const { error } = await supabase.from("emulators").delete().eq("id", id)

    if (error) {
      console.error("Database error deleting emulator:", error)
      return { success: false, error: error.message }
    }

    console.log("Emulator deleted successfully")
    revalidatePath("/admin/emulators")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteEmulator:", error)
    return { success: false, error: "Failed to delete emulator" }
  }
}

// Tool actions - Fixed to use correct column names
export async function createTool(formData: FormData) {
  try {
    console.log("Creating tool with form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const developer = formData.get("developer") as string
    const description = formData.get("description") as string
    const download_url = formData.get("download_url") as string | null

    if (!name?.trim()) {
      return { success: false, error: "Tool name is required" }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Only insert columns that exist widely: name, slug, developer, description
    const toolData = {
      name: name.trim(),
      slug,
      developer: developer?.trim() || null,
      description: description?.trim() || null,
    }

    console.log("Inserting tool data:", toolData)

    const { data: createdTool, error } = await supabase.from("tools").insert([toolData]).select().single()

    if (error) {
      console.error("Database error creating tool:", error)
      return { success: false, error: error.message }
    }

    // If a download URL was provided, store it as a primary Download link for this tool
    if (download_url && String(download_url).trim()) {
      const linkPayload = {
        entity_type: "tool",
        entity_id: createdTool.id,
        name: "Download",
        url: String(download_url).trim(),
        link_type: "download",
        is_primary: true,
        display_order: 0,
      }

      const { error: linkErr } = await supabase.from("links").insert([linkPayload])
      if (linkErr) {
        // Keep tool creation successful even if link creation fails
        console.warn("Warning: failed to create download link for tool:", linkErr)
      }
    }

    console.log("Tool created successfully:", createdTool)
    revalidatePath("/admin/tools")
    return { success: true, data: createdTool }
  } catch (error: any) {
    console.error("Error in createTool:", error)
    return { success: false, error: error.message || "Failed to create tool" }
  }
}

export async function updateTool(id: string, formData: FormData) {
  try {
    console.log("Updating tool with ID:", id, "Form data:", Object.fromEntries(formData))

    const name = formData.get("name") as string
    const developer = formData.get("developer") as string
    const description = formData.get("description") as string
    const download_url = formData.get("download_url") as string | null

    if (!name?.trim()) {
      return { success: false, error: "Tool name is required" }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Only update safe columns that exist
    const toolData = {
      name: name.trim(),
      slug,
      developer: developer?.trim() || null,
      description: description?.trim() || null,
    }

    console.log("Updating tool data:", toolData)

    const { data: updatedTool, error } = await supabase.from("tools").update(toolData).eq("id", id).select().single()

    if (error) {
      console.error("Database error updating tool:", error)
      return { success: false, error: error.message }
    }

    // If a download URL was provided during update, store it as a link
    if (download_url && String(download_url).trim()) {
      const linkPayload = {
        entity_type: "tool",
        entity_id: updatedTool.id,
        name: "Download",
        url: String(download_url).trim(),
        link_type: "download",
        is_primary: true,
        display_order: 0,
      }
      const { error: linkErr } = await supabase.from("links").insert([linkPayload])
      if (linkErr) {
        console.warn("Warning: failed to create download link for tool on update:", linkErr)
      }
    }

    console.log("Tool updated successfully:", updatedTool)
    revalidatePath("/admin/tools")
    revalidatePath(`/admin/tools/${id}`)
    return { success: true, data: updatedTool }
  } catch (error: any) {
    console.error("Error in updateTool:", error)
    return { success: false, error: error.message || "Failed to update tool" }
  }
}

export async function deleteTool(id: string) {
  try {
    console.log("Deleting tool with ID:", id)

    const { error } = await supabase.from("tools").delete().eq("id", id)

    if (error) {
      console.error("Database error deleting tool:", error)
      return { success: false, error: error.message }
    }

    console.log("Tool deleted successfully")
    revalidatePath("/admin/tools")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteTool:", error)
    return { success: false, error: "Failed to delete tool" }
  }
}

// Link management actions used by LinksManager (object-based, not FormData)
type CreateLinkInput = {
  entity_type: string
  entity_id: string
  name: string
  url: string
  description?: string | null
  link_type?: string | null
  is_primary?: boolean
  display_order?: number
}

export async function createLink(input: CreateLinkInput) {
  try {
    const payload = {
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      name: input.name?.trim(),
      url: input.url?.trim(),
      description: input.description ?? null,
      link_type: input.link_type ?? "general",
      is_primary: Boolean(input.is_primary),
      display_order: Number.isFinite(input.display_order as number) ? Number(input.display_order) : 0,
    }

    const { data, error } = await supabase.from("links").insert([payload]).select().single()

    if (error) return { success: false, error: error.message }

    // Revalidate the related admin list page if applicable
    if (input.entity_type) {
      revalidatePath(`/admin/${input.entity_type}s`)
      revalidatePath(`/admin/${input.entity_type}s/${input.entity_id}`)
    }

    return { success: true, data }
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create link" }
  }
}

export async function updateLink(id: string, input: Partial<CreateLinkInput>) {
  try {
    const updatePayload: Record<string, unknown> = {}

    if (typeof input.name === "string") updatePayload.name = input.name?.trim()
    if (typeof input.url === "string") updatePayload.url = input.url?.trim()
    if (typeof input.description !== "undefined") updatePayload.description = input.description ?? null
    if (typeof input.link_type === "string") updatePayload.link_type = input.link_type || "general"
    if (typeof input.is_primary !== "undefined") updatePayload.is_primary = Boolean(input.is_primary)
    if (typeof input.display_order !== "undefined") {
      updatePayload.display_order = Number.isFinite(input.display_order as number) ? Number(input.display_order) : 0
    }

    const { data, error } = await supabase.from("links").update(updatePayload).eq("id", id).select().single()

    if (error) return { success: false, error: error.message }

    if (data?.entity_type && data?.entity_id) {
      revalidatePath(`/admin/${data.entity_type}s`)
      if (data?.entity_id) {
        revalidatePath(`/admin/${data.entity_type}s/${data.entity_id}`)
      }
    }

    return { success: true, data }
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update link" }
  }
}

export async function deleteLink(id: string) {
  try {
    // fetch entity_type/id before deleting for correct revalidation
    const { data: linkRow } = await supabase.from("links").select("entity_type, entity_id").eq("id", id).single()

    const { error } = await supabase.from("links").delete().eq("id", id)
    if (error) return { success: false, error: error.message }

    if (linkRow?.entity_type) {
      revalidatePath(`/admin/${linkRow.entity_type}s`)
      if (linkRow?.entity_id) {
        revalidatePath(`/admin/${linkRow.entity_type}s/${linkRow.entity_id}`)
      }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete link" }
  }
}
