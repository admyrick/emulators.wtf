"use client"

import React from "react"
import { logger } from "@/lib/supabase-logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons/fallback-icons"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Supabase
    logger.logError(error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <span className="h-5 w-5 flex items-center justify-center">
                  <Icons.AlertTriangle />
                </span>
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} className="flex-1">
                  <span className="h-4 w-4 mr-2 flex items-center justify-center">
                    <Icons.RefreshCw />
                  </span>
                  Reload Page
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
                  Go Home
                </Button>
              </div>
              {process.env.NEXT_PUBLIC_NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">Error Details (Development)</summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{this.state.error.stack}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
