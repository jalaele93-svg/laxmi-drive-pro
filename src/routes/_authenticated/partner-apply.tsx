import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const searchSchema = z.object({
  vehicle: z.enum(["Car", "Motorcycle", "Scooter"]).optional(),
});

export const Route = createFileRoute("/_authenticated/partner-apply")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Apply as a Vehicle Partner | Laxmi Driving Training" },
      { name: "description", content: "Enroll your car, motorcycle or scooter with Laxmi Driving Training." },
      { property: "og:title", content: "Apply as a Vehicle Partner | Laxmi Driving Training" },
      { property: "og:description", content: "Enroll your car, motorcycle or scooter with Laxmi Driving Training." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerApply,
});

function PartnerApply() {
  const { vehicle } = Route.useSearch();
  return (
    <section className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        {vehicle ? `${vehicle} Partner Application` : "Vehicle Partner Application"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        The online application form is opening soon. To enroll your vehicle now, please call or WhatsApp us.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="cta" size="lg">
          <a href={`tel:${site.phoneLink}`}>Call {site.phoneDisplay}</a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/partner">Back to Partner Program</Link>
        </Button>
      </div>
    </section>
  );
}
