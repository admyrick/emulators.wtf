import type { Metadata } from "next"
import NewCfwAppForm from "./NewCfwAppForm"

export const metadata: Metadata = {
  title: "Create CFW App - Admin",
  description: "Create a new custom firmware application",
}

export default function NewCfwAppPage() {
  return <NewCfwAppForm />
}
