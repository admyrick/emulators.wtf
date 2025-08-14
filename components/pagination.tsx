"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  total: number
  page: number
  limit: number
}

export function Pagination({ total, page, limit }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(total / limit)
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const updateURL = (updates: { page?: number; limit?: number }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete("page")
      } else {
        params.set("page", updates.page.toString())
      }
    }

    if (updates.limit !== undefined) {
      if (updates.limit === 12) {
        params.delete("limit")
      } else {
        params.set("limit", updates.limit.toString())
      }
      // Reset to page 1 when changing limit
      params.delete("page")
    }

    const url = params.toString() ? `?${params.toString()}` : ""
    router.push(`${window.location.pathname}${url}`)
  }

  const handlePrevious = () => {
    if (page > 1) {
      updateURL({ page: page - 1 })
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      updateURL({ page: page + 1 })
    }
  }

  const handleLimitChange = (newLimit: string) => {
    updateURL({ limit: Number.parseInt(newLimit, 10) })
  }

  if (total === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-700">
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>
          Showing {startItem}–{endItem} of {total}
        </span>

        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20 h-8 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={page <= 1}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1 px-3 py-1 text-sm text-slate-300">
          Page {page} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={page >= totalPages}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
