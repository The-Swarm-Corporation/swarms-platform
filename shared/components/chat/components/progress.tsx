import { cn } from "@/shared/utils/cn"
import { motion } from "framer-motion"

interface ProgressBarProps {
  progress: number;
  className?: string  
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-zinc-950/80 rounded-full h-1 overflow-hidden border border-red-600/20", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="h-full bg-red-500/50"
      />
    </div>
  )
}

