import HeroSection from "@/components/hero-section"
import StatsSection from "@/components/stats-section"
import FeaturedConsoles from "@/components/featured-consoles"
import FeaturedHandhelds from "@/components/featured-handhelds"
import FeaturedEmulators from "@/components/featured-emulators"
import FeaturedCustomFirmware from "@/components/featured-custom-firmware"
import FeaturedTools from "@/components/featured-tools"
import RecentAdditions from "@/components/recent-additions"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturedConsoles />
      <FeaturedHandhelds />
      <FeaturedEmulators />
      <FeaturedCustomFirmware />
      <FeaturedTools />
      <RecentAdditions />
    </div>
  )
}
