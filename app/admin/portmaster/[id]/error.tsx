// app/admin/portmaster/[id]/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('[PortMaster Edit] route error:', error)
  }, [error])

  return (
    <div className="container mx-auto max-w-xl py-20 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="opacity-80">{error.message || 'Unknown error'}</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="secondary"><Link href="/admin/portmaster">Back to Admin</Link></Button>
      </div>
    </div>
  )
}
