import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading swarms data...</p>
      </div>
    </div>
  )
}

