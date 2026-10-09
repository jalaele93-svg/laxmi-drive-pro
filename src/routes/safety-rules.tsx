import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { safetyRules } from "@/lib/site";

export const Route = createFileRoute("/safety-rules")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Road Safety Rules for Drivers & Riders | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Simple road safety rules every car driver and two-wheeler rider should follow — seat belts, helmets, speed limits, signals and safe distance.",
      },
      { property: "og:title", content: "Road Safety Rules — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Easy safety rules we teach every student, in simple words.",
      },
      { property: "og:url", content: "/safety-rules" },
    ],
    links: [{ rel: "canonical", href: "/safety-rules" }],
  }),
  component: SafetyRules,
});

function SafetyRules() {
  return (
    <>
      <PageHero
        eyebrow="Road safety"
        title="Safety Rules We Teach Every Student"
        description="Good driving is not about speed. It is about coming home safely, every day. These simple rules are part of every course we teach."
      />

      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="Simple rules" title="Follow these every time you ride or drive" />
          <div className="grid gap-5 md:grid-cols-2">
            {safetyRules.map((r, i) => (
              <article key={r.title} className="card-surface animate-fade-up flex gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display font-extrabold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <aside className="card-surface flex gap-4 bg-accent-soft p-6">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold">If you feel unsure, slow down</p>
                <p className="mt-1 text-muted-foreground">
                  Slowing down is never a mistake. Most road accidents happen because of hurry, not
                  because of lack of skill.
                </p>
              </div>
            </aside>
            <aside className="card-surface flex gap-4 bg-primary-soft p-6">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold">Practice makes safety a habit</p>
                <p className="mt-1 text-muted-foreground">
                  In our classes we repeat these rules until they become automatic — that is real
                  confidence.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaBand title="Learn safe driving from day one" />
    </>
  );
}
