import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { navLinks, site, telHref, whatsappHref } from "@/lib/site";

export function Footer() {
  const socials = [
    { key: "facebook", href: site.social.facebook, Icon: Facebook, label: "Facebook" },
    { key: "instagram", href: site.social.instagram, Icon: Instagram, label: "Instagram" },
    { key: "youtube", href: site.social.youtube, Icon: Youtube, label: "YouTube" },
  ];

  return (
    <footer className="mt-auto bg-primary-dark text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo onDark />
          <p className="max-w-xs text-sm text-primary-foreground/75">
            Simple, patient and safe driving training for cars, motorcycles and scooters. Learn with
            confidence — one class at a time.
          </p>
          <div className="flex gap-2">
            {socials.filter(({ href }) => Boolean(href)).map(({ key, href, Icon, label }) => (
              <a
                key={key}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-xl border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer navigation" className="space-y-3">
          <h2 className="font-display text-sm font-bold tracking-widest uppercase">Quick Links</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm text-primary-foreground/80 md:grid-cols-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/book" className="font-semibold text-accent">
                Book a Lesson
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold tracking-widest uppercase">Contact</h2>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {site.offices.map((o) => (
                  <span key={o.label} className="block">
                    <span className="font-semibold text-primary-foreground">{o.label}:</span>{" "}
                    {o.line1}, {o.line2}, {o.state} – {o.pincode}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <a href={telHref} className="hover:text-accent">
                {site.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <a href={`mailto:${site.email}`} className="hover:text-accent">
                {site.email}
              </a>
            </li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-accent">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold tracking-widest uppercase">Timings</h2>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            {site.hours.map((h) => (
              <li key={h.days} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-primary-foreground">{h.days}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.wordmark}. All rights reserved.
          </p>
          <p>{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}
