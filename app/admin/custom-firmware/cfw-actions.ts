"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function createCustomFirmware(formData: FormData) {
  try {
    console.log("Creating custom firmware with data:", Object.fromEntries(formData.entries()))

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const version = formData.get("version") as string
    const release_date = formData.get("release_date") as string
    const slug =
      (formData.get("slug") as string) ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    const download_url = formData.get("download_url") as string
    const documentation_url = formData.get("documentation_url") as string
    const source_code_url = formData.get("source_code_url") as string
    const license = formData.get("license") as string
    const installation_difficulty = formData.get("installation_difficulty") as string
    const image_url = formData.get("image_url") as string

    // Parse features and requirements
    let features: string[] = []
    let requirements: string[] = []

    try {
      const featuresStr = formData.get("features") as string
      const requirementsStr = formData.get("requirements") as string

      if (featuresStr) {
        features = JSON.parse(featuresStr)
      }
      if (requirementsStr) {
        requirements = JSON.parse(requirementsStr)
      }
    } catch (parseError) {
      console.error("Error parsing features/requirements:", parseError)
    }

    const insertData = {
      name,
      description: description || null,
      version: version || null,
      release_date: release_date || null,
      slug,
      download_url: download_url || null,
      documentation_url: documentation_url || null,
      source_code_url: source_code_url || null,
      license: license || null,
      installation_difficulty: installation_difficulty || null,
      image_url: image_url || null,
      features: features.length > 0 ? features : null,
      requirements: requirements.length > 0 ? requirements : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting custom firmware data:", insertData)

    const { data, error } = await supabaseAdmin.from("custom_firmware").insert([insertData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message }
    }

    console.log("Custom firmware created successfully:", data)

    revalidatePath("/admin/custom-firmware")
    revalidatePath("/custom-firmware")
    return { success: true, data }
  } catch (error: any) {
    console.error("Custom firmware creation error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateCustomFirmware(id: string, updateData: any) {
  try {
    console.log("Updating custom firmware:", id, updateData)

    const { data, error } = await supabaseAdmin
      .from("custom_firmware")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message }
    }

    console.log("Custom firmware updated successfully:", data)

    revalidatePath("/admin/custom-firmware")
    revalidatePath("/custom-firmware")
    revalidatePath(`/custom-firmware/${data.slug}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Custom firmware update error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCustomFirmware(id: string) {
  try {
    // First delete all compatible handheld relationships
    await supabaseAdmin.from("cfw_compatible_handhelds").delete().eq("custom_firmware_id", id)

    // Then delete the custom firmware
    const { error } = await supabaseAdmin.from("custom_firmware").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/custom-firmware")
    revalidatePath("/custom-firmware")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addCfwCompatibleHandheld(
  customFirmwareId: string,
  handheldId: string,
  compatibilityNotes?: string
) {
  try {
    if (!handheldId) {
      return { success: false, error: "Please select a handheld" }
    }

    // Check if relationship already exists
    const { data: existing } = await supabaseAdmin
      .from("cfw_compatible_handhelds")
      .select("id")
      .eq("custom_firmware_id", customFirmwareId)
      .eq("handheld_id", handheldId)
      .single()

    if (existing) {
      return { success: false, error: "This handheld is already added as compatible" }
    }

    const { data, error } = await supabaseAdmin
      .from("cfw_compatible_handhelds")
      .insert([
        {
          custom_firmware_id: customFirmwareId,
          handheld_id: handheldId,
          compatibility_notes: compatibilityNotes || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/custom-firmware/${customFirmwareId}`)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeCfwCompatibleHandheld(relationshipId: string, customFirmwareId: string) {
  try {
    const { error } = await supabaseAdmin.from("cfw_compatible_handhelds").delete().eq("id", relationshipId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/custom-firmware/${customFirmwareId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCompatibleHandhelds(customFirmwareId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("cfw_compatible_handhelds")
      .select(`
        id,
        compatibility_notes,
        handhelds (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq("custom_firmware_id", customFirmwareId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAllHandhelds() {
  try {
    const { data, error } = await supabaseAdmin.from("handhelds").select("id, name, slug, manufacturer").order("name")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
