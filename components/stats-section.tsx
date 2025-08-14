import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

const Monitor = () => <span className="text-xl">🖥️</span>
const Smartphone = () => <span className="text-xl">📱</span>
const Gamepad2 = () => <span className="text-xl">🎮</span>
const Cpu = () => <span className="text-xl">💾</span>
const Wrench = () => <span className="text-xl">🔧</span>
const Package = () => <span className="text-xl">📦</span>

async function getStats() {
  try {
    const [consoles, handhelds, emulators, firmware, tools, cfwApps] = await Promise.all([
      supabase.from("consoles").select("id", { count: "exact", head: true }),
      supabase.from("handhelds").select("id", { count: "exact", head: true }),
      supabase.from("emulators").select("id", { count: "exact", head: true }),
      supabase.from("custom_firmware").select("id", { count: "exact", head: true }),
      supabase.from("tools").select("id", { count: "exact", head: true }),
      supabase.from("cfw_apps").select("id", { count: "exact", head: true }),
    ])

    return {
      consoles: consoles.count || 0,
      handhelds: handhelds.count || 0,
      emulators: emulators.count || 0,
      firmware: firmware.count || 0,
      tools: tools.count || 0,
      cfwApps: cfwApps.count || 0,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      consoles: 0,
      handhelds: 0,
      emulators: 0,
      firmware: 0,
      tools: 0,
      cfwApps: 0,
    }
  }
}

export default async function StatsSection() {
  const stats = await getStats()

  const statItems = [
    {
      label: "Gaming Consoles",
      value: stats.consoles,
      icon: Monitor,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Gaming Handhelds",
      value: stats.handhelds,
      icon: Smartphone,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Emulators",
      value: stats.emulators,
      icon: Gamepad2,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Custom Firmware",
      value: stats.firmware,
      icon: Cpu,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      label: "Tools & Utilities",
      value: stats.tools,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "CFW Apps",
      value: stats.cfwApps,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Database Statistics</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive collection of gaming hardware, software, and tools
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.label}
                className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{item.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
