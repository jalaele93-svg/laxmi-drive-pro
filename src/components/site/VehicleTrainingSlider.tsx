import { useEffect, useRef, useState, useCallback } from "react";
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

const AUTO_ADVANCE_MS = 3500;

export function VehicleTrainingSlider() {
  const [active, setActive] = useState(0);
  const pausedUntilRef = useRef<number>(0);
  const pointerStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const pauseTemporarily = useCallback((ms = 4500) => {
    pausedUntilRef.current = Date.now() + ms;
  }, []);

  const move = useCallback((direction: number) => {
    pauseTemporarily(5000);
    setActive((current) => (current + direction + slides.length) % slides.length);
  }, [pauseTemporarily]);

  const selectSlide = useCallback((index: number) => {
    pauseTemporarily(5000);
    setActive(index);
  }, [pauseTemporarily]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActive((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    pointerStartX.current = null;
    isDragging.current = false;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        move(1);
      } else {
        move(-1);
      }
    }
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
    isDragging.current = false;
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => pauseTemporarily(3500)}
      onMouseLeave={() => {
        pausedUntilRef.current = 0;
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
              onClick={() => selectSlide(index)}
              className="px-3 sm:px-4 cursor-pointer"
            >
              <Icon aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </Button>
          ))}
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => move(-1)}
            aria-label="Previous vehicle"
            className="cursor-pointer"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => move(1)}
            aria-label="Next vehicle"
            className="cursor-pointer"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl bg-primary-dark shadow-[var(--shadow-lift)] sm:aspect-[16/9] lg:aspect-[21/9] cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-live="polite"
      >
        <div
          className="flex h-full w-full transition-transform duration-600 ease-out"
          style={{
            transform: `translate3d(-${active * 100}%, 0, 0)`,
            willChange: "transform",
          }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.title}
              id={`vehicle-slide-${index}`}
              role="tabpanel"
              aria-hidden={active !== index}
              className="relative h-full w-full min-w-full shrink-0 grow-0 basis-full overflow-hidden"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                width={1600}
                height={912}
                className="size-full object-cover transition-transform duration-700 hover:scale-105 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground sm:p-8 lg:p-10 pointer-events-auto">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold sm:text-sm">
                  <span className="rounded-full border border-primary-foreground/30 bg-primary-dark/50 px-3 py-1 backdrop-blur-sm">
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
        </div>

        <div
          className="absolute inset-x-6 top-5 z-20 flex gap-2 sm:inset-x-auto sm:right-6 sm:left-1/2"
          aria-label="Slide indicators"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                selectSlide(index);
              }}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-foreground/30 transition-all hover:bg-primary-foreground/60 sm:w-12 cursor-pointer"
              aria-label={`Go to ${slide.label}`}
              aria-current={active === index ? "true" : undefined}
            >
              {active === index ? (
                <span key={active} className="block h-full w-full bg-accent animate-pulse" />
              ) : (
                <span className="block h-full w-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal scrollable vehicle thumbnail cards */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x sm:grid sm:grid-cols-4 sm:overflow-visible">
        {slides.map((slide, index) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => selectSlide(index)}
            className={`group relative flex min-w-[200px] sm:min-w-0 flex-1 snap-start items-center gap-3 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
              active === index
                ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30"
                : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
            }`}
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
              <img
                src={slide.image}
                alt={slide.label}
                draggable={false}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-bold leading-tight truncate ${
                  active === index ? "text-primary" : "text-foreground"
                }`}
              >
                {slide.title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{slide.duration}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
