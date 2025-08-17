"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
// import { Menu, Search, Gamepad2 } from 'lucide-react'

const Menu = () => <span className="text-lg">☰</span>
const Search = ({ className }: { className?: string }) => <span className={className}>🔍</span>
const Gamepad2 = ({ className }: { className?: string }) => <span className={className}>🎮</span>

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const navigation = [
    { name: "Emulators", href: "/emulators" },
    { name: "Games", href: "/games" },
    { name: "Tools", href: "/tools" },
    { name: "Handhelds", href: "/handhelds" },
    { name: "Custom Firmware", href: "/custom-firmware" },
    { name: "Setups", href: "/setups" },
  ]

  const handleMouseEnter = (dropdownName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(dropdownName)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150) // 150ms delay before closing
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Emulators.wtf</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              if (item.name === "Emulators") {
                return (
                  <div
                    key="Emulators"
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("Emulators")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link href="/emulators" className="text-slate-300 hover:text-white transition-colors duration-200">
                      Emulators
                    </Link>
                    {activeDropdown === "Emulators" && (
                      <div
                        className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50"
                        onMouseEnter={() => handleMouseEnter("Emulators")}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href="/emulators"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          All Emulators
                        </Link>
                        <Link
                          href="/consoles"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          Consoles
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }

              if (item.name === "Handhelds") {
                return (
                  <div
                    key="Handhelds"
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("Handhelds")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link href="/handhelds" className="text-slate-300 hover:text-white transition-colors duration-200">
                      Handhelds
                    </Link>
                    {activeDropdown === "Handhelds" && (
                      <div
                        className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50"
                        onMouseEnter={() => handleMouseEnter("Handhelds")}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href="/handhelds"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          All Handhelds
                        </Link>
                        <Link
                          href="/compare"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          Compare
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }

              if (item.name === "Custom Firmware") {
                return (
                  <div
                    key="Custom Firmware"
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("Custom Firmware")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/custom-firmware"
                      className="text-slate-300 hover:text-white transition-colors duration-200"
                    >
                      Custom Firmware
                    </Link>
                    {activeDropdown === "Custom Firmware" && (
                      <div
                        className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50"
                        onMouseEnter={() => handleMouseEnter("Custom Firmware")}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href="/custom-firmware"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          All Custom Firmware
                        </Link>
                        <Link
                          href="/cfw-apps"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          CFW Apps
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }

              if (item.name === "Setups") {
                return (
                  <div
                    key="Setups"
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("Setups")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link href="/setups" className="text-slate-300 hover:text-white transition-colors duration-200">
                      Setups
                    </Link>
                    {activeDropdown === "Setups" && (
                      <div
                        className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50"
                        onMouseEnter={() => handleMouseEnter("Setups")}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href="/setups"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          Setup Guides
                        </Link>
                        <Link
                          href="/preset-builder"
                          className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          Preset Builder
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
            <ThemeToggle />

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-slate-900 border-slate-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    if (item.name === "Emulators") {
                      return (
                        <div key="Emulators" className="flex flex-col">
                          <Link
                            href="/emulators"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-lg"
                          >
                            Emulators
                          </Link>
                          <Link
                            href="/consoles"
                            onClick={() => setIsOpen(false)}
                            className="ml-4 mt-1 text-slate-300/80 hover:text-white transition-colors duration-200 text-base"
                          >
                            Consoles
                          </Link>
                        </div>
                      )
                    }

                    if (item.name === "Handhelds") {
                      return (
                        <div key="Handhelds" className="flex flex-col">
                          <Link
                            href="/handhelds"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-lg"
                          >
                            Handhelds
                          </Link>
                          <Link
                            href="/compare"
                            onClick={() => setIsOpen(false)}
                            className="ml-4 mt-1 text-slate-300/80 hover:text-white transition-colors duration-200 text-base"
                          >
                            Compare
                          </Link>
                        </div>
                      )
                    }

                    if (item.name === "Custom Firmware") {
                      return (
                        <div key="Custom Firmware" className="flex flex-col">
                          <Link
                            href="/custom-firmware"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-lg"
                          >
                            Custom Firmware
                          </Link>
                          <Link
                            href="/cfw-apps"
                            onClick={() => setIsOpen(false)}
                            className="ml-4 mt-1 text-slate-300/80 hover:text-white transition-colors duration-200 text-base"
                          >
                            CFW Apps
                          </Link>
                        </div>
                      )
                    }

                    if (item.name === "Setups") {
                      return (
                        <div key="Setups" className="flex flex-col">
                          <Link
                            href="/setups"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-lg"
                          >
                            Setups
                          </Link>
                          <Link
                            href="/preset-builder"
                            onClick={() => setIsOpen(false)}
                            className="ml-4 mt-1 text-slate-300/80 hover:text-white transition-colors duration-200 text-base"
                          >
                            Preset Builder
                          </Link>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-slate-300 hover:text-white transition-colors duration-200 text-lg"
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
