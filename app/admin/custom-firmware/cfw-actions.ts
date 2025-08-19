// cfw-actions.ts - Custom Firmware database actions

import { supabase } from "@/lib/supabase"

// Define the CustomFirmware type with all fields
export interface CustomFirmware {
  id: number
  name: string
  slug: string
  description?: string
  version?: string
  compatibility?: string[] | any  // Can be JSONB array or structured data
  features?: string[] | any
  supported_devices?: string[] | any
  installation_guide?: string
  download_url?: string
  official_website?: string
  is_active?: boolean
  release_date?: string
  changelog?: string
  requirements?: string[] | any
  tags?: string[]
  image_url?: string
  created_at?: string
  updated_at?: string
}

// Input type for creating/updating custom firmware
export interface CustomFirmwareInput {
  name: string
  slug: string
  description?: string
  version?: string
  compatibility?: string[] | any
  features?: string[] | any
  supported_devices?: string[] | any
  installation_guide?: string
  download_url?: string
  official_website?: string
  is_active?: boolean
  release_date?: string
  changelog?: string
  requirements?: string[] | any
  tags?: string[]
  image_url?: string
}

// Create a new custom firmware entry
export async function createCustomFirmware(input: CustomFirmwareInput) {
  try {
    // Ensure compatibility is properly formatted for JSONB
    const formattedInput = {
      ...input,
      compatibility: input.compatibility || [],
      features: input.features || [],
      supported_devices: input.supported_devices || [],
      requirements: input.requirements || [],
      tags: input.tags || [],
      is_active: input.is_active !== undefined ? input.is_active : true
    }

    const { data, error } = await supabase
      .from('custom_firmware')
      .insert(formattedInput)
      .select()
      .single()

    if (error) {
      console.error('Error creating custom firmware:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createCustomFirmware:', error)
    return { data: null, error }
  }
}

// Update an existing custom firmware entry
export async function updateCustomFirmware(id: number, input: Partial<CustomFirmwareInput>) {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating custom firmware:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateCustomFirmware:', error)
    return { data: null, error }
  }
}

// Get all custom firmware entries
export async function getAllCustomFirmware() {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching custom firmware:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllCustomFirmware:', error)
    return []
  }
}

// Get active custom firmware entries
export async function getActiveCustomFirmware() {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching active custom firmware:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveCustomFirmware:', error)
    return []
  }
}

// Get custom firmware by slug
export async function getCustomFirmwareBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching custom firmware by slug:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getCustomFirmwareBySlug:', error)
    return null
  }
}

// Get custom firmware by ID
export async function getCustomFirmwareById(id: number) {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching custom firmware by ID:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getCustomFirmwareById:', error)
    return null
  }
}

// Delete custom firmware
export async function deleteCustomFirmware(id: number) {
  try {
    const { error } = await supabase
      .from('custom_firmware')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting custom firmware:', error)
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteCustomFirmware:', error)
    return { success: false, error }
  }
}

// Search custom firmware
export async function searchCustomFirmware(query: string) {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching custom firmware:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in searchCustomFirmware:', error)
    return []
  }
}

// Get custom firmware for specific devices
export async function getCustomFirmwareForDevice(device: string) {
  try {
    const { data, error } = await supabase
      .from('custom_firmware')
      .select('*')
      .contains('compatibility', [device])
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching custom firmware for device:', error)
      // Try alternative query if the contains operator fails
      const { data: altData, error: altError } = await supabase
        .from('custom_firmware')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      if (altError) throw altError
      
      // Filter in JavaScript if database query doesn't support contains
      return (altData || []).filter(cfw => {
        if (Array.isArray(cfw.compatibility)) {
          return cfw.compatibility.includes(device)
        }
        return false
      })
    }

    return data || []
  } catch (error) {
    console.error('Error in getCustomFirmwareForDevice:', error)
    return []
  }
}

// Utility function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Validate custom firmware input
export function validateCustomFirmwareInput(input: CustomFirmwareInput): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!input.name || input.name.trim().length === 0) {
    errors.push('Name is required')
  }

  if (!input.slug || input.slug.trim().length === 0) {
    errors.push('Slug is required')
  } else if (!/^[a-z0-9-]+$/.test(input.slug)) {
    errors.push('Slug must only contain lowercase letters, numbers, and hyphens')
  }

  if (input.download_url && !isValidUrl(input.download_url)) {
    errors.push('Download URL must be a valid URL')
  }

  if (input.official_website && !isValidUrl(input.official_website)) {
    errors.push('Official website must be a valid URL')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
