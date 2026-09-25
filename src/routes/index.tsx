import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/Section";
import { CourseCard } from "@/components/site/CourseCard";
import { CtaBand } from "@/components/site/CtaBand";
import { VehicleTrainingSlider } from "@/components/site/VehicleTrainingSlider";
import heroCar from "@/assets/hero-car.jpg";
import heroBike from "@/assets/hero-bike.jpg";
import scooterImg from "@/assets/scooter-training.jpg";
import { courses, safetyRules, site, telHref, testimonials, trustStats, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laxmi Driving Training — Car, Bike & Scooter Driving School" },
      {
        name: "description",
        content:
          "Learn car, motorcycle and scooter driving with Laxmi Driving Training. Beginner and advanced courses, patient instructors, dual-control training car. Book your lesson today.",
      },
      { property: "og:title", content: "Laxmi Driving Training — Learn Driving with Confidence" },
      {
        property: "og:description",
        content:
          "Beginner and advanced car, motorcycle and scooter training in simple, easy steps. Book your first lesson today.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const featured = courses.filter((c) => ["car-beginner", "bike-beginner", "scooter-beginner"].includes(c.id));

  return (
    <>
      {/* HERO */}
      <section className="bg-hero-gradient relative overflow-hidden text-primary-foreground">
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-24 size-96 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold">
              <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
              Car • Auto • Motorcycle • Scooter Training
            </span>
            <h1 className="font-display text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-[3.6rem]">
              Learn Driving the <span className="text-gradient-brand">Safe & Simple</span> Way
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              At {site.name} we teach in easy steps and simple language. No shouting, no hurry — just
              calm practice until you drive with full confidence.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="cta" size="xl">
                <Link to="/book">
                  <CalendarCheck aria-hidden="true" /> Book Your Lesson
                </Link>
              </Button>
              <Button asChild variant="onDark" size="xl">
                <a href={telHref}>
                  <Phone aria-hidden="true" /> Call Now
                </a>
              </Button>
              <Button asChild variant="outlineOnDark" size="xl">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </a>
              </Button>
            </div>

            <ul className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              {trustStats.map((s) => (
                <li key={s.label}>
                  <p className="font-display text-xl font-extrabold text-accent">{s.value}</p>
                  <p className="text-xs text-primary-foreground/75">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up relative">
            <img
              src={heroCar}
              alt="Young Indian learner driver at the wheel of a white training car with a red L plate, instructor guiding from the passenger seat"
              width={1600}
              height={1104}
              className="w-full rounded-3xl shadow-[var(--shadow-lift)]"
            />
            <div className="card-surface absolute -bottom-6 left-4 flex items-center gap-3 p-4 sm:left-8">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  Dual-Control Training Car
                </p>
                <p className="text-xs text-muted-foreground">Safe practice from your first class</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE CAR OR BIKE */}
      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Choose your training"
            title="What would you like to learn?"
            description="Pick your vehicle and we will match you with the right instructor and batch timing."
          />
          <VehicleTrainingSlider />
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-muted/60 section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Why choose us"
            title="Training that builds real confidence"
            description="Simple teaching, patient instructors and a strong focus on road safety."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: UserCheck,
                title: "Patient Instructors",
                body: "We explain in simple words and repeat as many times as you need.",
              },
              {
                Icon: ShieldCheck,
                title: "Safety First",
                body: "Every class includes safety habits, mirrors, signals and road rules.",
              },
              {
                Icon: Clock,
                title: "Flexible Timings",
                body: "Morning, afternoon and evening batches to fit your work or college.",
              },
              {
                Icon: BadgeCheck,
                title: "Licence Guidance",
                body: "We guide you through the learner's and permanent licence steps.",
              },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="card-surface animate-fade-up h-full p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Courses & pricing"
            title="Popular beginner courses"
            description="Full course list with all levels and fees is on the Courses & Pricing page."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/courses">
                See all courses & pricing <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SCOOTER STRIP */}
      <section className="section-y bg-primary-soft/60">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <img
            src={scooterImg}
            alt="Woman wearing a helmet learning to ride a white scooter on a quiet Indian street"
            loading="lazy"
            width={1200}
            height={900}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
          <div className="space-y-5">
            <SectionHeading
              align="left"
              eyebrow="Special batches"
              title="Scooter training for first-time riders"
              description="A favourite choice for students, homemakers and working women. We start with balance, then slowly move to main roads. A lady instructor can be arranged on request."
            />
            <ul className="grid gap-2 text-sm">
              {["Very slow, very patient teaching", "Helmet and safety gear guidance", "Practice on quiet roads first"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Star className="size-4 text-accent" aria-hidden="true" />
                    {t}
                  </li>
                ),
              )}
            </ul>
            <Button asChild variant="cta" size="lg">
              <Link to="/bike-training">Learn about bike & scooter training</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS PREVIEW */}
      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Student reviews"
            title="What our students say"
            description="Reviews below are editable placeholders — add real feedback from your students."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote key={t.id} className="card-surface animate-fade-up h-full p-6">
                <div className="flex gap-1 text-accent" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
                <footer className="mt-4 text-sm font-semibold text-foreground">
                  {t.name}
                  <span className="block text-xs font-normal text-muted-foreground">{t.course}</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link to="/testimonials">Read more reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SAFETY PREVIEW */}
      <section className="bg-muted/60 section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Road safety"
            title="Simple safety rules we teach every student"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safetyRules.slice(0, 4).map((r, i) => (
              <article key={r.title} className="card-surface h-full p-6">
                <span className="font-display text-2xl font-extrabold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-2 text-base font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </article>
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link to="/safety-rules">See all safety rules</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
