"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const MenuIcon = () => <span>☰</span>
const HomeIcon = () => <span>🏠</span>
const MonitorIcon = () => <span>🖥️</span>
const Gamepad2Icon = () => <span>🎮</span>
const JoystickIcon = () => <span>🕹️</span>
const WrenchIcon = () => <span>🔧</span>
const SmartphoneIcon = () => <span>📱</span>
const SettingsIcon = () => <span>⚙️</span>
const FileTextIcon = () => <span>📄</span>
const ChevronLeftIcon = () => <span>◀</span>
const ChevronRightIcon = () => <span>▶</span>
const CpuIcon = () => <span>💻</span>
const PackageIcon = () => <span>📦</span>

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Consoles", href: "/admin/consoles", icon: MonitorIcon },
  { name: "Emulators", href: "/admin/emulators", icon: Gamepad2Icon },
  { name: "Games", href: "/admin/games", icon: JoystickIcon },
  { name: "Tools", href: "/admin/tools", icon: WrenchIcon },
  { name: "Handhelds", href: "/admin/handhelds", icon: SmartphoneIcon },
  { name: "Custom Firmware", href: "/admin/custom-firmware", icon: CpuIcon },
  { name: "CFW Apps", href: "/admin/cfw-apps", icon: PackageIcon },
  { name: "Setups", href: "/admin/setups", icon: () => <span>🔧</span> },
  { name: "Presets", href: "/admin/presets", icon: () => <span>📦</span> },
  { name: "Logs", href: "/admin/logs", icon: FileTextIcon },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Emulators.wtf</h2>
                  <p className="text-sm text-muted-foreground">Admin Panel</p>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                            )}
                          >
                            <Icon />
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden lg:flex">
        {/* Desktop sidebar */}
        <div className="relative">
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300",
              sidebarCollapsed ? "w-16" : "w-64",
            )}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b">
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-lg font-semibold">Emulators.wtf</h2>
                  <p className="text-sm text-muted-foreground">Admin Panel</p>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-full flex justify-center">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">E</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          sidebarCollapsed && "justify-center",
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon />
                        {!sidebarCollapsed && <span>{item.name}</span>}

                        {/* Tooltip for collapsed state */}
                        {sidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Collapse button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 -right-4 z-50 h-8 w-8 rounded-full shadow-md bg-background border"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </Button>
        </div>

        {/* Main content */}
        <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
          <main className="p-6">{children}</main>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
