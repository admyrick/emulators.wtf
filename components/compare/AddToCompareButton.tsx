// components/compare/AddToCompareButton.tsx
"use client"

import { useCompare } from "./use-compare"
import { Button } from "@/components/ui/button"
import { GitCompare, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"

type Props = {
  handheldId: string
  className?: string
  label?: boolean // show text instead of just icon
}

export function AddToCompareButton({ handheldId, className, label = false }: Props) {
  const { toggle, isSelected } = useCompare()
  const selected = isSelected(handheldId)

  return (
    <Button
      size={label ? "sm" : "icon"}
      variant={selected ? "secondary" : "outline"}
      className={cn(label ? "" : "rounded-full", className)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(handheldId)
      }}
      aria-pressed={selected}
      aria-label={selected ? "Remove from compare" : "Add to compare"}
      title={selected ? "Remove from compare" : "Add to compare"}
    >
      {label ? (
        <span className="inline-flex items-center gap-2">
          {selected ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
          {selected ? "Added" : "Add to Compare"}
        </span>
      ) : selected ? (
        <Check className="h-4 w-4" />
      ) : (
        <GitCompare className="h-4 w-4" />
      )}
    </Button>
  )
}
