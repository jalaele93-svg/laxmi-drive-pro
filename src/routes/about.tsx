import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShieldCheck, Target, Users } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CtaBand } from "@/components/site/CtaBand";
import carTraining from "@/assets/car-training.jpg";
import { site, trustStats } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "About Us — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Learn about Laxmi Driving Training, our simple teaching method, safety-first approach and patient instructors for car, bike and scooter learners.",
      },
      { property: "og:title", content: "About Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Simple teaching, patient instructors and a safety-first driving school.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A driving school built on patience and safety"
        description={`${site.name} was started with one simple aim — to help every learner drive safely and confidently, without fear and without confusion.`}
      />

      <section className="section-y">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <img
            src={carTraining}
            alt="Close-up of a learner's hands holding the steering wheel of a dual-control training car"
            loading="lazy"
            width={1200}
            height={900}
            className="w-full rounded-3xl shadow-[var(--shadow-card)]"
          />
          <div className="space-y-5">
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="We teach the way you learn best"
              description="Many people feel nervous when they first sit in the driver's seat. Our instructors slow down, explain every step in simple language and let you practise until it feels easy. Nothing is rushed."
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              We train students on our own vehicles. Our car has dual controls so the instructor can
              brake if needed, and our bikes and scooters are light and easy to handle for
              first-time riders. Every course also includes traffic rules and road safety classes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/60 section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="What we stand for" title="Our promise to every student" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: Heart,
                title: "Patience",
                body: "No shouting, no hurry. We repeat until you are comfortable.",
              },
              {
                Icon: ShieldCheck,
                title: "Safety",
                body: "Safe habits from the first class — belts, helmets, mirrors, signals.",
              },
              {
                Icon: Target,
                title: "Clear Steps",
                body: "A simple plan for each class, so you always know what comes next.",
              },
              {
                Icon: Users,
                title: "Respect",
                body: "Comfortable batches for students, ladies, seniors and working people.",
              },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="card-surface h-full p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map((s) => (
              <div key={s.label} className="card-surface p-6 text-center">
                <p className="font-display text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
