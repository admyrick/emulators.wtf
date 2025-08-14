import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { AddToCompareButton } from "@/components/compare/AddToCompareButton"

interface Handheld {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  description: string | null
  image_url: string | null
  price_range: string | null
  release_year: number | null
  screen_size: string | null
  cpu: string | null
  ram: string | null
  internal_storage: string | null
  battery_life: string | null
  weight: string | null
  dimensions: string | null
  key_features: string[] | null
  created_at: string
  updated_at: string
}

interface HandheldCardProps {
  handheld: Handheld
}

export function HandheldCard({ handheld }: HandheldCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group relative">
      <CardHeader className="p-0">
        <Link href={`/handheld/${handheld.slug}`} className="block">
          <div className="aspect-video relative bg-muted rounded-t-lg overflow-hidden">
            <Image
              src={handheld.image_url || "/placeholder.svg?height=200&width=300"}
              alt={handheld.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-10">
          <AddToCompareButton handheldId={handheld.id} />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-3">
          <Link href={`/handheld/${handheld.slug}`}>
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors cursor-pointer">
              {handheld.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{handheld.manufacturer}</span>
            {handheld.release_year && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <span>📅</span>
                {handheld.release_year}
              </Badge>
            )}
          </div>
        </div>

        {handheld.price_range && (
          <div className="mb-3">
            <Badge variant="outline" className="text-sm font-medium">
              {handheld.price_range}
            </Badge>
          </div>
        )}

        {handheld.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{handheld.description}</p>
        )}

        <div className="space-y-2 mb-3">
          {handheld.screen_size && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🖥️</span>
              <span className="truncate">{handheld.screen_size}</span>
            </div>
          )}

          {handheld.cpu && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🔧</span>
              <span className="truncate">{handheld.cpu}</span>
            </div>
          )}

          {handheld.ram && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>💾</span>
              <span className="truncate">{handheld.ram}</span>
            </div>
          )}

          {handheld.battery_life && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🔋</span>
              <span className="truncate">{handheld.battery_life}</span>
            </div>
          )}

          {handheld.weight && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⚖️</span>
              <span className="truncate">{handheld.weight}</span>
            </div>
          )}
        </div>

        {handheld.key_features && handheld.key_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {handheld.key_features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {handheld.key_features.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{handheld.key_features.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <Link href={`/handheld/${handheld.slug}`} className="text-sm text-primary hover:text-primary/80 font-medium">
            View Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
