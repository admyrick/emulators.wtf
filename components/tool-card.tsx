import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface Tool {
  id: string
  name: string
  developer?: string
  price?: string
  description?: string
  category?: string[]
  supported_platforms?: string[]
  features?: string[]
  image_url?: string
  slug: string
}

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tool/${tool.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md">
            <Image
              src={tool.image_url || "/placeholder.svg?height=200&width=300"}
              alt={tool.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {tool.developer && (
              <Badge variant="secondary" className="text-xs">
                {tool.developer}
              </Badge>
            )}
            {tool.price && (
              <Badge variant={tool.price === "Free" ? "default" : "outline"} className="text-xs">
                {tool.price}
              </Badge>
            )}
          </div>
          {tool.description && <p className="text-sm text-muted-foreground line-clamp-3">{tool.description}</p>}
          {tool.category && tool.category.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {Array.isArray(tool.category) &&
                tool.category.slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              {tool.category.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.category.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default ToolCard
