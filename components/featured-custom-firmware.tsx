import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, ArrowRight, Wifi, Bluetooth, Palette, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CustomFirmware {
  id: string
  slug: string
  name: string
  description: string | null
  version: string | null
  image_url: string | null
  wifi: boolean | null
  bluetooth: boolean | null
  themes: boolean | null
  performance_modes: boolean | null
  installation_difficulty: string | null
  last_updated: string | null
}

async function getFeaturedCustomFirmware() {
  try {
    const { data, error } = await supabase
      .from("custom_firmware")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching custom firmware:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching custom firmware:", error)
    return []
  }
}

function CustomFirmwareCard({ firmware }: { firmware: CustomFirmware }) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 dark:bg-gray-700 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {firmware.image_url ? (
              <Image
                src={firmware.image_url || "/placeholder.svg"}
                alt={firmware.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {firmware.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/custom-firmware/${firmware.slug}`}>{firmware.name}</Link>
              </CardTitle>
              {firmware.version && (
                <p className="text-sm text-muted-foreground dark:text-gray-300">v{firmware.version}</p>
              )}
            </div>
          </div>
          {firmware.installation_difficulty && (
            <Badge className={`text-xs ${getDifficultyColor(firmware.installation_difficulty)}`}>
              {firmware.installation_difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {firmware.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{firmware.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {firmware.wifi && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
              <Wifi className="w-3 h-3 mr-1" />
              WiFi
            </Badge>
          )}
          {firmware.bluetooth && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
              <Bluetooth className="w-3 h-3 mr-1" />
              Bluetooth
            </Badge>
          )}
          {firmware.themes && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
              <Palette className="w-3 h-3 mr-1" />
              Themes
            </Badge>
          )}
          {firmware.performance_modes && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
              <Zap className="w-3 h-3 mr-1" />
              Performance
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
          asChild
        >
          <Link href={`/custom-firmware/${firmware.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function FeaturedCustomFirmware() {
  const firmware = await getFeaturedCustomFirmware()

  if (firmware.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Firmware</h2>
              <p className="text-gray-600 dark:text-gray-300">Enhanced operating systems for gaming handhelds</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            asChild
          >
            <Link href="/custom-firmware">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firmware.map((fw) => (
            <CustomFirmwareCard key={fw.id} firmware={fw} />
          ))}
        </div>
      </div>
    </section>
  )
}
