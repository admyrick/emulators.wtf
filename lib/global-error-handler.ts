import { logger } from "./supabase-logger"

// Global error handler for unhandled promise rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    logger.logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      type: "unhandledrejection",
      reason: event.reason,
      promise: event.promise,
    })
  })

  // Global error handler for uncaught exceptions
  window.addEventListener("error", (event) => {
    logger.logError(event.error || new Error(event.message), {
      type: "uncaughtexception",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}

// For Node.js environment (server-side)
if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason, promise) => {
    logger.logError(new Error(`Unhandled Promise Rejection: ${reason}`), {
      type: "unhandledrejection",
      reason,
      promise,
    })
  })

  process.on("uncaughtException", (error) => {
    logger.logError(error, {
      type: "uncaughtexception",
    })
  })
}
