import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: As = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "animate-fade-up max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      )}
      <As
        className={cn(
          "font-display font-extrabold text-balance text-foreground",
          As === "h1" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl lg:text-4xl",
        )}
      >
        {title}
      </As>
      {description && (
        <p className="text-[0.98rem] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-hero-gradient relative overflow-hidden text-primary-foreground">
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-16 size-72 rounded-full bg-accent/25 blur-3xl"
      />
      <div className="container-page relative py-14 md:py-20">
        <div className="animate-fade-up max-w-3xl space-y-4">
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
          <h1 className="font-display text-3xl font-extrabold text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-primary-foreground/85">
            {description}
          </p>
          {children && <div className="flex flex-wrap gap-3 pt-2">{children}</div>}
        </div>
      </div>
    </section>
  );
}
