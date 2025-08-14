export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  )
}
