import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface CfwApp {
  id: string
  name: string
  description: string | null
  website: string | null
  repo_url: string | null
  latest_version: string | null
  cfw_id: string
  created_at: string
}

interface CompatibleHandheld {
  id: string
  name: string
  slug: string
  manufacturer: string
  image_url: string | null
}

interface CompatibleFirmware {
  id: string
  name: string
  slug: string
  version: string | null
}

async function getCfwApp(slug: string) {
  const supabase = createServerComponentClient({ cookies })

  // Don't use .single() - handle the response manually
  const { data, error } = await supabase.from("cfw_apps").select("*").eq("slug", slug)

  if (error) {
    console.error("Database error:", error)
    return null
  }

  // Handle different cases
  if (!data || data.length === 0) {
    console.log(`No app found with slug: ${slug}`)
    return null
  }

  if (data.length > 1) {
    console.warn(`Multiple apps found with slug: ${slug}. Returning first one.`)
  }

  return data[0]
}

async function getCompatibleHandhelds(appId: string) {
  try {
    const { data, error } = await supabase
      .from("cfw_app_handheld_compatibility")
      .select("handheld_id:device_id")
      .eq("cfw_app_id", appId)

    if (error) {
      console.error("Error fetching compatible handhelds:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const handheldIds = data.map((item) => item.handheld_id)
    const { data: handhelds, error: handheldsError } = await supabase
      .from("handhelds")
      .select("id, name, slug, manufacturer, image_url")
      .in("id", handheldIds)

    if (handheldsError) {
      console.error("Error fetching handheld details:", handheldsError)
      return []
    }

    return handhelds || []
  } catch (error) {
    console.error("Error fetching compatible handhelds:", error)
    return []
  }
}

async function getCompatibleFirmware(appId: string) {
  try {
    const { data, error } = await supabase
      .from("cfw_app_firmware_compatibility")
      .select("custom_firmware_id")
      .eq("cfw_app_id", appId)

    if (error) {
      console.error("Error fetching compatible firmware:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const firmwareIds = data.map((item) => item.custom_firmware_id)
    const { data: firmware, error: firmwareError } = await supabase
      .from("custom_firmware")
      .select("id, name, slug, version")
      .in("id", firmwareIds)

    if (firmwareError) {
      console.error("Error fetching firmware details:", firmwareError)
      return firmware || []
    }

    return firmware || []
  } catch (error) {
    console.error("Error fetching compatible firmware:", error)
    return []
  }
}

export default async function CfwAppDetailPage({ params }: { params: { slug: string } }) {
  const app = await getCfwApp(params.slug)

  if (!app) {
    notFound()
  }

  const [compatibleHandhelds, compatibleFirmware] = await Promise.all([
    getCompatibleHandhelds(app.id),
    getCompatibleFirmware(app.id),
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              {app.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{app.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {app.latest_version && (
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                    📦 v{app.latest_version}
                  </Badge>
                )}
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  📅 Added {new Date(app.created_at).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex gap-3">
                {app.website && (
                  <Button asChild>
                    <a href={app.website} target="_blank" rel="noopener noreferrer">
                      🔗 Visit Website
                    </a>
                  </Button>
                )}
                {app.repo_url && (
                  <Button variant="outline" asChild>
                    <a href={app.repo_url} target="_blank" rel="noopener noreferrer">
                      📂 View Repository
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/cfw-apps">📦 Back to Apps</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {app.description && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">ℹ️ Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{app.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Compatible Handhelds */}
            {compatibleHandhelds.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">📱 Compatible Handhelds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {compatibleHandhelds.map((handheld: CompatibleHandheld) => (
                      <div
                        key={handheld.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {handheld.image_url ? (
                          <Image
                            src={handheld.image_url || "/placeholder.svg"}
                            alt={handheld.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {handheld.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/handhelds/${handheld.slug}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {handheld.name}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{handheld.manufacturer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatible Firmware */}
            {compatibleFirmware.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">🖥️ Compatible Firmware</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {compatibleFirmware.map((firmware: CompatibleFirmware) => (
                      <div
                        key={firmware.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {firmware.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/custom-firmware/${firmware.slug}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {firmware.name}
                          </Link>
                          {firmware.version && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">v{firmware.version}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* App Info */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.latest_version && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Latest Version</h4>
                    <p className="text-gray-600 dark:text-gray-300">v{app.latest_version}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Added</h4>
                  <p className="text-gray-600 dark:text-gray-300">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                {(compatibleHandhelds.length > 0 || compatibleFirmware.length > 0) && (
                  <>
                    {compatibleHandhelds.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Compatible Handhelds</h4>
                        <p className="text-gray-600 dark:text-gray-300">{compatibleHandhelds.length} devices</p>
                      </div>
                    )}
                    {compatibleFirmware.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Compatible Firmware</h4>
                        <p className="text-gray-600 dark:text-gray-300">{compatibleFirmware.length} versions</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.website && (
                  <Button className="w-full" asChild>
                    <a href={app.website} target="_blank" rel="noopener noreferrer">
                      🔗 Visit Website
                    </a>
                  </Button>
                )}
                {app.repo_url && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={app.repo_url} target="_blank" rel="noopener noreferrer">
                      📂 View Repository
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300 bg-transparent"
                  asChild
                >
                  <Link href="/cfw-apps">📦 Browse More Apps</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
