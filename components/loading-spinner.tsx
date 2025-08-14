import { Icons } from "@/components/icons/fallback-icons"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("animate-spin flex items-center justify-center", sizeClasses[size], className)}>
      <Icons.Loader2 />
    </div>
  )
}
