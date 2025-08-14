"use server"

import { createTool as createToolAction, updateTool, deleteTool } from "@/app/admin/actions"

// Re-export the tool actions from the main actions file
export const createTool = createToolAction
export { updateTool, deleteTool }
