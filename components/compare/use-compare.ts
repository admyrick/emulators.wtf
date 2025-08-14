"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const STORAGE_KEY = "compare.handhelds"

function readStorage(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[] | { id: string }[]
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed as string[]
    if (Array.isArray(parsed)) return (parsed as { id: string }[]).map((x) => x.id)
    return []
  } catch {
    return []
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent("compare:update", { detail: ids }))
  } catch (error) {
    console.error("Failed to write to localStorage:", error)
  }
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    const initialIds = readStorage()
    setIds(initialIds)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    isUpdatingRef.current = true
    writeStorage(ids)
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 10)
  }, [ids, isInitialized])

  useEffect(() => {
    if (!isInitialized) return

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && !isUpdatingRef.current) {
        const newIds = readStorage()
        setIds(newIds)
      }
    }

    const onCustom = (e: CustomEvent) => {
      if (!isUpdatingRef.current) {
        const newIds = e.detail || readStorage()
        setIds((prev) => {
          // Avoid unnecessary updates if ids are the same
          if (JSON.stringify(prev) === JSON.stringify(newIds)) return prev
          return newIds
        })
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("compare:update", onCustom as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("compare:update", onCustom as EventListener)
    }
  }, [isInitialized])

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    })
  }, [])

  const clear = useCallback(() => {
    setIds([])
  }, [])

  const isSelected = useCallback((id: string) => ids.includes(id), [ids])

  const toQuery = useCallback(() => ids.join(","), [ids])

  return { ids, add, remove, toggle, clear, isSelected, toQuery }
}
