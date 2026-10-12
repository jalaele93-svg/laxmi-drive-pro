import { useWebsiteContent, websiteContentOptions } from "@/lib/website-content-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { CtaBand } from "@/components/site/CtaBand";


export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteContentOptions),
  head: ({ loaderData }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Frequently Asked Questions — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Answers to common questions about driving classes, timings, fees, licence help, training vehicles and lady instructors at Laxmi Driving Training.",
      },
      { property: "og:title", content: "FAQ — Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Common questions about our driving classes, timings, fees and licence help.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (loaderData?.faqs ?? []).map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  const { faqs } = useWebsiteContent();
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Your Questions, Answered Simply"
        description="If you cannot find your answer here, just call us or send a WhatsApp message — we are happy to help."
      />

      <section className="section-y">
        <div className="container-page max-w-3xl space-y-10">
          <SectionHeading eyebrow="Common questions" title="Frequently asked questions" />
          <Accordion type="single" collapsible className="card-surface divide-y divide-border px-5">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-none">
                <AccordionTrigger className="text-left font-display text-base font-bold hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CtaBand title="Still have a question?" description="Call us or message on WhatsApp — we reply quickly during working hours." />
    </>
  );
}
