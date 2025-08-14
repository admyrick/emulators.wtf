import { Suspense } from "react"
import { NewEmulatorForm } from "./NewEmulatorForm"

export default function NewEmulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Emulator</h1>
        <p className="text-muted-foreground">
          Add a new emulator application to the database with details about supported consoles, platforms, features, and
          developer information.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NewEmulatorForm />
      </Suspense>
    </div>
  )
}
