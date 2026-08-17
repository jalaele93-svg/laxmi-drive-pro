import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CourseCard } from "@/components/site/CourseCard";
import { CtaBand } from "@/components/site/CtaBand";
import heroCar from "@/assets/hero-car.jpg";
import carTraining from "@/assets/car-training.jpg";
import { courses, telHref } from "@/lib/site";

export const Route = createFileRoute("/car-training")({
  head: () => ({
    meta: [
      { title: "Car Driving Training — Beginner & Advanced | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Car driving classes for beginners and advanced learners. Dual-control training car, parking practice, traffic and highway driving with patient instructors.",
      },
      { property: "og:title", content: "Car Driving Training — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Beginner and advanced car driving classes with a dual-control training car.",
      },
      { property: "og:url", content: "/car-training" },
    ],
    links: [{ rel: "canonical", href: "/car-training" }],
  }),
  component: CarTraining,
});

function CarTraining() {
  const carCourses = courses.filter((c) => c.vehicle === "Car");
  const steps = [
    { title: "Class 1–5: The basics", body: "Seat and mirror setting, clutch, brake, accelerator and slow straight driving." },
    { title: "Class 6–12: Control", body: "Gear changing, smooth turning, reverse, hill start and cone practice." },
    { title: "Class 13–18: Real roads", body: "Local roads, traffic signals, lane discipline and safe overtaking." },
    { title: "Class 19–21: Confidence", body: "Parking, busy market roads, highway feel and a final check drive." },
  ];

  return (
    <>
      <PageHero
        eyebrow="Car training"
        title="Car Driving Training for Every Level"
        description="From your very first clutch press to confident highway driving — we take you there step by step in a safe dual-control training car."
      >
        <Button asChild variant="cta" size="lg">
          <Link to="/book" search={{ vehicle: "Car" }}>
            <CalendarCheck aria-hidden="true" /> Book Car Lesson
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
            src={heroCar}
            alt="Instructor guiding a learner driver in a white dual-control training car on a practice ground"
            loading="lazy"
            width={1600}
            height={1104}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
          <div className="space-y-5">
            <SectionHeading
              align="left"
              eyebrow="What you will learn"
              title="Everything you need to drive safely"
            />
            <ul className="grid gap-3 text-sm">
              {[
                "Correct seating, mirror and steering position",
                "Clutch, brake and accelerator control",
                "Smooth gear changing and hill starts",
                "Reverse, U-turn and all types of parking",
                "Traffic signals, signs and road markings",
                "Highway driving, night driving and rain driving",
                "What to do in small emergencies",
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
          <SectionHeading eyebrow="Class plan" title="How your car course moves ahead" description="A simple, step-by-step plan so you always know what you will practise next." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <article key={s.title} className="card-surface h-full p-6">
                <span className="font-display text-2xl font-extrabold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="Car courses" title="Choose your car course" />
          <div className="grid gap-6 md:grid-cols-2">
            {carCourses.map((c) => (
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
              eyebrow="Safe by design"
              title="Our training car has dual controls"
              description="That means the instructor has his own brake. Even if you make a mistake, the car stays under control — so you can practise without fear."
            />
          </div>
          <img
            src={carTraining}
            alt="View from the passenger seat of a training car showing the learner's hands on the steering wheel"
            loading="lazy"
            width={1200}
            height={900}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
        </div>
      </section>

      <CtaBand title="Start your car lessons this week" />
    </>
  );
}
