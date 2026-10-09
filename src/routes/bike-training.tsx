import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CourseCard } from "@/components/site/CourseCard";
import { CtaBand } from "@/components/site/CtaBand";
import heroBike from "@/assets/hero-bike.jpg";
import scooterImg from "@/assets/scooter-training.jpg";
import { courses, telHref } from "@/lib/site";

export const Route = createFileRoute("/bike-training")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Bike & Scooter Training — Motorcycle Riding Classes | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Motorcycle and scooter riding classes for beginners and advanced riders. Balance, gears, safe braking and traffic riding with patient instructors.",
      },
      { property: "og:title", content: "Bike & Scooter Training — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Learn geared motorcycle and scooter riding safely, step by step.",
      },
      { property: "og:url", content: "/bike-training" },
    ],
    links: [{ rel: "canonical", href: "/bike-training" }],
  }),
  component: BikeTraining,
});

function BikeTraining() {
  const twoWheeler = courses.filter((c) => c.vehicle === "Motorcycle" || c.vehicle === "Scooter");

  return (
    <>
      <PageHero
        eyebrow="Bike & scooter training"
        title="Motorcycle and Scooter Riding Classes"
        description="Balance first, then control, then the road. Our riders learn on light, easy-to-handle vehicles with full safety guidance."
      >
        <Button asChild variant="cta" size="lg">
          <Link to="/book" search={{ vehicle: "Bike" }}>
            <CalendarCheck aria-hidden="true" /> Book Bike Lesson
          </Link>
        </Button>
        <Button asChild variant="outlineOnDark" size="lg">
          <a href={telHref}>
            <Phone aria-hidden="true" /> Call to Ask
          </a>
        </Button>
      </PageHero>

      <section className="section-y">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <img
            src={heroBike}
            alt="Motorcycle rider in helmet and protective jacket practising slow-speed control between orange cones"
            loading="lazy"
            width={1408}
            height={1008}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
          <div className="space-y-5">
            <SectionHeading
              align="left"
              eyebrow="What you will learn"
              title="Skills for safe daily riding"
            />
            <ul className="grid gap-3 text-sm">
              {[
                "Balance and slow-speed control",
                "Clutch and gear shifting on geared bikes",
                "Smooth start and safe stopping",
                "Front and rear brake use together",
                "Cone practice and figure-of-eight",
                "Turning, U-turns and narrow lanes",
                "Helmet, gear and traffic discipline",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-muted/60 section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="Courses" title="Motorcycle & scooter courses" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {twoWheeler.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-primary-soft/60">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading
              align="left"
              eyebrow="Ladies batches"
              title="Scooter classes for first-time riders"
              description="Special slow-paced batches for students, homemakers and working women. A lady instructor can be arranged on request — just mention it while booking."
            />
            <Button asChild variant="cta" size="lg">
              <Link to="/book" search={{ vehicle: "Scooter" }}>
                Book Scooter Lesson
              </Link>
            </Button>
          </div>
          <img
            src={scooterImg}
            alt="Woman in a helmet riding a white scooter on a calm tree-lined street during a training class"
            loading="lazy"
            width={1200}
            height={900}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
        </div>
      </section>

      <CtaBand title="Ride with confidence — start this week" />
    </>
  );
}
