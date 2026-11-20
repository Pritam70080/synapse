import { LoaderCircle } from "lucide-react"

type LoadingStateProps = {
  label: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({
  label,
  fullScreen = false,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-svh" : "min-h-[50vh] py-8"
      } bg-background ${className}`}
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderCircle
          className="size-4 animate-spin"
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>
      <div className="loading-progress h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div className="loading-progress-bar h-full w-1/3 rounded-full bg-primary" />
      </div>
    </div>
  )
}
