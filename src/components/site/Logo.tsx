import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png.asset.json";


export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.name} home`}
      className={cn("group flex items-center gap-3", className)}
    >
      <img
        src={logoAsset.url}
        alt=""
        className="h-11 w-auto rounded-xl shadow-[var(--shadow-card)] transition-transform group-hover:scale-105"
        loading="eager"
        decoding="async"
      />
      <span className="flex flex-col leading-none">

        <span
          className={cn(
            "font-display text-[0.95rem] font-extrabold tracking-tight sm:text-[1.05rem]",
            onDark ? "text-primary-foreground" : "text-foreground",
          )}
        >
          LAXMI <span className="text-accent">DRIVING</span> TRAINING
        </span>
        <span
          className={cn(
            "mt-1 text-[0.62rem] font-semibold tracking-[0.22em]",
            onDark ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {site.domain}
        </span>
      </span>
    </Link>
  );
}
