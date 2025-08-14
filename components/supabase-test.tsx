"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export function SupabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from("handhelds").select("count").limit(1)
      if (error) throw error
      testResults.push({
        name: "Basic Connection",
        status: "success",
        message: "Successfully connected to Supabase",
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Basic Connection",
        status: "error",
        message: error.message || "Failed to connect",
      })
    }

    // Test 2: Handhelds table
    try {
      const { data, error } = await supabase.from("handhelds").select("*").limit(5)
      if (error) throw error
      testResults.push({
        name: "Handhelds Table",
        status: "success",
        message: `Found ${data?.length || 0} handhelds`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Handhelds Table",
        status: "error",
        message: error.message || "Failed to query handhelds table",
      })
    }

    // Test 3: Categories table
    try {
      const { data, error } = await supabase.from("device_categories").select("*")
      if (error) throw error
      testResults.push({
        name: "Device Categories",
        status: "success",
        message: `Found ${data?.length || 0} categories`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Device Categories",
        status: "error",
        message: error.message || "Failed to query categories table",
      })
    }

    // Test 4: Retailers table
    try {
      const { data, error } = await supabase.from("retailers").select("*")
      if (error) throw error
      testResults.push({
        name: "Retailers",
        status: "success",
        message: `Found ${data?.length || 0} retailers`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Retailers",
        status: "error",
        message: error.message || "Failed to query retailers table",
      })
    }

    // Test 5: Complex join query
    try {
      const { data, error } = await supabase
        .from("handhelds")
        .select(`
          *,
          handheld_device_categories(
            device_categories(name)
          ),
          handheld_retailers(
            retailers(name),
            price
          )
        `)
        .limit(3)

      if (error) throw error
      testResults.push({
        name: "Complex Joins",
        status: "success",
        message: `Successfully joined handheld data with ${data?.length || 0} records`,
        data: data,
      })
    } catch (error: any) {
      testResults.push({
        name: "Complex Joins",
        status: "error",
        message: error.message || "Failed to perform complex join query",
      })
    }

    setTests(testResults)
    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Passed: {successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Failed: {errorCount}</span>
              </div>
            </div>
            <Button onClick={runTests} disabled={isRunning} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running..." : "Run Tests"}
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {test.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : test.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                  {test.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View data ({Array.isArray(test.data) ? test.data.length : 1} records)
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <Badge variant={test.status === "success" ? "default" : "destructive"}>{test.status}</Badge>
              </div>
            ))}
          </div>

          {tests.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tests run yet. Click "Run Tests" to start.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Supabase URL:</span>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Missing"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Anon Key:</span>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configured" : "✗ Missing"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
