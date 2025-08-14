import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface EmulatorCardProps {
  emulator: {
    id: string
    name: string
    developer: string | null
    description: string | null
    supported_platforms: string[] | null
    features: string[] | null
    image_url: string | null
    slug: string
    recommended: boolean | null
    last_updated: string | null
  }
}

export function EmulatorCard({ emulator }: EmulatorCardProps) {
  return (
    <Link href={`/emulator/${emulator.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full bg-slate-850 border-slate-700">
        <CardHeader className="pb-3">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md">
            <Image
              src={
                emulator.image_url || "/placeholder.svg?height=200&width=300&text=" + encodeURIComponent(emulator.name)
              }
              alt={emulator.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-400 transition-colors text-white">
            {emulator.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {emulator.developer && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                {emulator.developer}
              </Badge>
            )}
            <Badge variant="default" className="text-xs bg-purple-600 text-white">
              Free
            </Badge>
            {emulator.recommended && <Badge className="text-xs bg-yellow-500 text-black">Recommended</Badge>}
          </div>
          {emulator.description && <p className="text-sm text-slate-300 line-clamp-3 mb-3">{emulator.description}</p>}
          {emulator.supported_platforms && emulator.supported_platforms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {emulator.supported_platforms.slice(0, 2).map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {platform}
                </Badge>
              ))}
              {emulator.supported_platforms.length > 2 && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  +{emulator.supported_platforms.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
