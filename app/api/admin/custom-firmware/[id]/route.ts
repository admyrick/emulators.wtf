import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { id } = params

    console.log("Updating custom firmware:", id, data)

    // Generate slug from name if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const updateData = {
      name: data.name,
      slug,
      description: data.description || null,
      version: data.version || null,
      release_date: data.release_date || null,
      download_url: data.download_url || null,
      documentation_url: data.documentation_url || null,
      source_code_url: data.source_code_url || null,
      license: data.license || null,
      installation_difficulty: data.installation_difficulty || null,
      features: data.features && data.features.length > 0 ? data.features : null,
      requirements: data.requirements && data.requirements.length > 0 ? data.requirements : null,
      updated_at: new Date().toISOString(),
    }

    const { data: result, error } = await supabaseAdmin
      .from("custom_firmware")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("Custom firmware updated successfully:", result)

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
