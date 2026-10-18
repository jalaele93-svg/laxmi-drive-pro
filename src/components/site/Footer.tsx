import { Link } from "@tanstack/react-router";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  CreditCard,
  CalendarCheck,
  MessageCircle,
  Car,
  ChevronRight,
  Handshake,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { site, telHref, whatsappHref } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/15 bg-gradient-to-b from-primary to-primary-dark text-white">
      {/* Trust Highlights Bar */}
      <div className="border-b border-white/15 bg-white/10 backdrop-blur-sm">
        <div className="container-page py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 text-accent">
                <Award className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Govt. Approved
                </p>
                <p className="text-[11px] text-white/80">Certified Driving School</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 text-accent">
                <Car className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Dual-Control Fleet
                </p>
                <p className="text-[11px] text-white/80">100% Safe Practical Training</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 text-accent">
                <CreditCard className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Razorpay Secure
                </p>
                <p className="text-[11px] text-white/80">UPI, Cards & NetBanking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 text-accent">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Open All 7 Days
                </p>
                <p className="text-[11px] text-white/80">7:00 AM – 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Columns */}
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4">
            <Logo onDark />
            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-white/85">
              Government-approved driving training institute in Odisha. Learn car, bike, scooter and
              auto driving with patient, expert instructors on dual-control vehicles.
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={telHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/25 hover:border-white/50 shadow-sm"
              >
                <Phone className="size-3.5 text-accent" />
                {site.phoneDisplay}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-200 transition-all hover:bg-emerald-500/30 shadow-sm"
              >
                <MessageCircle className="size-3.5 text-emerald-300" />
                WhatsApp Us
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/25 hover:border-white/50 shadow-sm"
              >
                <Mail className="size-3.5 text-accent" />
                Email
              </a>
            </div>
          </div>

          {/* Column 2: Courses & Programs */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="font-display text-xs font-extrabold uppercase tracking-widest text-accent">
              Training Courses
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-white/85">
              <li>
                <Link
                  to="/car-training"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Car Driving (Beginner to Pro)
                </Link>
              </li>
              <li>
                <Link
                  to="/bike-training"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Two-Wheeler / Motorcycle Course
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Scooter & Activa Training
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Auto Rickshaw Training
                </Link>
              </li>
              <li>
                <Link
                  to="/safety-rules"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Traffic Signs & Safety Rules
                </Link>
              </li>
              <li>
                <Link
                  to="/instructors"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent font-medium"
                >
                  <ChevronRight className="size-3.5 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  Our Certified Instructors
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Partner */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="font-display text-xs font-extrabold uppercase tracking-widest text-accent">
              Quick Links
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-white/85">
              <li>
                <Link to="/" className="transition-colors hover:text-accent font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-accent font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="transition-colors hover:text-accent font-medium">
                  Courses & Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="transition-colors hover:text-accent font-medium"
                >
                  Reviews & Feedback
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-accent font-medium">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-accent font-medium">
                  Contact Us
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to="/partner"
                  className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline"
                >
                  <Handshake className="size-3.5" />
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-1.5 font-bold text-white hover:text-accent"
                >
                  <CalendarCheck className="size-3.5 text-accent" />
                  Book a Lesson
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Offices & Hours */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="font-display text-xs font-extrabold uppercase tracking-widest text-accent">
              Offices & Hours
            </h2>

            <div className="space-y-3 text-xs leading-relaxed text-white/85">
              {/* Head Office Card */}
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3.5 space-y-1 shadow-sm">
                <p className="flex items-center gap-1.5 font-bold text-white text-[13px]">
                  <MapPin className="size-3.5 text-accent shrink-0" /> Head Office (Ganjam)
                </p>
                <p className="text-white/80 pl-5">
                  Plot No.-101, Palaspur (In Front of Budheshwar Temple), Main Road, PS.-Pattapur,
                  Distt.-Ganjam, Odisha – 761013
                </p>
              </div>

              {/* Branch Office Card */}
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3.5 space-y-1 shadow-sm">
                <p className="flex items-center gap-1.5 font-bold text-white text-[13px]">
                  <MapPin className="size-3.5 text-accent shrink-0" /> Branch Office (Rayagada)
                </p>
                <p className="text-white/80 pl-5">
                  Plot No.-107, Raniguda Farm (Near DFO Office), Distt.-Rayagada, Odisha – 765001
                </p>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 shadow-sm">
                <Clock className="size-4 text-accent shrink-0" />
                <div>
                  <span className="font-bold text-white block">Monday – Sunday</span>
                  <span className="text-[11px] text-white/80">7:00 AM – 7:00 PM (Everyday)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Bar */}
      <div className="border-t border-white/15 bg-black/20 py-5">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-white/80 sm:flex-row">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <strong className="text-white">{site.name}</strong>. All
            rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded bg-white/15 px-2.5 py-0.5 font-semibold text-white">
              <ShieldCheck className="size-3.5 text-emerald-300" /> Razorpay Verified Gateway
            </span>
            <span>•</span>
            <Link to="/partner-terms" className="hover:text-accent transition-colors">
              Partner Terms
            </Link>
            <span>•</span>
            <Link to="/safety-rules" className="hover:text-accent transition-colors">
              Safety Rules
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-accent transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
