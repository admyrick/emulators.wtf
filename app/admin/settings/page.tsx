"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Shield, Globe, Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Site settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: "emulators.wtf",
    siteDescription: "Your ultimate destination for emulation resources and community knowledge",
    contactEmail: "contact@emulators.wtf",
    maintenanceMode: false,
  })

  // Database settings (read-only display)
  const dbSettings = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured",
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd save these to a database or config file
      // For now, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved successfully",
        description: "Your changes have been applied.",
      })
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const result = await response.json()

      if (result.status === "healthy") {
        toast({
          title: "Database connection successful",
          description: "All systems are operational.",
        })
      } else {
        throw new Error(result.error || "Connection failed")
      }
    } catch (error) {
      toast({
        title: "Database connection failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and configuration</p>
      </div>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={siteSettings.siteDescription}
              onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Supabase URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={dbSettings.supabaseUrl} readOnly className="bg-muted" />
                {dbSettings.supabaseUrl !== "Not configured" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div>
              <Label>API Keys Status</Label>
              <div className="flex gap-2 mt-1">
                <Badge variant={dbSettings.hasAnonKey ? "default" : "destructive"}>
                  Anon Key: {dbSettings.hasAnonKey ? "✓" : "✗"}
                </Badge>
                <Badge variant={dbSettings.hasServiceKey ? "default" : "destructive"}>
                  Service Key: {dbSettings.hasServiceKey ? "✓" : "✗"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testDatabaseConnection} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Test Connection
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Database configuration is managed through environment variables.</p>
            <p>Make sure your .env file contains the required Supabase credentials.</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Row Level Security (RLS)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Enabled</Badge>
                <span className="text-sm text-muted-foreground">Database tables are protected with RLS policies</span>
              </div>
            </div>
            <div>
              <Label>Public Access</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Read Only</Badge>
                <span className="text-sm text-muted-foreground">Public users can only read data</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Admin Access</h4>
            <p className="text-sm text-muted-foreground">
              Admin functions use the service role key for full database access. Keep your service role key secure and
              never expose it in client-side code.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Framework</Label>
              <p className="text-sm font-mono">Next.js 14</p>
            </div>
            <div>
              <Label>Database</Label>
              <p className="text-sm font-mono">Supabase (PostgreSQL)</p>
            </div>
            <div>
              <Label>Deployment</Label>
              <p className="text-sm font-mono">Vercel</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
