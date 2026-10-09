import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { DEPOSIT_AMOUNT } from "@/lib/partner";
import { site } from "@/lib/site";

export const Route = createFileRoute("/partner-terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Partner Terms & Conditions | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Terms and conditions for the Laxmi Driving Training vehicle partner program, including the ₹2,000 enrollment advance, verification, responsibilities and partner obligations.",
      },
      { property: "og:title", content: "Partner Terms & Conditions | Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Read the vehicle partner program terms before applying.",
      },
      { property: "og:url", content: "/partner-terms" },
    ],
    links: [{ rel: "canonical", href: "/partner-terms" }],
  }),
  component: PartnerTerms,
});

const sections: { title: string; body: string }[] = [
  {
    title: "1. Partner enrollment",
    body: "Any vehicle owner may apply to enroll an eligible car, motorcycle or scooter with Laxmi Driving Training. Submitting an application does not create a partnership. A partnership begins only after Laxmi Driving Training approves the application in writing.",
  },
  {
    title: `2. ₹${DEPOSIT_AMOUNT.toLocaleString("en-IN")} advance payment`,
    body: `An advance deposit of ₹${DEPOSIT_AMOUNT.toLocaleString("en-IN")} is required to process the partner enrollment/application. The payment means application/enrollment processing has been initiated. It is not a guarantee of approval, assignments or earnings.`,
  },
  {
    title: "3. Payment and refund policy",
    body: "The advance is treated as an enrollment processing amount. Whether any part of it is returned, adjusted or retained is decided by Laxmi Driving Training's business terms in force at that time. Refund requests should be raised with partner support.",
  },
  {
    title: "4. Vehicle verification",
    body: "Laxmi Driving Training may inspect the vehicle, test its roadworthiness and ask for additional information before approving an application.",
  },
  {
    title: "5. Document verification",
    body: "All uploaded documents must be genuine, current and belong to the vehicle and its owner. Incorrect, expired or unclear documents may lead to correction requests or rejection.",
  },
  {
    title: "6. Vehicle safety requirements",
    body: "The vehicle must remain in safe working condition, with functioning brakes, tyres, lights, mirrors and horn, and must comply with applicable motor-vehicle laws at all times.",
  },
  {
    title: "7. Partner responsibilities",
    body: "The partner must provide accurate information, keep documents valid, keep the vehicle available as agreed and inform Laxmi Driving Training about any change in ownership, condition or availability.",
  },
  {
    title: "8. Insurance responsibility",
    body: "Valid insurance for the vehicle is the responsibility of the vehicle owner unless separately agreed in writing.",
  },
  {
    title: "9. Maintenance responsibility",
    body: "Routine servicing, repairs, fuel and general upkeep are the responsibility of the vehicle owner unless separately agreed in writing.",
  },
  {
    title: "10. Accident and damage responsibility",
    body: "Responsibility for accidents, damage or third-party claims is decided as per the written partner agreement, the insurance policy terms and applicable law.",
  },
  {
    title: "11. Training-use conditions",
    body: "An enrolled vehicle may only be used for approved driving-training activities conducted by Laxmi Driving Training, with authorised instructors and learners.",
  },
  {
    title: "12. Payment and earning calculation",
    body: "Any partner payment is based on approved assignments, actual vehicle usage and the rates stated in the partner agreement. No income, booking or earning is guaranteed.",
  },
  {
    title: "13. Cancellation",
    body: "An application may be cancelled by the applicant before approval, and by Laxmi Driving Training if information is found incorrect or requirements are not met.",
  },
  {
    title: "14. Suspension",
    body: "A partner vehicle may be suspended for safety concerns, expired documents, non-availability or breach of these terms.",
  },
  {
    title: "15. Termination",
    body: "Either side may end the partnership with prior notice as stated in the partner agreement. Pending dues are settled as per the agreement.",
  },
  {
    title: "16. Privacy",
    body: "Partner details, documents and bank information are stored securely and used only for enrollment, verification, payment and support. Bank details are never displayed publicly and are visible only to the partner and authorised staff.",
  },
  {
    title: "17. Dispute resolution",
    body: "Both sides will first try to resolve any dispute directly through partner support. Unresolved disputes are handled as per applicable law.",
  },
  {
    title: "18. Applicable laws",
    body: "These terms are governed by the laws of India and applicable Odisha state rules for motor vehicles and driving training.",
  },
];

function PartnerTerms() {
  return (
    <>
      <PageHero
        eyebrow="Partner program"
        title="Partner Terms & Conditions"
        description="Please read these terms before applying to enroll your vehicle with Laxmi Driving Training."
      />

      <section className="section-y">
        <div className="container-page max-w-3xl space-y-8">
          <div className="card-surface bg-accent-soft p-6 text-sm text-muted-foreground">
            Terms are subject to final business and legal review. For anything not covered here,
            please contact partner support on {site.phoneDisplay}.
          </div>

          <div className="space-y-6">
            {sections.map((s) => (
              <article key={s.title}>
                <h2 className="font-display text-base font-extrabold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="cta" size="xl">
              <Link to="/partner-apply">Partner With Us</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/partner">Back to partner program</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
