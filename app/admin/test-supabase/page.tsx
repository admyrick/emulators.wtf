import { SupabaseTest } from "@/components/supabase-test"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supabase Integration Test - Admin - Emulators.wtf",
  description: "Test Supabase database connection and handheld tables integration",
}

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Supabase Integration Test</h1>
        <p className="text-muted-foreground">
          This page tests the connection to Supabase and verifies that all handheld-related tables are properly
          configured.
        </p>
      </div>

      <SupabaseTest />
    </div>
  )
}
