import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink, Download, Calendar, Tag, Info, Smartphone, Cpu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

interface CfwApp {
  id: string
  slug: string
  app_name: string
  description: string | null
  category: string | null
  app_type: string | null
  image_url: string | null
  requirements: string | null
  installation_notes: string | null
  app_url: string | null
  last_updated: string | null
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
  image_url: string | null
}

async function getCfwApp(slug: string) {
  try {
    const { data, error } = await supabase.from("cfw_apps").select("*").eq("slug", slug).single()

    if (error) {
      console.error("Error fetching CFW app:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching CFW app:", error)
    return null
  }
}

async function getCompatibleHandhelds(appId: string) {
  try {
    const { data, error } = await supabase
      .from("cfw_app_handheld_compatibility")
      .select(
        `
        handhelds (
          id,
          name,
          slug,
          manufacturer,
          image_url
        )
      `,
      )
      .eq("cfw_app_id", appId)

    if (error) {
      console.error("Error fetching compatible handhelds:", error)
      return []
    }

    return data?.map((item: any) => item.handhelds).filter(Boolean) || []
  } catch (error) {
    console.error("Error fetching compatible handhelds:", error)
    return []
  }
}

async function getCompatibleFirmware(appId: string) {
  try {
    const { data, error } = await supabase
      .from("cfw_app_firmware_compatibility")
      .select(
        `
        custom_firmware (
          id,
          name,
          slug,
          version,
          image_url
        )
      `,
      )
      .eq("cfw_app_id", appId)

    if (error) {
      console.error("Error fetching compatible firmware:", error)
      return []
    }

    return data?.map((item: any) => item.custom_firmware).filter(Boolean) || []
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
            {app.image_url ? (
              <Image
                src={app.image_url || "/placeholder.svg"}
                alt={app.app_name}
                width={96}
                height={96}
                className="rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {app.app_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{app.app_name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {app.category && (
                  <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                    <Tag className="w-3 h-3 mr-1" />
                    {app.category}
                  </Badge>
                )}
                {app.app_type && (
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                    {app.app_type}
                  </Badge>
                )}
                {app.last_updated && (
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated {new Date(app.last_updated).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                {app.app_url && (
                  <Button asChild>
                    <a href={app.app_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit App
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/cfw-apps">
                    <Package className="w-4 h-4 mr-2" />
                    Back to Apps
                  </Link>
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
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Info className="w-5 h-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{app.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {app.requirements && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Package className="w-5 h-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{app.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Installation Notes */}
            {app.installation_notes && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Download className="w-5 h-5" />
                    Installation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{app.installation_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Compatible Handhelds */}
            {compatibleHandhelds.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Smartphone className="w-5 h-5" />
                    Compatible Handhelds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {compatibleHandhelds.map((handheld: CompatibleHandheld) => (
                      <div
                        key={handheld.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                            href={`/handheld/${handheld.slug}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
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
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Cpu className="w-5 h-5" />
                    Compatible Firmware
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {compatibleFirmware.map((firmware: CompatibleFirmware) => (
                      <div
                        key={firmware.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        {firmware.image_url ? (
                          <Image
                            src={firmware.image_url || "/placeholder.svg"}
                            alt={firmware.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {firmware.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/custom-firmware/${firmware.slug}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
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
                {app.category && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Category</h4>
                    <p className="text-gray-600 dark:text-gray-300">{app.category}</p>
                  </div>
                )}
                {app.app_type && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Type</h4>
                    <p className="text-gray-600 dark:text-gray-300">{app.app_type}</p>
                  </div>
                )}
                {app.last_updated && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Last Updated</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {new Date(app.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Added</h4>
                  <p className="text-gray-600 dark:text-gray-300">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.app_url && (
                  <Button className="w-full" asChild>
                    <a href={app.app_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit App Page
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300 bg-transparent"
                  asChild
                >
                  <Link href="/cfw-apps">
                    <Package className="w-4 h-4 mr-2" />
                    Browse More Apps
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
