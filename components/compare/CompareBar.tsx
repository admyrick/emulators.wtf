"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCompare } from "./use-compare"

export default function CompareBar() {
  const { ids, clear, toQuery } = useCompare()

  if (!ids.length) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="rounded-2xl border bg-background/95 backdrop-blur px-4 py-2 shadow-lg flex items-center gap-3">
        <span className="text-sm">
          Selected for compare: <strong>{ids.length}</strong>
        </span>
        <Button asChild size="sm">
          <Link href={`/compare?ids=${toQuery()}`}>Compare</Link>
        </Button>
        <Button size="icon" variant="ghost" onClick={clear} aria-label="Clear compare selection">
          <span className="text-lg">×</span>
        </Button>
      </div>
    </div>
  )
}
