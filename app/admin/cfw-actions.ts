"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCfwAction(formData: FormData) {
  const supabase = createClient()

  const name = formData.get("name") as string
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const cfwData = {
    name,
    slug,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    release_date: (formData.get("release_date") as string) || null,
    download_url: (formData.get("download_url") as string) || null,
    documentation_url: (formData.get("documentation_url") as string) || null,
    source_code_url: (formData.get("source_code_url") as string) || null,
    license: (formData.get("license") as string) || null,
    installation_difficulty: (formData.get("installation_difficulty") as string) || "intermediate",
    features: formData.get("features")
      ? (formData.get("features") as string)
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : [],
    requirements: formData.get("requirements")
      ? (formData.get("requirements") as string)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [],
  }

  const { data, error } = await supabase.from("custom_firmware").insert(cfwData).select().single()

  if (error) {
    throw new Error(`Failed to create custom firmware: ${error.message}`)
  }

  revalidatePath("/admin/custom-firmware")
  revalidatePath("/custom-firmware")
  redirect(`/admin/custom-firmware/${data.id}`)
}

export async function updateCfwAction(formData: FormData) {
  const supabase = createClient()
  const id = formData.get("id") as string

  const name = formData.get("name") as string
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const updateData = {
    name,
    slug,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    release_date: (formData.get("release_date") as string) || null,
    download_url: (formData.get("download_url") as string) || null,
    documentation_url: (formData.get("documentation_url") as string) || null,
    source_code_url: (formData.get("source_code_url") as string) || null,
    license: (formData.get("license") as string) || null,
    installation_difficulty: (formData.get("installation_difficulty") as string) || "intermediate",
    features: formData.get("features")
      ? (formData.get("features") as string)
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : [],
    requirements: formData.get("requirements")
      ? (formData.get("requirements") as string)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [],
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("custom_firmware").update(updateData).eq("id", id)

  if (error) {
    throw new Error(`Failed to update custom firmware: ${error.message}`)
  }

  revalidatePath("/admin/custom-firmware")
  revalidatePath(`/admin/custom-firmware/${id}`)
  revalidatePath("/custom-firmware")
}

export async function deleteCfwAction(id: string) {
  const supabase = createClient()

  // Delete compatible handhelds first (cascade should handle this, but being explicit)
  await supabase.from("handheld_custom_firmware").delete().eq("custom_firmware_id", id)

  const { error } = await supabase.from("custom_firmware").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete custom firmware: ${error.message}`)
  }

  revalidatePath("/admin/custom-firmware")
  revalidatePath("/custom-firmware")
}

export async function addCfwCompatibleHandheld(formData: FormData) {
  const supabase = createClient()
  const customFirmwareId = formData.get("custom_firmware_id") as string
  const handheldId = formData.get("handheld_id") as string
  const compatibilityNotes = formData.get("compatibility_notes") as string

  if (!handheldId) {
    throw new Error("Please select a handheld")
  }

  // Verify the handheld exists
  const { data: handheld, error: handheldError } = await supabase
    .from("handhelds")
    .select("id")
    .eq("id", handheldId)
    .single()

  if (handheldError || !handheld) {
    throw new Error("Selected handheld does not exist")
  }

  // Check if relationship already exists
  const { data: existing } = await supabase
    .from("handheld_custom_firmware")
    .select("id")
    .eq("custom_firmware_id", customFirmwareId)
    .eq("device_id", handheldId)
    .single()

  if (existing) {
    throw new Error("This handheld is already added as compatible")
  }

  const { error } = await supabase.from("handheld_custom_firmware").insert({
    custom_firmware_id: customFirmwareId,
    device_id: handheldId,
    compatibility_notes: compatibilityNotes || null,
  })

  if (error) {
    throw new Error(`Failed to add compatible handheld: ${error.message}`)
  }

  revalidatePath(`/admin/custom-firmware/${customFirmwareId}`)
  revalidatePath("/custom-firmware")
}

export async function removeCfwCompatibleHandheld(relationshipId: string, customFirmwareId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("handheld_custom_firmware").delete().eq("id", relationshipId)

  if (error) {
    throw new Error(`Failed to remove compatible handheld: ${error.message}`)
  }

  revalidatePath(`/admin/custom-firmware/${customFirmwareId}`)
  revalidatePath("/custom-firmware")
}
