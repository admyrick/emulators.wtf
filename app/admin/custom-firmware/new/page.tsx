import { Suspense } from "react"
import NewCustomFirmwareForm from "./NewCustomFirmwareForm"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function NewCustomFirmwarePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NewCustomFirmwareForm />
    </Suspense>
  )
}
