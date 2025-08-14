import { supabase } from "./supabase"

export const logger = {
  async logError(error: Error, context?: any) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context: context ? JSON.stringify(context) : null,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== "undefined" ? window.navigator.userAgent : null,
        url: typeof window !== "undefined" ? window.location.href : null,
      }

      await supabase.from("error_logs").insert(errorData)

      // Also log to console in development
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.error("🔴 Error logged:", error.message, context)
      }
    } catch (logError) {
      // Fallback to console if logging fails
      console.error("Failed to log error to Supabase:", logError)
      console.error("Original error:", error)
    }
  },

  async logInfo(message: string, data?: any) {
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      console.log(`ℹ️ ${message}`, data)
    }

    // Log to Supabase in production for monitoring
    if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
      try {
        await supabase.from("app_logs").insert({
          level: "info",
          message,
          data: data ? JSON.stringify(data) : null,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Failed to log info to Supabase:", error)
      }
    }
  },

  async logWarning(message: string, data?: any) {
    console.warn(`⚠️ ${message}`, data)

    try {
      await supabase.from("app_logs").insert({
        level: "warn",
        message,
        data: data ? JSON.stringify(data) : null,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to log warning to Supabase:", error)
    }
  },

  // Helper method for API route errors
  async logApiError(req: any, error: Error, endpoint: string) {
    const context = {
      endpoint,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      userAgent: req.headers?.["user-agent"],
    }

    await this.logError(error, context)
  },
}
