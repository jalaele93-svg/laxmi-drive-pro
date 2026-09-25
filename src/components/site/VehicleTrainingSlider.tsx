import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  Car,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCar from "@/assets/hero-car.jpg";
import heroBike from "@/assets/hero-bike.jpg";
import autoTraining from "@/assets/auto-training.jpg";
import scooterTraining from "@/assets/scooter-training.jpg";

const slides = [
  {
    title: "Car Training",
    label: "Car",
    category: "Four-wheeler",
    duration: "From 12 days",
    description: "Learn road safety, smooth control, parking and confident city driving.",
    image: heroCar,
    alt: "Learner driving a white training car with an instructor beside her",
    to: "/car-training" as const,
    Icon: Car,
  },
  {
    title: "Motorcycle Training",
    label: "Motorcycle",
    category: "Two-wheeler",
    duration: "From 7 days",
    description: "Build balance, braking, gear control and safe road-riding habits.",
    image: heroBike,
    alt: "Motorcycle rider practising safely between traffic cones",
    to: "/bike-training" as const,
    Icon: Bike,
  },
  {
    title: "Auto-Rickshaw Training",
    label: "Auto",
    category: "Three-wheeler",
    duration: "From 12 days",
    description: "Practise safe handling, turning, reversing and traffic awareness.",
    image: autoTraining,
    alt: "Green and yellow auto-rickshaw on a driving practice ground with traffic cones",
    to: "/courses" as const,
    Icon: CarTaxiFront,
  },
  {
    title: "Scooter Training",
    label: "Scooter",
    category: "Easy mobility",
    duration: "From 5 days",
    description: "Start with balance and control, then progress calmly to road practice.",
    image: scooterTraining,
    alt: "Woman wearing a helmet learning to ride a scooter on a quiet road",
    to: "/bike-training" as const,
    Icon: Bike,
  },
] as const;

const AUTO_ADVANCE_MS = 3000;

export function VehicleTrainingSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const distance = event.changedTouches[0]?.clientX;
    if (distance === undefined || Math.abs(start - distance) < 45) return;
    move(start > distance ? 1 : -1);
  };

  return (
    <div
      className={paused ? "vehicle-slider-paused" : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex gap-2" role="tablist" aria-label="Choose a vehicle training course">
          {slides.map(({ label, Icon }, index) => (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={active === index ? "default" : "outline"}
              role="tab"
              aria-selected={active === index}
              aria-controls={`vehicle-slide-${index}`}
              onClick={() => setActive(index)}
              className="px-3 sm:px-4"
            >
              <Icon aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </Button>
          ))}
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <Button type="button" size="icon" variant="outline" onClick={() => move(-1)} aria-label="Previous vehicle">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={() => move(1)} aria-label="Next vehicle">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl bg-primary-dark shadow-[var(--shadow-lift)] sm:aspect-[16/9] lg:aspect-[21/9]"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
      >
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            id={`vehicle-slide-${index}`}
            role="tabpanel"
            aria-hidden={active !== index}
            className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
              active === index ? "z-10 scale-100 opacity-100" : "pointer-events-none scale-[1.03] opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading="lazy"
              width={1600}
              height={912}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground sm:p-8 lg:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold sm:text-sm">
                <span className="rounded-full border border-primary-foreground/30 bg-primary-dark/45 px-3 py-1 backdrop-blur-sm">
                  {slide.category}
                </span>
                <span className="flex items-center gap-1.5 text-primary-foreground/80">
                  <Clock3 className="size-4" aria-hidden="true" /> {slide.duration}
                </span>
              </div>
              <h3 className="font-display max-w-2xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                {slide.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                {slide.description}
              </p>
              <Button asChild variant="cta" size="lg" className="mt-5">
                <Link to={slide.to}>
                  View Training <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </article>
        ))}

        <div className="pointer-events-none absolute inset-x-6 top-5 z-20 flex gap-2 sm:inset-x-auto sm:right-6 sm:left-1/2" aria-hidden="true">
          {slides.map((slide, index) => (
            <span
              key={slide.label}
              className="h-1 flex-1 overflow-hidden rounded-full bg-primary-foreground/30 sm:w-12"
            >
              {active === index && <span key={active} className="vehicle-slider-progress block h-full bg-accent" />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}