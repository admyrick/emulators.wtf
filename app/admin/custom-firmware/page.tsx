import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Plus, ExternalLink, Download, Code, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"

interface CustomFirmware {
  id: string
  name: string
  slug: string
  description: string | null
  version: string | null
  release_date: string | null
  download_url: string | null
  source_code_url: string | null
  documentation_url: string | null
  license: string | null
  installation_difficulty: string | null
  features: string[] | null
  requirements: string[] | null
  created_at: string
  updated_at: string
}

async function checkCustomFirmwareSchema() {
  try {
    // Simple check - try to select from the table
    const { data, error } = await supabase.from("custom_firmware").select("id").limit(1)

    if (error) {
      if (error.message.includes('relation "custom_firmware" does not exist')) {
        return {
          exists: false,
          error: "Table does not exist",
          quickFix: `
-- Create the custom_firmware table
CREATE TABLE custom_firmware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  version VARCHAR(100),
  release_date DATE,
  download_url TEXT,
  source_code_url TEXT,
  documentation_url TEXT,
  license VARCHAR(100),
  installation_difficulty VARCHAR(50),
  features TEXT[],
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to custom_firmware" ON custom_firmware FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to custom_firmware" ON custom_firmware FOR ALL USING (true);`,
        }
      }
      return {
        exists: false,
        error: error.message,
        quickFix: "Please check your database connection and run the migration scripts.",
      }
    }

    return { exists: true, error: null, quickFix: null }
  } catch (error: any) {
    console.error("Schema check error:", error)
    return {
      exists: false,
      error: error.message,
      quickFix: "Please run the complete migration script: scripts/10-fix-custom-firmware-schema.sql",
    }
  }
}

async function getCustomFirmware(): Promise<{ data: CustomFirmware[]; error: string | null }> {
  try {
    const schemaCheck = await checkCustomFirmwareSchema()

    if (!schemaCheck.exists) {
      return { data: [], error: schemaCheck.error }
    }

    const { data, error } = await supabase.from("custom_firmware").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching custom firmware:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error: any) {
    console.error("Error in getCustomFirmware:", error)
    return { data: [], error: error.message }
  }
}

function CustomFirmwareCard({ firmware }: { firmware: CustomFirmware }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{firmware.name}</CardTitle>
            <CardDescription className="mt-1">{firmware.description || "No description available"}</CardDescription>
          </div>
          <div className="flex gap-2">
            {firmware.version && <Badge variant="secondary">v{firmware.version}</Badge>}
            {firmware.installation_difficulty && (
              <Badge
                variant={
                  firmware.installation_difficulty === "Easy"
                    ? "default"
                    : firmware.installation_difficulty === "Medium"
                      ? "secondary"
                      : "destructive"
                }
              >
                {firmware.installation_difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {firmware.features && firmware.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {firmware.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {firmware.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{firmware.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {firmware.license && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {firmware.license}
              </span>
            )}
            {firmware.release_date && <span>Released: {new Date(firmware.release_date).toLocaleDateString()}</span>}
          </div>

          <div className="flex items-center gap-2">
            {firmware.download_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={firmware.download_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </a>
              </Button>
            )}
            {firmware.source_code_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={firmware.source_code_url} target="_blank" rel="noopener noreferrer">
                  <Code className="h-3 w-3 mr-1" />
                  Source
                </a>
              </Button>
            )}
            {firmware.documentation_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={firmware.documentation_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Docs
                </a>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href={`/admin/custom-firmware/${firmware.id}`}>Edit</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function CustomFirmwareList() {
  const { data: firmware, error } = await getCustomFirmware()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Failed to load custom firmware: {error}</p>
          <p className="mb-2">This might be due to:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Missing database table</li>
            <li>Database connection issues</li>
            <li>Rate limiting</li>
            <li>Permission issues</li>
          </ul>
          <p className="mt-2">Please check your database connection and ensure the migration scripts have been run.</p>
        </AlertDescription>
      </Alert>
    )
  }

  if (firmware.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No custom firmware found.</p>
        <Button asChild>
          <Link href="/admin/custom-firmware/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Firmware
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {firmware.map((fw) => (
        <CustomFirmwareCard key={fw.id} firmware={fw} />
      ))}
    </div>
  )
}

export default function CustomFirmwareAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Firmware</h1>
          <p className="text-muted-foreground">Manage custom firmware for handheld gaming devices</p>
        </div>
        <Button asChild>
          <Link href="/admin/custom-firmware/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Firmware
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <CustomFirmwareList />
      </Suspense>
    </div>
  )
}
