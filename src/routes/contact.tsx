import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { site, telHref, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Contact Laxmi Driving Training by phone, WhatsApp or e-mail for driving class timings, fees and batch availability. Visit our training office.",
      },
      { property: "og:title", content: "Contact Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Call, WhatsApp or e-mail us for class timings, fees and batch details.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Talk to Us About Your Driving Classes"
        description="Call, WhatsApp or visit our office. We will explain the courses, fees and timings in simple words."
      >
        <Button asChild variant="cta" size="lg">
          <a href={telHref}>
            <Phone aria-hidden="true" /> Call {site.phoneDisplay}
          </a>
        </Button>
        <Button asChild variant="onDark" size="lg">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" /> WhatsApp Us
          </a>
        </Button>
      </PageHero>

      <section className="section-y">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <SectionHeading align="left" eyebrow="Reach us" title="Contact details" />
            <ul className="grid gap-4">
              <ContactRow Icon={MapPin} title="Our offices">
                {site.offices.map((o) => (
                  <span key={o.label} className="mt-1 block first:mt-0">
                    <span className="font-semibold text-foreground">{o.label}:</span>{" "}
                    {o.line1}, {o.line2}, {o.state} – {o.pincode}
                  </span>
                ))}
              </ContactRow>
              <ContactRow Icon={Phone} title="Phone">
                <a href={telHref} className="hover:text-primary">
                  {site.phoneDisplay}
                </a>
              </ContactRow>
              <ContactRow Icon={Mail} title="E-mail">
                <a href={`mailto:${site.email}`} className="hover:text-primary">
                  {site.email}
                </a>
              </ContactRow>
              <ContactRow Icon={Clock} title="Timings">
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </ContactRow>
            </ul>
            <Button asChild variant="cta" size="lg">
              <Link to="/book">
                <CalendarCheck aria-hidden="true" /> Book Your Lesson
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            <SectionHeading align="left" eyebrow="Location" title="Find us on the map" />
            {site.mapEmbedUrl ? (
              <iframe
                title={`Map showing the location of ${site.name}`}
                src={site.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full rounded-2xl border border-border shadow-[var(--shadow-card)]"
              />
            ) : (
              <div className="card-surface grid h-80 place-items-center bg-muted/60 p-6 text-center">
                <div className="space-y-2">
                  <MapPin className="mx-auto size-8 text-primary" aria-hidden="true" />
                  <p className="font-display text-base font-bold">Google Map placeholder</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    To show your location here, open Google Maps, search your address, choose Share →
                    Embed a map, copy the link and paste it into{" "}
                    <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                      mapEmbedUrl
                    </code>{" "}
                    in <code className="rounded bg-background px-1.5 py-0.5 text-xs">src/lib/site.ts</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  Icon,
  title,
  children,
}: {
  Icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="card-surface flex gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-sm font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
