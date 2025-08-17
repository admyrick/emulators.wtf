import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Download, FileText, Github, ExternalLink, Gamepad2, AlertCircle, Package } from "lucide-react"

interface CustomFirmware {
  id: string
  name: string
  slug: string
  description: string
  version: string
  release_date: string
  download_url: string
  documentation_url: string
  source_code_url: string
  license: string
  installation_difficulty: string
  features: string | string[]
  requirements: string | string[]
  created_at: string
  updated_at: string
}

interface CompatibleHandheld {
  id: string
  compatibility_notes: string
  handhelds: {
    id: string
    name: string
    manufacturer: string
    slug: string
    image_url: string
  }
}

interface CompatibleCfwApp {
  id: string
  compatibility_notes: string
  cfw_apps: {
    id: string
    name: string
    slug: string
    description: string
  }
}

async function getCustomFirmware(slug: string): Promise<CustomFirmware | null> {
  const { data, error } = await supabase.from("custom_firmware").select("*").eq("slug", slug).single()

  if (error || !data) {
    return null
  }

  return data
}

async function getCompatibleHandhelds(firmwareId: string): Promise<CompatibleHandheld[]> {
  const { data, error } = await supabase
    .from("handheld_custom_firmware")
    .select(`
      id,
      compatibility_notes,
      handhelds (
        id,
        name,
        manufacturer,
        slug,
        image_url
      )
    `)
    .eq("custom_firmware_id", firmwareId)

  if (error || !data) {
    return []
  }

  return data as CompatibleHandheld[]
}

async function getCompatibleCfwApps(firmwareId: string) {
  const { data, error } = await supabase
    .from("cfw_app_firmware_compatibility")
    .select(`
      id,
      compatibility_notes,
      cfw_apps (
        id,
        name,
        slug,
        description
      )
    `)
    .eq("custom_firmware_id", firmwareId)

  if (error || !data) {
    return []
  }

  return data
}

export default async function CustomFirmwarePage({ params }: { params: { slug: string } }) {
  const firmware = await getCustomFirmware(params.slug)

  if (!firmware) {
    notFound()
  }

  const [compatibleHandhelds, compatibleCfwApps] = await Promise.all([
    getCompatibleHandhelds(firmware.id),
    getCompatibleCfwApps(firmware.id),
  ])

  const ensureArray = (value: string | string[] | null | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === "string") {
      // Try to parse as JSON first, fallback to comma-separated
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : [value]
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }
    }
    return []
  }

  const featuresArray = ensureArray(firmware.features)
  const requirementsArray = ensureArray(firmware.requirements)

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-orange-100 text-orange-800",
    expert: "bg-red-100 text-red-800",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/custom-firmware" className="hover:text-primary">
              Custom Firmware
            </Link>
            <span>•</span>
            <span>{firmware.name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{firmware.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              v{firmware.version}
            </Badge>
            <Badge
              className={`${
                difficultyColors[firmware.installation_difficulty as keyof typeof difficultyColors] ||
                difficultyColors.intermediate
              }`}
            >
              {firmware.installation_difficulty}
            </Badge>
            {firmware.release_date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(firmware.release_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{firmware.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {firmware.download_url && (
            <Button asChild>
              <Link href={firmware.download_url} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Link>
            </Button>
          )}
          {firmware.documentation_url && (
            <Button variant="outline" asChild>
              <Link href={firmware.documentation_url} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </Link>
            </Button>
          )}
          {firmware.source_code_url && (
            <Button variant="outline" asChild>
              <Link href={firmware.source_code_url} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Source Code
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            {featuresArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {featuresArray.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {requirementsArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {requirementsArray.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                        <span>{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatible Handhelds */}
            {compatibleHandhelds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Compatible Handhelds
                  </CardTitle>
                  <CardDescription>Devices that support this custom firmware</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compatibleHandhelds.map((compatible) => (
                      <div key={compatible.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <Link
                              href={`/handhelds/${compatible.handhelds.slug}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {compatible.handhelds.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{compatible.handhelds.manufacturer}</p>
                          </div>
                        </div>
                        {compatible.compatibility_notes && (
                          <p className="text-sm text-muted-foreground mb-2">{compatible.compatibility_notes}</p>
                        )}
                        <Link
                          href={`/handhelds/${compatible.handhelds.slug}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatible CFW Apps */}
            {compatibleCfwApps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Compatible CFW Apps
                  </CardTitle>
                  <CardDescription>Applications that work with this custom firmware</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compatibleCfwApps.map((compatible) => (
                      <div key={compatible.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {compatible.cfw_apps.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/cfw-apps/${compatible.cfw_apps.slug}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {compatible.cfw_apps.name}
                            </Link>
                            {compatible.cfw_apps.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {compatible.cfw_apps.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {compatible.compatibility_notes && (
                          <p className="text-sm text-muted-foreground mb-2">{compatible.compatibility_notes}</p>
                        )}
                        <Link
                          href={`/cfw-apps/${compatible.cfw_apps.slug}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View App
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Version</h4>
                  <p className="text-sm text-muted-foreground">{firmware.version}</p>
                </div>
                {firmware.license && (
                  <div>
                    <h4 className="font-semibold mb-1">License</h4>
                    <p className="text-sm text-muted-foreground">{firmware.license}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-1">Installation Difficulty</h4>
                  <Badge
                    className={`${
                      difficultyColors[firmware.installation_difficulty as keyof typeof difficultyColors] ||
                      difficultyColors.intermediate
                    }`}
                  >
                    {firmware.installation_difficulty}
                  </Badge>
                </div>
                {firmware.release_date && (
                  <div>
                    <h4 className="font-semibold mb-1">Release Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(firmware.release_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(compatibleHandhelds.length > 0 || compatibleCfwApps.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {compatibleHandhelds.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{compatibleHandhelds.length}</div>
                      <div className="text-sm text-muted-foreground">Compatible Devices</div>
                    </div>
                  )}
                  {compatibleCfwApps.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{compatibleCfwApps.length}</div>
                      <div className="text-sm text-muted-foreground">Compatible Apps</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
