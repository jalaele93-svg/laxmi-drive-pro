import { useState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site, telHref } from "@/lib/site";

export type BookingValues = {
  fullName: string;
  mobile: string;
  email: string;
  vehicleType: "" | "Car" | "Bike" | "Scooter";
  experience: "" | "Beginner" | "Intermediate" | "Advanced";
  date: string;
  time: string;
  message: string;
};

type Errors = Partial<Record<keyof BookingValues, string>>;

const emptyValues: BookingValues = {
  fullName: "",
  mobile: "",
  email: "",
  vehicleType: "",
  experience: "",
  date: "",
  time: "",
  message: "",
};

function validate(v: BookingValues): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 3) e.fullName = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(v.mobile.replace(/\D/g, "").slice(-10)))
    e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    e.email = "Enter a valid e-mail ID, for example name@gmail.com.";
  if (!v.vehicleType) e.vehicleType = "Please choose Car, Bike or Scooter.";
  if (!v.experience) e.experience = "Please choose your experience level.";
  if (!v.date) e.date = "Please choose a preferred date.";
  else if (new Date(v.date + "T23:59:59") < new Date(new Date().toDateString()))
    e.date = "Please choose today or a future date.";
  if (!v.time) e.time = "Please choose a preferred time.";
  return e;
}

/**
 * Sends the booking. Today it only simulates a request so the form works
 * without a backend. To connect e-mail or a database later, replace the body
 * of this function with a call to your server function / API — the form,
 * validation and success state stay exactly the same.
 */
async function submitBooking(values: BookingValues): Promise<void> {
  // TODO [EDIT]: replace with a real submit, e.g.
  // await sendBookingRequest({ data: values })
  console.info("Booking request", values);
  await new Promise((r) => setTimeout(r, 700));
}

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/30";

export function BookingForm({ defaultVehicle }: { defaultVehicle?: BookingValues["vehicleType"] }) {
  const [values, setValues] = useState<BookingValues>({
    ...emptyValues,
    vehicleType: defaultVehicle ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const set = <K extends keyof BookingValues>(key: K, value: BookingValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.querySelector<HTMLElement>("[data-invalid='true']");
      first?.focus();
      return;
    }
    setStatus("sending");
    await submitBooking(values);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="card-surface animate-fade-up flex flex-col items-center gap-4 p-8 text-center"
      >
        <span className="grid size-16 place-items-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <h2 className="font-display text-2xl font-extrabold">Thank you, {values.fullName}!</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Your lesson request for <strong className="text-foreground">{values.vehicleType}</strong>{" "}
          training on <strong className="text-foreground">{values.date}</strong> at{" "}
          <strong className="text-foreground">{values.time}</strong> has been received. Our team will
          call you on <strong className="text-foreground">{values.mobile}</strong> to confirm your
          batch and timing.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="cta">
            <a href={telHref}>
              <Phone aria-hidden="true" /> Call {site.phoneDisplay}
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setValues({ ...emptyValues, vehicleType: defaultVehicle ?? "" });
              setStatus("idle");
            }}
          >
            Book another lesson
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-surface grid gap-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="fullName" error={errors.fullName} required>
          <input
            id="fullName"
            name="fullName"
            className={fieldClass}
            placeholder="Your full name"
            autoComplete="name"
            value={values.fullName}
            data-invalid={Boolean(errors.fullName)}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </Field>

        <Field label="Mobile Number" htmlFor="mobile" error={errors.mobile} required>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            className={fieldClass}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            value={values.mobile}
            data-invalid={Boolean(errors.mobile)}
            onChange={(e) => set("mobile", e.target.value)}
          />
        </Field>

        <Field label="E-mail ID" htmlFor="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            className={fieldClass}
            placeholder="name@example.com"
            autoComplete="email"
            value={values.email}
            data-invalid={Boolean(errors.email)}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>

        <Field label="Vehicle Type" htmlFor="vehicleType" error={errors.vehicleType} required>
          <select
            id="vehicleType"
            name="vehicleType"
            className={fieldClass}
            value={values.vehicleType}
            data-invalid={Boolean(errors.vehicleType)}
            onChange={(e) => set("vehicleType", e.target.value as BookingValues["vehicleType"])}
          >
            <option value="">Select vehicle</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
          </select>
        </Field>

        <Field label="Experience Level" htmlFor="experience" error={errors.experience} required>
          <select
            id="experience"
            name="experience"
            className={fieldClass}
            value={values.experience}
            data-invalid={Boolean(errors.experience)}
            onChange={(e) => set("experience", e.target.value as BookingValues["experience"])}
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner — never driven before</option>
            <option value="Intermediate">Intermediate — some practice</option>
            <option value="Advanced">Advanced — need polishing</option>
          </select>
        </Field>

        <Field label="Preferred Date" htmlFor="date" error={errors.date} required>
          <input
            id="date"
            name="date"
            type="date"
            className={fieldClass}
            value={values.date}
            data-invalid={Boolean(errors.date)}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>

        <Field label="Preferred Time" htmlFor="time" error={errors.time} required>
          <input
            id="time"
            name="time"
            type="time"
            className={fieldClass}
            value={values.time}
            data-invalid={Boolean(errors.time)}
            onChange={(e) => set("time", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Message" htmlFor="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${fieldClass} h-auto py-3`}
          placeholder="Anything you want to tell us — pick-up area, lady instructor request, etc."
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </Field>

      <Button type="submit" variant="cta" size="xl" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" /> Sending your request…
          </>
        ) : (
          "Book Your Lesson"
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        We only use your details to contact you about your driving classes.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  required?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
        {label}
        {required && (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
