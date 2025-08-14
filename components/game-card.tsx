import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface Game {
  id: string
  name: string
  release_year?: number
  description?: string
  image_url?: string
  slug: string
}

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-[3/4] relative mb-3 overflow-hidden rounded-md">
            <Image
              src={game.image_url || "/placeholder.svg?height=300&width=200"}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {game.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {game.release_year && (
              <Badge variant="outline" className="text-xs">
                {game.release_year}
              </Badge>
            )}
          </div>
          {game.description && <p className="text-sm text-muted-foreground line-clamp-3">{game.description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}
