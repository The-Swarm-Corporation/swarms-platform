import { cn } from "@/shared/utils/cn";

interface SeparatorProps {
  text: string;
  className?: string;
}

export default function Separator({ text, className }: SeparatorProps) {
  return (
    <div className="relative">
      <div className={cn("relative flex items-center py-1", className)}>
        <div className="grow border-t border-zinc-700"></div>
        {text && <span className="mx-3 shrink text-sm leading-8 text-zinc-500">
          {text}
        </span>}
        <div className="grow border-t border-zinc-700"></div>
      </div>
    </div>
  );
}
