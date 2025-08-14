import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Check database connection using admin client
    const { data, error } = await supabaseAdmin.from("consoles").select("id").limit(1)

    if (error) throw error

    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      tablesCount: data ? data.length : 0,
    })
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
