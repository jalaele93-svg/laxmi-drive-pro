import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({
  onDark = false,
  className,
  showText = true,
}: {
  onDark?: boolean;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      to="/"
      aria-label={`${site.name} home`}
      className={cn("group flex items-center gap-2.5 sm:gap-3 shrink-0 select-none", className)}
    >
      <div className="relative flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Laxmi Driving Training logo"
          className={cn(
            "size-10 sm:size-11 rounded-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105",
            onDark ? "bg-white p-0.5" : "bg-background",
          )}
          loading="eager"
          decoding="async"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-display text-base sm:text-lg font-black tracking-tight transition-colors whitespace-nowrap",
              onDark ? "text-white" : "text-foreground group-hover:text-primary",
            )}
          >
            LAXMI <span className={onDark ? "text-accent" : "text-primary"}>DRIVING</span>
          </span>
          <span
            className={cn(
              "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider",
              onDark ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            Training School
          </span>
        </div>
      )}
    </Link>
  );
}
