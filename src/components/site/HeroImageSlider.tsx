import { useEffect, useRef, useState } from "react";
import { Bike, Car, CarTaxiFront, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import heroBike from "@/assets/hero-bike.jpg";
import autoTraining from "@/assets/auto-training.jpg";
import scooterTraining from "@/assets/scooter-training.jpg";

const heroSlides = [
  {
    title: "Dual-Control Training Car",
    subtitle: "Safe practice from your first class",
    vehicle: "Car Training",
    image: heroCar,
    alt: "Young Indian learner driver at the wheel of a white training car with a red L plate, instructor guiding from the passenger seat",
    Icon: Car,
  },
  {
    title: "Motorcycle Road & Track Training",
    subtitle: "Clutch, balance & safe road riding habits",
    vehicle: "Motorcycle Training",
    image: heroBike,
    alt: "Motorcycle rider practising safely between traffic cones on a dedicated training track",
    Icon: Bike,
  },
  {
    title: "Commercial 3-Wheeler Practice",
    subtitle: "Turning, reversing & traffic confidence",
    vehicle: "Auto Training",
    image: autoTraining,
    alt: "Green and yellow auto-rickshaw on a driving practice ground with traffic cones",
    Icon: CarTaxiFront,
  },
  {
    title: "Easy Balance Scooter Training",
    subtitle: "Zero hesitation, quiet road practice",
    vehicle: "Scooter Training",
    image: scooterTraining,
    alt: "Woman wearing a helmet learning to ride a scooter on a quiet road",
    Icon: Bike,
  },
] as const;

const AUTO_SLIDE_MS = 3000;

export function HeroImageSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, AUTO_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction: number) => {
    setActive((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const distance = event.changedTouches[0]?.clientX;
    if (distance === undefined || Math.abs(start - distance) < 45) return;
    move(start > distance ? 1 : -1);
  };

  const currentSlide = heroSlides[active];
  const Icon = currentSlide.Icon;

  return (
    <div
      className={`relative w-full ${paused ? "vehicle-slider-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      {/* Slider viewport container */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-3xl bg-primary-dark shadow-[var(--shadow-lift)]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
      >
        {/* Sliding images strip */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={slide.vehicle}
              className="relative h-full w-full shrink-0 grow-0 basis-full overflow-hidden"
              aria-hidden={active !== index}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                width={1600}
                height={1104}
                className="size-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle top and bottom gradients for badge legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Top Vehicle Category Pill Tag */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
            <Icon className="size-3.5 text-accent" />
            {currentSlide.vehicle}
          </span>
        </div>

        {/* Top Slide Progress Bars (just like What would you like to learn?) */}
        <div
          className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-end gap-1.5"
          aria-hidden="true"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide.vehicle}
              type="button"
              onClick={() => setActive(index)}
              className="pointer-events-auto h-1.5 w-8 overflow-hidden rounded-full bg-white/30 transition-all hover:bg-white/60 sm:w-10"
              aria-label={`Show ${slide.vehicle}`}
            >
              {active === index && (
                <span key={active} className="vehicle-slider-progress block h-full bg-accent" />
              )}
            </button>
          ))}
        </div>

        {/* Left / Right Arrow navigation buttons */}
        <div className="absolute inset-y-0 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous slide"
            className="pointer-events-auto grid size-8 sm:size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next slide"
            className="pointer-events-auto grid size-8 sm:size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Dynamic bottom badge card */}
      <div className="card-surface absolute -bottom-6 left-4 right-4 sm:right-auto flex items-center gap-3 p-3.5 sm:p-4 sm:left-8 z-20 shadow-lg border border-border/80 transition-all duration-300">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-all">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-foreground truncate">
            {currentSlide.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{currentSlide.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
