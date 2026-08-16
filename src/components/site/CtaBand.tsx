import { Link } from "@tanstack/react-router";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ctaTrack from "@/assets/cta-track.jpg";
import { site, telHref, whatsappHref } from "@/lib/site";

export function CtaBand({
  title = "Ready to sit in the driver's seat?",
  description = "Book your first lesson today. Tell us your preferred day and time — we will confirm your batch on call.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={ctaTrack}
        alt="Empty driving practice track with lane markings and orange cones at sunrise"
        loading="lazy"
        width={1920}
        height={800}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="bg-hero-gradient absolute inset-0 -z-10 opacity-90" aria-hidden="true" />
      <div className="container-page py-16 text-center text-primary-foreground md:py-20">
        <h2 className="font-display mx-auto max-w-2xl text-2xl font-extrabold text-balance sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="cta" size="xl">
            <Link to="/book">
              <CalendarCheck aria-hidden="true" /> Book Your Lesson
            </Link>
          </Button>
          <Button asChild variant="onDark" size="xl">
            <a href={telHref}>
              <Phone aria-hidden="true" /> Call {site.phoneDisplay}
            </a>
          </Button>
          <Button asChild variant="outlineOnDark" size="xl">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
