import { Link } from "@tanstack/react-router";
import helmet from "@/assets/boo-helmet.png";
import { cn } from "@/lib/utils";

export function BooLogo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="BOO home">
      <img src={helmet} alt="" width={compact ? 32 : 44} height={compact ? 32 : 44} className={compact ? "size-8" : "size-11"} />
      <span className="leading-none">
        <span className={cn("block font-display font-extrabold tracking-tight text-foreground", compact ? "text-lg" : "text-2xl")}>BOO</span>
        {!compact && <span className="mt-1 block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Health ecosystem</span>}
      </span>
    </Link>
  );
}
