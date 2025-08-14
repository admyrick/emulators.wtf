"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminHandheldsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Keep local logging to help diagnose route-scoped issues.
    console.error("Admin Handhelds route error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-300">
            There was an issue loading or updating this handheld. Please try again, or go back to the list.
          </p>

          <details className="text-left bg-slate-700 p-3 rounded-lg">
            <summary className="cursor-pointer text-sm text-slate-200">Show error details</summary>
            <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap break-words">
              {error?.message || "Unknown error"}
            </pre>
            {error?.digest && (
              <div className="mt-2 text-[10px] text-slate-400">Digest: {error.digest}</div>
            )}
          </details>

          <div className="flex gap-3 justify-center">
            <Button onClick={reset} className="bg-purple-600 hover:bg-purple-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Link href="/admin/handhelds">
                <Home className="w-4 h-4 mr-2" />
                Back to Handhelds
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
