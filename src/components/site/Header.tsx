import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  Phone,
  X,
  CalendarCheck,
  Handshake,
  ChevronDown,
  ShieldCheck,
  MessageSquareQuote,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { navLinks, site, telHref } from "@/lib/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Primary links for laptop and desktop
const primaryNav = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/car-training", label: "Car Training" },
  { to: "/bike-training", label: "Bike Training" },
  { to: "/instructors", label: "Instructors" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

// Secondary links under "More"
const moreNav = [
  { to: "/safety-rules", label: "Safety Rules", icon: ShieldCheck },
  { to: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin", label: "Admin Portal", icon: Lock },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur-md">
      {/* Top helpline bar for laptop & desktop */}
      <div className="hidden bg-primary text-primary-foreground lg:block">
        <div className="container-page flex h-8 items-center justify-between text-xs">
          <p className="font-medium tracking-wide">{site.tagline}</p>
          <a href={telHref} className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="size-3" aria-hidden="true" />
            Helpline: {site.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-2 xl:gap-4">
        {/* Text Logo with official emblem */}
        <Logo className="shrink-0" />

        {/* Laptop & Desktop Navigation (visible on lg: 1024px and above) */}
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
          {primaryNav.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary bg-primary-soft font-bold" }}
              className="rounded-full px-2 py-1 text-xs xl:px-2.5 xl:py-1.5 xl:text-[0.82rem] font-semibold text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-0.5 rounded-full px-2 py-1 text-xs xl:px-2.5 xl:py-1.5 xl:text-[0.82rem] font-semibold text-muted-foreground transition-colors hover:text-primary outline-none cursor-pointer">
              <span>More</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 p-1.5 rounded-xl shadow-lg border border-border bg-background"
            >
              {moreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.to} asChild className="rounded-lg cursor-pointer">
                    <Link
                      to={item.to}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                    >
                      <Icon className="size-4 text-primary" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Action Buttons: Both "Become a Partner" and "Book Your Lesson" share matching CTA styling */}
        <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Become a Partner CTA */}
          <Button
            asChild
            variant="cta"
            size="sm"
            className="hidden md:inline-flex px-3 xl:px-4 text-xs xl:text-sm font-bold shadow-sm"
          >
            <Link to="/partner">
              <Handshake className="size-3.5" aria-hidden="true" />
              <span>Become a Partner</span>
            </Link>
          </Button>

          {/* Book Your Lesson CTA */}
          <Button
            asChild
            variant="cta"
            size="sm"
            className="hidden sm:inline-flex px-3 xl:px-4 text-xs xl:text-sm font-bold shadow-sm"
          >
            <Link to="/book">
              <CalendarCheck className="size-3.5" aria-hidden="true" />
              <span>Book Your Lesson</span>
            </Link>
          </Button>

          {/* Mobile hamburger menu button (< lg) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="animate-fade-in border-t border-border bg-background lg:hidden shadow-xl"
        >
          <nav aria-label="Mobile navigation" className="container-page grid gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-primary bg-primary-soft font-bold" }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <Button asChild variant="cta" className="text-xs">
                <Link to="/partner" onClick={() => setOpen(false)}>
                  <Handshake className="size-3.5" /> Partner
                </Link>
              </Button>
              <Button asChild variant="cta" className="text-xs">
                <Link to="/book" onClick={() => setOpen(false)}>
                  <CalendarCheck className="size-3.5" /> Book Lesson
                </Link>
              </Button>
            </div>
            <div className="mt-2">
              <Button asChild variant="outline" className="w-full text-xs">
                <a href={telHref}>
                  <Phone className="size-3.5" aria-hidden="true" /> Call {site.phoneDisplay}
                </a>
              </Button>
            </div>
            <div className="mt-2 text-center pt-1 border-t border-border/50">
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 py-1 font-medium"
              >
                <Lock className="size-3" /> Staff / Admin Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
