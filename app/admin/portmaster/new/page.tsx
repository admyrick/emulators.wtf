import PortMasterForm from "@/components/PortMasterForm"
import Link from "next/link"

export default function NewPortMasterPortPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/portmaster" className="text-purple-400 hover:text-purple-300">
          ← Back to PortMaster Ports
        </Link>
      </div>

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Add New PortMaster Port</h1>
        <PortMasterForm />
      </div>
    </div>
  )
}
