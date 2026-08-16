import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone, CalendarCheck } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/site";

export function FloatingActions() {
  return (
    <>
      {/* Floating WhatsApp button — all screens */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed right-4 bottom-20 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105 sm:bottom-6"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </a>

      {/* Sticky action bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-2 backdrop-blur sm:hidden">
        <div className="flex gap-2">
          <a
            href={telHref}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-input text-sm font-semibold text-foreground"
          >
            <Phone className="size-4" aria-hidden="true" /> Call
          </a>
          <Link
            to="/book"
            className="bg-accent-gradient flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-semibold text-primary-foreground shadow-[var(--shadow-cta)]"
          >
            <CalendarCheck className="size-4" aria-hidden="true" /> Book Your Lesson
          </Link>
        </div>
      </div>
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </>
  );
}
