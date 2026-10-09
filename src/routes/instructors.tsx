import { createFileRoute } from "@tanstack/react-router";
import { Award, Languages } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { instructors } from "@/lib/site";

export const Route = createFileRoute("/instructors")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Our Instructors — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Meet the patient, experienced instructors at Laxmi Driving Training for car, motorcycle and scooter classes, including lady instructors on request.",
      },
      { property: "og:title", content: "Our Instructors — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Patient, experienced driving instructors for car, bike and scooter learners.",
      },
      { property: "og:url", content: "/instructors" },
    ],
    links: [{ rel: "canonical", href: "/instructors" }],
  }),
  component: Instructors,
});

function Instructors() {
  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="Instructors Who Teach with Patience"
        description="Our trainers explain in simple language, repeat as often as needed and always put safety first."
      />

      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="Meet the team" title="Your trainers" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((i) => (
              <article key={i.id} className="card-surface animate-fade-up h-full p-6 text-center">
                <span className="bg-hero-gradient font-display mx-auto grid size-20 place-items-center rounded-2xl text-xl font-extrabold text-primary-foreground">
                  {i.initials}
                </span>
                <h3 className="font-display mt-4 text-lg font-bold">{i.name}</h3>
                <p className="text-sm font-semibold text-primary">{i.role}</p>
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Award className="size-3.5 text-accent" aria-hidden="true" />
                  {i.experience}
                </p>
                <p className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Languages className="size-3.5 text-accent" aria-hidden="true" />
                  {i.languages}
                </p>
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {i.specialities.map((s) => (
                    <li
                      key={s}
                      className="rounded-full bg-primary-soft px-3 py-1 text-[0.7rem] font-semibold text-primary"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Book a class with our team" />
    </>
  );
}
