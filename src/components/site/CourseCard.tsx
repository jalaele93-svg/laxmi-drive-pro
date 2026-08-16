import { Link } from "@tanstack/react-router";
import { Check, Car, Bike, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/site";

export function CourseCard({ course }: { course: Course }) {
  const Icon = course.vehicle === "Car" ? Car : Bike;

  return (
    <article className="card-surface animate-fade-up relative flex h-full flex-col gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      {course.popular && (
        <span className="bg-accent-gradient absolute -top-3 right-6 rounded-full px-3 py-1 text-[0.65rem] font-bold tracking-wider text-primary-foreground uppercase">
          Most Popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {course.vehicle} • {course.level}
          </p>
          <h3 className="font-display text-lg font-bold text-foreground">{course.title}</h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{course.summary}</p>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-border py-4">
        <span className="font-display text-2xl font-extrabold text-primary">{course.price}</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {course.duration}
        </span>
      </div>

      <ul className="grid gap-2 text-sm text-foreground">
        {course.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant="cta" className="mt-auto w-full">
        <Link to="/book" search={{ vehicle: course.vehicle }}>
          Book This Course
        </Link>
      </Button>
    </article>
  );
}
