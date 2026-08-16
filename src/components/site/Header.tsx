import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { navLinks, site, telHref } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="hidden bg-primary text-primary-foreground lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p>{site.tagline}</p>
          <a href={telHref} className="flex items-center gap-2 font-semibold hover:underline">
            <Phone className="size-3.5" aria-hidden="true" />
            Call {site.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary bg-primary-soft" }}
              className="rounded-full px-3 py-2 text-[0.82rem] font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href={telHref}>
              <Phone aria-hidden="true" />
              Call Now
            </a>
          </Button>
          <Button asChild variant="cta" size="sm" className="hidden sm:inline-flex">
            <Link to="/book">
              <CalendarCheck aria-hidden="true" />
              Book Your Lesson
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-xl border border-border text-foreground xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="animate-fade-in border-t border-border bg-background xl:hidden"
        >
          <nav aria-label="Mobile navigation" className="container-page grid gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-primary bg-primary-soft" }}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <a href={telHref}>
                  <Phone aria-hidden="true" /> Call
                </a>
              </Button>
              <Button asChild variant="cta">
                <Link to="/book" onClick={() => setOpen(false)}>
                  Book Lesson
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
