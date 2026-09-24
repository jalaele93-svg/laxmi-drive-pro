import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { site } from "@/lib/site";
import {
  ACCEPTED_FILE_TYPES,
  DEPOSIT_AMOUNT,
  MAX_FILE_MB,
  availabilityOptions,
  documentTypes,
  fuelOptions,
  ownershipOptions,
  partnerPayment,
  preferredLocations,
  preferredUses,
  transmissionOptions,
  vehicleTypes,
} from "@/lib/partner";

const searchSchema = z.object({
  vehicle: z.enum(["Car", "Motorcycle", "Scooter"]).optional(),
});

export const Route = createFileRoute("/_authenticated/partner-apply")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Apply as a Vehicle Partner | Laxmi Driving Training" },
      { name: "description", content: "Enroll your car, motorcycle or scooter with Laxmi Driving Training in 5 simple steps." },
      { property: "og:title", content: "Apply as a Vehicle Partner | Laxmi Driving Training" },
      { property: "og:description", content: "Enroll your car, motorcycle or scooter with Laxmi Driving Training." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerApply,
});

const steps = ["Your Details", "Vehicle", "Documents", "Preferences", "Bank & Payment"];

type FormKey =
  | "full_name"
  | "mobile"
  | "email"
  | "alternate_mobile"
  | "address"
  | "city"
  | "district"
  | "state"
  | "pincode"
  | "vehicle_type"
  | "registration_number"
  | "vehicle_make"
  | "vehicle_model"
  | "manufacturing_year"
  | "fuel_type"
  | "transmission"
  | "vehicle_color"
  | "odometer_km"
  | "ownership_status"
  | "preferred_location"
  | "preferred_use"
  | "preferred_availability"
  | "bank_account_name"
  | "bank_name"
  | "bank_account_number"
  | "bank_ifsc"
  | "upi_id"
  | "payment_reference"
  | "terms";

type Form = Record<FormKey, string>;

const mobileRe = /^[6-9]\d{9}$/;

function validate(step: number, f: Form, files: Record<string, File>): string | null {
  const need = (keys: string[]) => keys.find((k) => !f[k]?.trim());
  if (step === 0) {
    if (need(["full_name", "mobile", "email", "address", "city", "district", "state", "pincode"]))
      return "Please fill all required fields.";
    if (!mobileRe.test(f.mobile)) return "Enter a valid 10-digit mobile number.";
    if (f.alternate_mobile && !mobileRe.test(f.alternate_mobile)) return "Alternate mobile is not valid.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return "Enter a valid e-mail ID.";
    if (!/^\d{6}$/.test(f.pincode)) return "PIN code must be 6 digits.";
  }
  if (step === 1) {
    if (need(["vehicle_type", "registration_number", "vehicle_make", "vehicle_model", "manufacturing_year", "fuel_type", "transmission", "ownership_status"]))
      return "Please fill all required vehicle fields.";
    const y = Number(f.manufacturing_year);
    if (!(y >= 1990 && y <= new Date().getFullYear())) return "Enter a valid manufacturing year.";
  }
  if (step === 2) {
    const missing = documentTypes.find((d) => d.required && !files[d.id]);
    if (missing) return `Please upload: ${missing.label}`;
  }
  if (step === 3) {
    if (need(["preferred_location", "preferred_use", "preferred_availability"])) return "Please choose all preferences.";
  }
  if (step === 4) {
    if (need(["bank_account_name", "bank_name", "bank_account_number", "bank_ifsc"])) return "Please fill bank details.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(f.bank_ifsc)) return "Enter a valid 11-character IFSC code.";
    if (f.terms !== "yes") return "Please accept the Partner Enrollment Terms & Conditions.";
  }
  return null;
}

function PartnerApply() {
  const { vehicle } = Route.useSearch();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>({
    full_name: "",
    mobile: "",
    email: "",
    alternate_mobile: "",
    address: "",
    city: "",
    district: "",
    state: "Odisha",
    pincode: "",
    vehicle_type: vehicle ?? "",
    registration_number: "",
    vehicle_make: "",
    vehicle_model: "",
    manufacturing_year: "",
    fuel_type: "",
    transmission: "",
    vehicle_color: "",
    odometer_km: "",
    ownership_status: ownershipOptions[0],
    preferred_location: "",
    preferred_use: "",
    preferred_availability: "",
    bank_account_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    upi_id: "",
    payment_reference: "",
    terms: "",
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ no: string; ref: boolean } | null>(null);

  const set = (k: FormKey, v: string) => setF((p) => ({ ...p, [k]: v }));

  const next = () => {
    const e = validate(step, f, files);
    setError(e);
    if (!e) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onFile = (id: string, file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) return toast.error(`File must be under ${MAX_FILE_MB} MB`);
    if (!ACCEPTED_FILE_TYPES.split(",").includes(file.type)) return toast.error("Only JPG, PNG or PDF allowed");
    setFiles((p) => ({ ...p, [id]: file }));
  };

  const submit = async () => {
    const e = validate(4, f, files);
    setError(e);
    if (e || !user) return;
    setBusy(true);
    try {
      const hasRef = !!f.payment_reference?.trim();
      const { data: app, error: insErr } = await supabase
        .from("partner_applications")
        .insert({
          user_id: user.id,
          full_name: f.full_name.trim(),
          mobile: f.mobile,
          email: f.email.trim(),
          alternate_mobile: f.alternate_mobile || null,
          address: f.address.trim(),
          city: f.city.trim(),
          district: f.district.trim(),
          state: f.state.trim(),
          pincode: f.pincode,
          vehicle_type: f.vehicle_type as (typeof vehicleTypes)[number],
          registration_number: f.registration_number.trim().toUpperCase(),
          vehicle_make: f.vehicle_make.trim(),
          vehicle_model: f.vehicle_model.trim(),
          manufacturing_year: Number(f.manufacturing_year),
          fuel_type: f.fuel_type,
          transmission: f.transmission,
          vehicle_color: f.vehicle_color || null,
          odometer_km: f.odometer_km ? Number(f.odometer_km) : null,
          ownership_status: f.ownership_status as (typeof ownershipOptions)[number],
          preferred_location: f.preferred_location,
          preferred_use: f.preferred_use,
          preferred_availability: f.preferred_availability,
          bank_account_name: f.bank_account_name.trim(),
          bank_name: f.bank_name.trim(),
          bank_account_number: f.bank_account_number.trim(),
          bank_ifsc: f.bank_ifsc.trim().toUpperCase(),
          upi_id: f.upi_id || null,
          terms_accepted: true,
          status: "Payment Pending",
          payment_status: hasRef ? "Under Verification" : "Pending",
          payment_method: hasRef ? "UPI / Bank Transfer" : null,
          payment_reference: hasRef ? f.payment_reference.trim() : null,
          payment_paid_at: hasRef ? new Date().toISOString() : null,
          submitted_at: new Date().toISOString(),
        })
        .select("id, application_no")
        .single();
      if (insErr || !app) throw insErr ?? new Error("Could not save");

      for (const [docType, file] of Object.entries(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${app.id}/${docType}-${Date.now()}.${ext}`;
        const up = await supabase.storage.from("partner-documents").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        const { error: dErr } = await supabase.from("partner_documents").insert({
          application_id: app.id,
          user_id: user.id,
          doc_type: docType,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
        });
        if (dErr) throw dErr;
      }
      setDone({ no: app.application_no ?? app.id, ref: hasRef });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Application could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <section className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="font-display mt-4 text-3xl font-extrabold">Application Submitted</h1>
          <p className="mt-2 text-muted-foreground">Your Partner Application ID</p>
          <p className="font-display mt-1 text-2xl font-bold text-accent">{done.no}</p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
            <li>✅ Application Submitted</li>
            <li>{done.ref ? "🕑 Payment reference received — under verification" : "⏳ Payment pending"}</li>
            <li>🕑 Documents Under Verification</li>
          </ul>
          {!done.ref && <PaymentBox />}
          <p className="mt-6 text-xs text-muted-foreground">
            Payment only starts enrollment processing. Final approval happens after document and vehicle verification.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="cta"><Link to="/partner">Back to Partner Program</Link></Button>
            <Button asChild variant="outline"><a href={`tel:${site.phoneLink}`}>Call {site.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Vehicle Partner Application</h1>
      <p className="mt-2 text-muted-foreground">5 simple steps. Fields marked * are required.</p>

      <ol className="mt-6 grid grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="text-center">
            <div className={`h-2 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <span className={`mt-1 block text-[11px] sm:text-xs ${i === step ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <Grid>
            <In label="Full Name *" k="full_name" f={f} set={set} />
            <In label="Mobile Number *" k="mobile" f={f} set={set} type="tel" />
            <In label="E-mail ID *" k="email" f={f} set={set} type="email" />
            <In label="Alternate Mobile" k="alternate_mobile" f={f} set={set} type="tel" />
            <In label="Full Address *" k="address" f={f} set={set} wide />
            <In label="City *" k="city" f={f} set={set} />
            <In label="District *" k="district" f={f} set={set} />
            <In label="State *" k="state" f={f} set={set} />
            <In label="PIN Code *" k="pincode" f={f} set={set} />
          </Grid>
        )}
        {step === 1 && (
          <Grid>
            <Sel label="Vehicle Type *" k="vehicle_type" f={f} set={set} opts={[...vehicleTypes]} />
            <In label="Registration Number *" k="registration_number" f={f} set={set} />
            <In label="Make / Brand *" k="vehicle_make" f={f} set={set} />
            <In label="Model *" k="vehicle_model" f={f} set={set} />
            <In label="Manufacturing Year *" k="manufacturing_year" f={f} set={set} type="number" />
            <Sel label="Fuel Type *" k="fuel_type" f={f} set={set} opts={fuelOptions} />
            <Sel label="Transmission *" k="transmission" f={f} set={set} opts={transmissionOptions} />
            <In label="Colour" k="vehicle_color" f={f} set={set} />
            <In label="Kilometres Driven" k="odometer_km" f={f} set={set} type="number" />
            <Sel label="Ownership *" k="ownership_status" f={f} set={set} opts={[...ownershipOptions]} />
          </Grid>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">JPG, PNG or PDF. Max {MAX_FILE_MB} MB per file.</p>
            {documentTypes.map((d) => (
              <label key={d.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium">{d.label}{d.required ? " *" : ""}</span>
                <span className="flex items-center gap-2 text-xs">
                  {files[d.id] && <span className="max-w-[160px] truncate text-primary">✓ {files[d.id].name}</span>}
                  <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={(e) => onFile(d.id, e.target.files?.[0])} className="text-xs" />
                </span>
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <Grid>
            <Sel label="Preferred Location *" k="preferred_location" f={f} set={set} opts={preferredLocations} />
            <Sel label="Preferred Use *" k="preferred_use" f={f} set={set} opts={preferredUses} />
            <Sel label="Availability *" k="preferred_availability" f={f} set={set} opts={availabilityOptions} />
          </Grid>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-xl bg-muted p-4 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-accent" />
              <p>Your bank details are private. They are only visible to you and our verification staff and are never shown publicly.</p>
            </div>
            <Grid>
              <In label="Account Holder Name *" k="bank_account_name" f={f} set={set} />
              <In label="Bank Name *" k="bank_name" f={f} set={set} />
              <In label="Account Number *" k="bank_account_number" f={f} set={set} />
              <In label="IFSC Code *" k="bank_ifsc" f={f} set={set} />
              <In label="UPI ID" k="upi_id" f={f} set={set} />
            </Grid>
            <PaymentBox />
            <In label="Payment Transaction / UTR Number (if already paid)" k="payment_reference" f={f} set={set} />
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1" checked={f.terms === "yes"} onChange={(e) => set("terms", e.target.checked ? "yes" : "")} />
              <span>
                I have read and agree to the{" "}
                <Link to="/partner-terms" className="font-semibold text-primary underline" target="_blank">
                  Partner Enrollment Terms & Conditions
                </Link>
                .
              </span>
            </label>
          </div>
        )}

        {error && <p className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}

        <div className="mt-8 flex justify-between gap-3">
          <Button variant="outline" disabled={step === 0 || busy} onClick={() => { setError(null); setStep((s) => s - 1); }}>
            Back
          </Button>
          {step < 4 ? (
            <Button variant="cta" onClick={next}>Continue</Button>
          ) : (
            <Button variant="cta" onClick={submit} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application (₹{DEPOSIT_AMOUNT.toLocaleString("en-IN")} advance)
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function PaymentBox() {
  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-accent/60 p-4 text-left text-sm">
      <p className="font-semibold">Pay ₹{DEPOSIT_AMOUNT.toLocaleString("en-IN")} Partner Enrollment Advance Deposit</p>
      <p className="mt-2">UPI: <b>{partnerPayment.upiId}</b> ({partnerPayment.upiName})</p>
      <p>Bank: {partnerPayment.bankName} · A/c {partnerPayment.accountNumber} · IFSC {partnerPayment.ifsc}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        After paying, share the transaction ID on WhatsApp {site.phoneDisplay}. Refunds follow the Partner Terms.
      </p>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

const inputCls = "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function In({ label, k, f, set, type = "text", wide }: { label: string; k: FormKey; f: Form; set: (k: FormKey, v: string) => void; type?: string; wide?: boolean }) {
  return (
    <label className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input type={type} value={f[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
    </label>
  );
}

function Sel({ label, k, f, set, opts }: { label: string; k: FormKey; f: Form; set: (k: FormKey, v: string) => void; opts: string[] }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select value={f[k]} onChange={(e) => set(k, e.target.value)} className={inputCls}>
        <option value="">Select…</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
