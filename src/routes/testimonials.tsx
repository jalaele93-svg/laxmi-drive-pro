import { createFileRoute } from "@tanstack/react-router";
import { Quote, Star } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { testimonials } from "@/lib/site";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Student Reviews & Testimonials — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Read what our students say about learning car, motorcycle and scooter driving at Laxmi Driving Training.",
      },
      { property: "og:title", content: "Student Reviews — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Real feedback from learners who now drive with confidence.",
      },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: Testimonials,
});

function Testimonials() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What Our Students Say"
        description="Real feedback from learners who now drive with confidence after training with us."
      />

      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="Student voices" title="Reviews from our learners" />
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="card-surface animate-fade-up h-full p-6">
                <Quote className="size-7 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{t.quote}”</p>
                <div className="mt-4 flex gap-1 text-accent" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <footer className="mt-3 text-sm font-semibold text-foreground">
                  {t.name}
                  <span className="block text-xs font-normal text-muted-foreground">{t.course}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Become our next happy student" />
    </>
  );
}
