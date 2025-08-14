"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function testConnection() {
  try {
    const { data, error } = await supabase.from("emulators").select("id, name").limit(1)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export function ConnectionTest() {
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["connection-test"],
    queryFn: testConnection,
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Connection"}
        </Button>

        {result && (
          <div className={`p-3 rounded ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {result.success ? (
              <div>
                <p>✅ Connection successful!</p>
                <p>Found {result.data?.length || 0} emulators</p>
              </div>
            ) : (
              <div>
                <p>❌ Connection failed:</p>
                <p className="text-sm">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
