// app/admin/portmaster/[id]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-xl py-20 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Port not found</h1>
      <p className="opacity-80">We couldn’t find that PortMaster entry. It may have been deleted or the URL is incorrect.</p>
      <div className="flex gap-3 justify-center">
        <Button asChild><Link href="/admin/portmaster">Back to Admin</Link></Button>
        <Button asChild variant="secondary"><Link href="/portmaster">View Public List</Link></Button>
      </div>
    </div>
  )
}
