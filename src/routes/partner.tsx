import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  FileText,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/Section";
import { site, telHref, whatsappHref } from "@/lib/site";
import {
  DEPOSIT_AMOUNT,
  partnerAreas,
  partnerBenefits,
  partnerCards,
  partnerEligibility,
  partnerProcess,
} from "@/lib/partner";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Become a Vehicle Partner | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Partner your car, motorcycle or scooter with Laxmi Driving Training in Berhampur and Rayagada, Odisha. Apply online and complete the partner enrollment process.",
      },
      { property: "og:title", content: "Become a Vehicle Partner | Laxmi Driving Training" },
      {
        property: "og:description",
        content:
          "Earn through your vehicle by partnering with Laxmi Driving Training. Apply online, upload documents and track your application.",
      },
      { property: "og:url", content: "/partner" },
    ],
    links: [{ rel: "canonical", href: "/partner" }],
  }),
  component: PartnerLanding,
});

function PartnerLanding() {
  return (
    <>
      <PageHero
        eyebrow="Vehicle partner program"
        title="Become a Laxmi Driving Training Partner"
        description="Partner your Car, Motorcycle or Scooter with Laxmi Driving Training. Earn through your vehicle by making it available for approved driving-training activities."
      >
        <Button asChild variant="cta" size="xl">
          <Link to="/partner-apply">Become a Partner</Link>
        </Button>
        <Button asChild variant="outlineOnDark" size="xl">
          <a href="#partner-program">View Partner Program</a>
        </Button>
      </PageHero>

      {/* Student vs partner */}
      <section className="section-y">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg font-extrabold">Driving Student</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A person who joins Laxmi Driving Training to learn car, motorcycle or scooter driving.
              Students pay course fees and attend classes.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/book">Book a driving lesson</Link>
            </Button>
          </div>
          <div className="card-surface bg-accent-soft p-6">
            <h2 className="font-display text-lg font-extrabold">Vehicle Partner</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A vehicle owner who applies to partner their car, motorcycle or scooter with Laxmi
              Driving Training for approved training activities.
            </p>
            <Button asChild variant="cta" className="mt-4">
              <Link to="/partner-apply">Enroll Your Vehicle</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner cards */}
      <section id="partner-program" className="section-y bg-muted/40 scroll-mt-24">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Partner program"
            title="Car, Motorcycle & Scooter Partners"
            description="Earn through your vehicle by partnering with Laxmi Driving Training. Potential to earn based on approved assignments, vehicle usage and applicable partner terms."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {partnerCards.map((card) => (
              <article key={card.type} className="card-surface flex flex-col gap-4 p-6">
                <div>
                  <span className="text-3xl" aria-hidden="true">
                    {card.emoji}
                  </span>
                  <h3 className="font-display mt-2 text-xl font-extrabold">{card.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.intro}</p>
                </div>

                <CardList title="Vehicle eligibility" items={card.eligibility} />
                <CardList title="Partner benefits" items={card.benefits} />
                <CardList title="Required documents" items={card.documents} />
                <CardList title="Basic requirements" items={card.requirements} />

                <div className="rounded-xl bg-muted/60 p-4 text-sm">
                  <p className="font-semibold">Enrollment process</p>
                  <p className="mt-1 text-muted-foreground">
                    Apply online → pay the advance → submit documents → vehicle verification →
                    approval.
                  </p>
                  <p className="mt-3 flex items-center gap-1 font-semibold">
                    <IndianRupee className="size-4" aria-hidden="true" />
                    {DEPOSIT_AMOUNT.toLocaleString("en-IN")} partner enrollment advance deposit
                  </p>
                  <Link
                    to="/partner-terms"
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Read Partner Terms &amp; Conditions
                  </Link>
                </div>

                <Button asChild variant="cta" className="mt-auto">
                  <Link to="/partner-apply" search={{ vehicle: card.type }}>
                    {card.cta}
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="section-y">
        <div className="container-page space-y-10">
          <SectionHeading
            eyebrow="Benefits"
            title="Why Become a Laxmi Driving Training Partner?"
            description="Potential to earn based on approved assignments, vehicle usage and applicable partner terms."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerBenefits.map((benefit) => (
              <div key={benefit} className="card-surface flex items-center gap-3 p-5">
                <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                <p className="text-sm font-semibold">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-y bg-muted/40">
        <div className="container-page space-y-10">
          <SectionHeading eyebrow="How it works" title="Partner Process in 6 Steps" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partnerProcess.map((item) => (
              <li key={item.step} className="card-surface p-6">
                <span className="bg-accent-gradient grid size-10 place-items-center rounded-full text-sm font-extrabold text-primary-foreground">
                  {item.step}
                </span>
                <h3 className="font-display mt-3 text-base font-extrabold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Deposit */}
      <section className="section-y">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <div className="card-surface p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
              Partner Enrollment Advance Deposit
            </p>
            <p className="font-display mt-3 flex items-center text-4xl font-extrabold">
              <IndianRupee className="size-8" aria-hidden="true" />
              {DEPOSIT_AMOUNT.toLocaleString("en-IN")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              An advance deposit of ₹{DEPOSIT_AMOUNT.toLocaleString("en-IN")} is required to process
              the partner enrollment/application. Paying the advance means your
              application/enrollment processing has started — it does not mean your vehicle is
              approved. Final partner approval happens only after document and vehicle verification.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Contact our team for verified UPI or bank instructions before paying. After paying, enter
              your reference in your partner dashboard for manual verification.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              {["Pending", "Paid", "Under Verification", "Verified", "Refunded"].map((s) => (
                <span key={s} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8">
            <h2 className="font-display flex items-center gap-2 text-lg font-extrabold">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Partner eligibility
            </h2>
            <ul className="mt-4 space-y-2">
              {partnerEligibility.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Additional requirements may apply depending on vehicle type, location and applicable
              laws.
            </p>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="section-y bg-muted/40">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="card-surface p-6">
            <h2 className="font-display flex items-center gap-2 text-lg font-extrabold">
              <MapPin className="size-5 text-accent" aria-hidden="true" /> Partner availability areas
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {partnerAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Partner availability may depend on local demand and operational requirements.
            </p>
          </div>
          <div className="card-surface p-6">
            <h2 className="font-display flex items-center gap-2 text-lg font-extrabold">
              <FileText className="size-5 text-primary" aria-hidden="true" /> Partner support
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Questions about the partner program? Talk to our partner support team.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={telHref}>
                  <Phone aria-hidden="true" /> {site.phoneDisplay}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container-page py-16 text-center md:py-20">
          <h2 className="font-display mx-auto max-w-2xl text-2xl font-extrabold text-balance sm:text-3xl lg:text-4xl">
            Have a Car, Motorcycle or Scooter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
            Partner With Laxmi Driving Training
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {partnerCards.map((card) => (
              <Button key={card.type} asChild variant="cta" size="xl">
                <Link to="/partner-apply" search={{ vehicle: card.type }}>
                  Become a {card.type} Partner
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="onDark">
              <a href={telHref}>
                <Phone aria-hidden="true" /> Call Now
              </a>
            </Button>
            <Button asChild variant="outlineOnDark">
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
