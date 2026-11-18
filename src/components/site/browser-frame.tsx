import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-hairline bg-surface",
        "shadow-[0_32px_96px_-32px_rgba(0,0,0,0.85)]",
        "transition-shadow duration-300 ease-out",
        className,
      )}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-3 border-b border-hairline bg-surface-2 px-3 py-2 sm:px-4">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate rounded-sm bg-background/50 px-2 py-1 text-center font-mono text-[10px] tracking-wide text-muted-foreground/80 sm:text-[11px]">
            {url}
          </p>
        </div>
        <div className="hidden w-12 shrink-0 sm:block" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
