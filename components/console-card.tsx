import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface Console {
  id: string
  name: string
  manufacturer?: string
  release_year?: number
  description?: string
  image_url?: string
  slug: string
}

interface ConsoleCardProps {
  console: Console
}

export function ConsoleCard({ console }: ConsoleCardProps) {
  return (
    <Link href={`/console/${console.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md">
            <Image
              src={console.image_url || "/placeholder.svg?height=200&width=300"}
              alt={console.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {console.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {console.manufacturer && (
              <Badge variant="secondary" className="text-xs">
                {console.manufacturer}
              </Badge>
            )}
            {console.release_year && (
              <Badge variant="outline" className="text-xs">
                {console.release_year}
              </Badge>
            )}
          </div>
          {console.description && <p className="text-sm text-muted-foreground line-clamp-3">{console.description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}
