import { useWebsiteContent, websiteContentOptions } from "@/lib/website-content-query";
import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CourseCard } from "@/components/site/CourseCard";
import { CtaBand } from "@/components/site/CtaBand";

export const Route = createFileRoute("/courses")({
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteContentOptions),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Courses & Pricing — Car, Bike & Scooter Classes | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "See all driving courses and fees for beginner and advanced car, motorcycle and scooter training at Laxmi Driving Training.",
      },
      { property: "og:title", content: "Courses & Pricing — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Beginner and advanced car, motorcycle and scooter courses with clear pricing.",
      },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: Courses,
});

function Courses() {
  const { courses } = useWebsiteContent();
  const groups = [
    { key: "Car", title: "Car Driving Courses" },
    { key: "Auto", title: "Auto-Rickshaw Courses" },
    { key: "Motorcycle", title: "Motorcycle Courses" },
    { key: "Scooter", title: "Scooter Courses" },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Courses & pricing"
        title="Simple Courses, Clear Pricing"
        description="Choose a course that matches your level. Every course includes practical driving classes plus a road-rules and safety session."
      />

      <section className="section-y">
        <div className="container-page space-y-14">
          {groups
            .filter((g) => courses.some((c) => c.vehicle === g.key))
            .map((g) => (
              <div key={g.key} className="space-y-8">
                <SectionHeading align="left" eyebrow={g.key} title={g.title} as="h2" />
                <div className="grid gap-6 md:grid-cols-2">
                  {courses
                    .filter((c) => c.vehicle === g.key)
                    .map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                </div>
              </div>
            ))}

          <aside className="card-surface flex gap-4 bg-accent-soft p-6">
            <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="space-y-1 text-sm text-foreground">
              <p className="font-semibold">Note about fees</p>
              <p className="text-muted-foreground">
                Government licence fees, test fees and taxes are not included. Please call us to
                confirm the current fees, batch timings and any pick-up charges for your area.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand
        title="Not sure which course suits you?"
        description="Call us or send a WhatsApp message. We will suggest the right course in two minutes."
      />
    </>
  );
}
