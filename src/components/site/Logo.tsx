import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png.asset.json";


export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.name} home`}
      className={cn("group flex items-center", className)}
    >
      <img
        src={logoAsset.url}
        alt="Laxmi Driving Training logo"
        className={cn(
          "h-12 w-auto rounded-xl transition-transform duration-300 group-hover:scale-105",
          onDark ? "bg-white" : "shadow-[var(--shadow-card)]",
        )}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

