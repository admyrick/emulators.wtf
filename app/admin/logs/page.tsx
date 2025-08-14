"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Info, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"

async function getErrorLogs(limit = 50) {
  const { data, error } = await supabase
    .from("error_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

async function getAppLogs(level?: string, limit = 50) {
  let query = supabase.from("app_logs").select("*").order("timestamp", { ascending: false }).limit(limit)

  if (level) {
    query = query.eq("level", level)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export default function AdminLogsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: errorLogs, isLoading: errorLoading } = useQuery({
    queryKey: ["error-logs", refreshKey],
    queryFn: () => getErrorLogs(),
  })

  const { data: appLogs, isLoading: appLoading } = useQuery({
    queryKey: ["app-logs", refreshKey],
    queryFn: () => getAppLogs(),
  })

  const { data: warningLogs } = useQuery({
    queryKey: ["warning-logs", refreshKey],
    queryFn: () => getAppLogs("warn"),
  })

  const refresh = () => setRefreshKey((prev) => prev + 1)

  const LogLevelIcon = ({ level }: { level: string }) => {
    switch (level) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warn":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Logs</h1>
          <p className="text-muted-foreground">Monitor errors and application activity</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorLogs?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningLogs?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{appLogs?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="w-full">
        <TabsList>
          <TabsTrigger value="errors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Errors ({errorLogs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">
            <Info className="h-4 w-4 mr-2" />
            All Logs ({appLogs?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {errorLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : errorLogs && errorLogs.length > 0 ? (
            <div className="space-y-4">
              {errorLogs.map((log) => (
                <Card key={log.id} className="border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{log.message}</span>
                      </div>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                  </CardHeader>
                  <CardContent>
                    {log.url && (
                      <div className="text-sm mb-2">
                        <strong>URL:</strong> {log.url}
                      </div>
                    )}
                    {log.context && (
                      <details className="mb-2">
                        <summary className="cursor-pointer text-sm font-medium">Context</summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(JSON.parse(log.context), null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.stack && (
                      <details>
                        <summary className="cursor-pointer text-sm font-medium">Stack Trace</summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{log.stack}</pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No errors logged yet. That's good news! 🎉</div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {appLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : appLogs && appLogs.length > 0 ? (
            <div className="space-y-4">
              {appLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LogLevelIcon level={log.level} />
                        <span className="font-medium">{log.message}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.level === "error" ? "destructive" : log.level === "warn" ? "secondary" : "default"
                          }
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {log.data && (
                      <details>
                        <summary className="cursor-pointer text-sm font-medium">Data</summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(JSON.parse(log.data), null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No logs available yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
