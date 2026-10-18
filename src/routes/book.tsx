import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { BookingForm, type BookingValues } from "@/components/site/BookingForm";
import { LessonPayment } from "@/components/site/LessonPayment";
import { site, telHref, whatsappHref } from "@/lib/site";

type VehicleSearch = { vehicle?: BookingValues["vehicleType"] };

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): VehicleSearch => {
    const v = search["vehicle"];
    return v === "Car" || v === "Bike" || v === "Scooter" || v === "Motorcycle" || v === "Auto"
      ? { vehicle: v === "Motorcycle" ? "Bike" : (v as BookingValues["vehicleType"]) }
      : {};
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Book a Driving Lesson — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Book your car, bike or scooter driving lesson online. Choose your vehicle, experience level, preferred date and time — we confirm your batch on call.",
      },
      { property: "og:title", content: "Book a Driving Lesson — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Fill a short form and we will call you to confirm your driving class.",
      },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

function BookPage() {
  const { vehicle } = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="Book a lesson"
        title="Book Your Driving Lesson"
        description="Fill this short form. Our team will call you to confirm your batch, timing and fees. All fields marked * are required."
      >
        <Button asChild variant="onDark" size="lg">
          <a href={telHref}>
            <Phone aria-hidden="true" /> Call {site.phoneDisplay}
          </a>
        </Button>
        <Button asChild variant="outlineOnDark" size="lg">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" /> WhatsApp
          </a>
        </Button>
      </PageHero>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <SectionHeading align="left" eyebrow="Booking form" title="Tell us your details" />
            <BookingForm {...(vehicle ? { defaultVehicle: vehicle } : {})} />
          </div>

          <aside className="space-y-5">
            <LessonPayment />
            <div className="card-surface space-y-4 p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-bold">What happens next?</h2>
              <ol className="grid gap-3 text-sm text-muted-foreground">
                <li>1. You send this form.</li>
                <li>2. We call you on your mobile number to confirm the batch and timing.</li>
                <li>
                  3. Pay the agreed fees or advance online via Razorpay, or pay at our office.
                </li>
                <li>4. Instant digital receipt issued and we confirm your first class date.</li>
              </ol>
            </div>
            <div className="card-surface space-y-2 bg-accent-soft p-6 text-sm">
              <p className="font-display font-bold">Need help right now?</p>
              <p className="text-muted-foreground">
                Call {site.phoneDisplay} or message us on WhatsApp during working hours and we will
                guide you.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
