export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-muted rounded animate-pulse mb-6" />

        <div className="border rounded-lg p-6 space-y-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-24 w-full bg-muted rounded animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-64 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
