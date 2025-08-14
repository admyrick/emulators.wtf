"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error)
  }, [error])

  return (
    <html>
      <body className="bg-slate-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-300">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="text-left bg-slate-700 p-3 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Development Error Details:</p>
                  <pre className="text-xs text-red-400 whitespace-pre-wrap break-words">{error.message}</pre>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={reset} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
