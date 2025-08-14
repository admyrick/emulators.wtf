import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import CompareBar from "@/components/compare/CompareBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Emulators.wtf - The Ultimate Emulation Database",
  description: "Discover emulators, games, tools, and handhelds for retro gaming. Your complete guide to emulation.",
  keywords: ["emulation", "retro gaming", "emulators", "roms", "gaming handhelds", "custom firmware"],
  authors: [{ name: "Emulators.wtf Team" }],
  creator: "Emulators.wtf",
  publisher: "Emulators.wtf",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-900 text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ErrorBoundary>
            <Providers>
              <div className="flex min-h-screen flex-col bg-slate-900">
                <Header />
                <main className="flex-1 bg-slate-900">{children}</main>
                <Footer />
                <CompareBar />
              </div>
              <Toaster />
            </Providers>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
