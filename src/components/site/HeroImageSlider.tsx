import { useEffect, useRef, useState, useCallback } from "react";
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

const AUTO_SLIDE_MS = 3500;

export function HeroImageSlider() {
  const [active, setActive] = useState(0);
  const pausedUntilRef = useRef<number>(0);
  const pointerStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  // Pause temporarily on user interaction, auto-resumes after cooldown
  const pauseTemporarily = useCallback((ms = 4500) => {
    pausedUntilRef.current = Date.now() + ms;
  }, []);

  const move = useCallback((direction: number) => {
    pauseTemporarily(5000);
    setActive((current) => (current + direction + heroSlides.length) % heroSlides.length);
  }, [pauseTemporarily]);

  const goToSlide = useCallback((index: number) => {
    pauseTemporarily(5000);
    setActive(index);
  }, [pauseTemporarily]);

  // Robust timer that works on all laptops and screens
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActive((current) => (current + 1) % heroSlides.length);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);

  // Unified Pointer Events for Touch, Trackpad, and Mouse Drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || pointerStartX.current === null) return;
    const diff = pointerStartX.current - e.clientX;
    pointerStartX.current = null;
    isDragging.current = false;

    // Minimum drag threshold: 35px
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        move(1); // Swiped left -> next slide
      } else {
        move(-1); // Swiped right -> prev slide
      }
    }
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
    isDragging.current = false;
  };

  const currentSlide = heroSlides[active];
  const Icon = currentSlide.Icon;

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => pauseTemporarily(3500)}
      onMouseLeave={() => {
        pausedUntilRef.current = 0;
      }}
    >
      {/* Slider viewport container */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-3xl bg-primary-dark shadow-[var(--shadow-lift)] touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-roledescription="carousel"
        aria-live="polite"
      >
        {/* Sliding images strip */}
        <div
          className="flex h-full w-full transition-transform duration-600 ease-out"
          style={{
            transform: `translate3d(-${active * 100}%, 0, 0)`,
            willChange: "transform",
          }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={slide.vehicle}
              className="relative h-full w-full min-w-full shrink-0 grow-0 basis-full overflow-hidden"
              aria-hidden={active !== index}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                width={1600}
                height={1104}
                className="size-full object-cover transition-transform duration-700 hover:scale-105 pointer-events-none"
              />
              {/* Top & bottom readability overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Top Vehicle Category Pill Tag */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-md">
            <Icon className="size-3.5 text-accent" />
            {currentSlide.vehicle}
          </span>
        </div>

        {/* Top Slide Progress Bars / Indicators */}
        <div
          className="absolute inset-x-4 top-4 z-20 flex justify-end gap-1.5"
          aria-label="Slide indicators"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide.vehicle}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className="h-2 w-8 sm:w-10 overflow-hidden rounded-full bg-white/35 transition-all hover:bg-white/75 cursor-pointer"
              aria-label={`Jump to slide: ${slide.vehicle}`}
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

        {/* Left / Right Arrow navigation buttons */}
        <div className="absolute inset-y-0 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            aria-label="Previous slide"
            className="pointer-events-auto grid size-9 sm:size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md cursor-pointer border border-white/20"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            aria-label="Next slide"
            className="pointer-events-auto grid size-9 sm:size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md cursor-pointer border border-white/20"
          >
            <ChevronRight className="size-5 sm:size-6" />
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
