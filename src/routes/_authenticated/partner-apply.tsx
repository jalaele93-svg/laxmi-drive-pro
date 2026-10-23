import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, CreditCard, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { site } from "@/lib/site";
import { savePartnerDraft, finalizePartnerApplication } from "@/lib/partner-submission.functions";
import { uploadPartnerFile } from "@/lib/partner-upload";
import { openRazorpayCheckout } from "@/lib/razorpay";
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
      {
        name: "description",
        content:
          "Enroll your car, motorcycle or scooter with Laxmi Driving Training in 5 simple steps.",
      },
      { property: "og:title", content: "Apply as a Vehicle Partner | Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Enroll your car, motorcycle or scooter with Laxmi Driving Training.",
      },
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
  const need = (keys: FormKey[]) => keys.find((k) => !f[k].trim());
  if (step === 0) {
    if (need(["full_name", "mobile", "address", "city", "district", "state", "pincode"]))
      return "Please fill all required fields.";
    if (!mobileRe.test(f.mobile)) return "Enter a valid 10-digit mobile number.";
    if (f.alternate_mobile && !mobileRe.test(f.alternate_mobile))
      return "Alternate mobile is not valid.";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email)) return "Enter a valid e-mail ID.";
    if (!/^\d{6}$/.test(f.pincode)) return "PIN code must be 6 digits.";
  }
  if (step === 1) {
    if (
      need([
        "vehicle_type",
        "registration_number",
        "vehicle_make",
        "vehicle_model",
        "manufacturing_year",
        "fuel_type",
        "transmission",
        "ownership_status",
      ])
    )
      return "Please fill all required vehicle fields.";
    const y = Number(f.manufacturing_year);
    const maxYear = Math.max(new Date().getFullYear(), 2026) + 1;
    if (!(y >= 1990 && y <= maxYear)) return "Enter a valid manufacturing year.";
  }
  if (step === 2) {
    const missing = documentTypes.find((d) => d.required && !files[d.id]);
    if (missing) return `Please upload: ${missing.label}`;
  }
  if (step === 3) {
    if (need(["preferred_location", "preferred_use", "preferred_availability"]))
      return "Please choose all preferences.";
  }
  if (step === 4) {
    if (need(["bank_account_name", "bank_name", "bank_account_number", "bank_ifsc"]))
      return "Please fill bank details.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(f.bank_ifsc))
      return "Enter a valid 11-character IFSC code.";
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
  const applicationId = useRef<string | null>(null);
  const controllers = useRef<Record<string, AbortController>>({});
  const versions = useRef<Record<string, string>>({});
  const [uploadStates, setUploadStates] = useState<
    Record<string, { state: string; percent: number; error?: string }>
  >({});
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    // Prefill email if empty and user has a real email address
    if (user.email && !user.email.endsWith("@partner.laxmidriving.com")) {
      setF((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
      }));
    }

    const restore = async () => {
      try {
        const saved = localStorage.getItem(`partner-draft:${user.id}`);
        if (!saved) return;
        applicationId.current = saved;
        const { data, error } = await supabase
          .from("partner_applications")
          .select("*")
          .eq("id", saved)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!active) return;
        if (error || !data) {
          // If draft doesn't exist in DB, clear stale localStorage entry so user starts clean
          localStorage.removeItem(`partner-draft:${user.id}`);
          applicationId.current = null;
          return;
        }
        if (
          !["Draft", "Correction Required", "Payment Pending", "Submitted"].includes(data.status)
        ) {
          setDone({ no: data.application_no ?? data.id, ref: Boolean(data.payment_reference) });
          return;
        }
        setF((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(prev) as FormKey[]) {
            if (key === "terms") next[key] = data.terms_accepted ? "yes" : "";
            else if (key in data) next[key] = String(data[key as keyof typeof data] ?? "");
          }
          return next;
        });
        const { data: docs, error: docError } = await supabase
          .from("partner_documents")
          .select("doc_type")
          .eq("application_id", saved)
          .eq("is_current", true);
        if (docError) {
          console.warn("Could not check existing documents:", docError);
        }
        setUploadStates(
          Object.fromEntries(
            (docs ?? []).map((d) => [d.doc_type, { state: "saved", percent: 100 }]),
          ),
        );
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not restore draft.");
      } finally {
        if (active) setRestoring(false);
      }
    };
    void restore();
    return () => {
      active = false;
      Object.values(controllers.current).forEach((c) => c.abort());
    };
  }, [user?.id]);

  const set = (k: FormKey, v: string) => setF((p) => ({ ...p, [k]: v }));

  const next = async () => {
    const e =
      step === 2
        ? documentTypes.some((d) => d.required && uploadStates[d.id]?.state !== "saved")
          ? "Save all six required documents before continuing."
          : null
        : validate(step, f, files);
    setError(e);
    if (!e) {
      if (step === 1) {
        setBusy(true);
        try {
          await saveDraft();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not save draft.");
          return;
        } finally {
          setBusy(false);
        }
      }
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onFile = (id: string, file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_MB} MB`);
      return;
    }
    if (!ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
      toast.error("Only JPG, PNG or PDF allowed");
      return;
    }
    setFiles((p) => ({ ...p, [id]: file }));
    versions.current[id] = crypto.randomUUID();
    setUploadStates((prev) => ({ ...prev, [id]: { state: "selected", percent: 0 } }));
  };

  async function saveDraft() {
    if (!user) throw new Error("Please sign in again.");
    if (!applicationId.current) {
      applicationId.current = crypto.randomUUID();
      localStorage.setItem(`partner-draft:${user.id}`, applicationId.current);
    }
    const { terms: _terms, payment_reference: _reference, ...values } = f;
    const finalEmail =
      values.email.trim() ||
      (user.email && !user.email.endsWith("@partner.laxmidriving.com") ? user.email : "");
    return savePartnerDraft({
      data: {
        id: applicationId.current,
        values: {
          ...values,
          email: finalEmail,
          vehicle_type: values.vehicle_type as "Car",
          manufacturing_year: Number(values.manufacturing_year),
          ownership_status: values.ownership_status as "Individual Owner",
          fuel_type: values.fuel_type as "Petrol",
          transmission: values.transmission as "Manual",
        },
      },
    });
  }

  async function uploadSelected() {
    const id = applicationId.current;
    if (!id) {
      setError("Save your vehicle details first.");
      return;
    }
    setBusy(true);
    setError(null);
    const queue = Object.entries(files).filter(([type]) => uploadStates[type]?.state !== "saved");
    const worker = async () => {
      for (;;) {
        const item = queue.shift();
        if (!item) return;
        const [docType, file] = item;
        const controller = new AbortController();
        controllers.current[docType] = controller;
        setUploadStates((prev) => ({ ...prev, [docType]: { state: "uploading", percent: 0 } }));
        try {
          await uploadPartnerFile({
            id,
            docType,
            file,
            version: versions.current[docType] ?? crypto.randomUUID(),
            signal: controller.signal,
            progress: (percent) =>
              setUploadStates((prev) => ({ ...prev, [docType]: { state: "uploading", percent } })),
          });
          setUploadStates((prev) => ({ ...prev, [docType]: { state: "saved", percent: 100 } }));
        } catch (e) {
          setUploadStates((prev) => ({
            ...prev,
            [docType]: {
              state: "failed",
              percent: 0,
              error: e instanceof Error ? e.message : "Upload failed. Retry.",
            },
          }));
        } finally {
          delete controllers.current[docType];
        }
      }
    };
    try {
      await Promise.all([worker(), worker()]);
    } finally {
      setBusy(false);
    }
  }

  const submit = async () => {
    const e =
      [0, 1, 3, 4].map((s) => validate(s, f, files)).find(Boolean) ??
      (documentTypes.some((d) => d.required && uploadStates[d.id]?.state !== "saved")
        ? "Save all required documents first."
        : null);
    setError(e);
    if (e || !user) return;
    setBusy(true);
    try {
      const app = await saveDraft();
      const result = await finalizePartnerApplication({
        data: { id: app.id, terms: true, reference: f.payment_reference },
      });
      setDone(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Application saved. Retry submission or check your dashboard.",
      );
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
          <Button asChild className="mt-4" variant="outline">
            <Link to="/partner-dashboard">Track your application</Link>
          </Button>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
            <li>✅ Application Submitted</li>
            <li>
              {done.ref
                ? "🕑 Payment reference received — under verification"
                : "⏳ Payment pending"}
            </li>
            <li>🕑 Documents Under Verification</li>
          </ul>
          {!done.ref && <PaymentBox />}
          <p className="mt-6 text-xs text-muted-foreground">
            Payment only starts enrollment processing. Final approval happens after document and
            vehicle verification.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="cta">
              <Link to="/partner">Back to Partner Program</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${site.phoneLink}`}>Call {site.phoneDisplay}</a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        Vehicle Partner Application
      </h1>
      <p className="mt-2 text-muted-foreground">5 simple steps. Fields marked * are required.</p>

      <ol className="mt-6 grid grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="text-center">
            <div className={`h-2 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <span
              className={`mt-1 block text-[11px] sm:text-xs ${i === step ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
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
            <In label="E-mail ID (Optional)" k="email" f={f} set={set} type="email" />
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
            <Sel
              label="Transmission *"
              k="transmission"
              f={f}
              set={set}
              opts={transmissionOptions}
            />
            <In label="Colour" k="vehicle_color" f={f} set={set} />
            <In label="Kilometres Driven" k="odometer_km" f={f} set={set} type="number" />
            <Sel
              label="Ownership *"
              k="ownership_status"
              f={f}
              set={set}
              opts={[...ownershipOptions]}
            />
          </Grid>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              JPG, PNG or PDF. Max {MAX_FILE_MB} MB per file.
            </p>
            {documentTypes.map((d) => (
              <label
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium">
                  {d.label}
                  {d.required ? " *" : ""}
                </span>
                <span className="flex items-center gap-2 text-xs">
                  <span role="status" className="max-w-[180px] text-primary">
                    {uploadStates[d.id]?.state === "saved"
                      ? "✓ Saved"
                      : uploadStates[d.id]?.state === "uploading"
                        ? `Uploading ${uploadStates[d.id]?.percent}%`
                        : uploadStates[d.id]?.state === "failed"
                          ? uploadStates[d.id]?.error
                          : files[d.id]
                            ? "Selected — not uploaded"
                            : "Not uploaded"}
                  </span>
                  <input
                    type="file"
                    disabled={busy}
                    accept={ACCEPTED_FILE_TYPES}
                    onChange={(e) => onFile(d.id, e.target.files?.[0])}
                    className="min-w-0 max-w-full text-xs"
                  />
                </span>
              </label>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="cta"
                disabled={busy || !Object.keys(files).length}
                onClick={uploadSelected}
              >
                Upload / retry selected files
              </Button>
              {busy && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => Object.values(controllers.current).forEach((c) => c.abort())}
                >
                  Cancel uploads
                </Button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <Grid>
            <Sel
              label="Preferred Location *"
              k="preferred_location"
              f={f}
              set={set}
              opts={preferredLocations}
            />
            <Sel label="Preferred Use *" k="preferred_use" f={f} set={set} opts={preferredUses} />
            <Sel
              label="Availability *"
              k="preferred_availability"
              f={f}
              set={set}
              opts={availabilityOptions}
            />
          </Grid>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-xl bg-muted p-4 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-accent" />
              <p>
                Your bank details are private. They are only visible to you and our verification
                staff and are never shown publicly.
              </p>
            </div>
            <Grid>
              <In label="Account Holder Name *" k="bank_account_name" f={f} set={set} />
              <In label="Bank Name *" k="bank_name" f={f} set={set} />
              <In label="Account Number *" k="bank_account_number" f={f} set={set} />
              <In label="IFSC Code *" k="bank_ifsc" f={f} set={set} />
              <In label="UPI ID" k="upi_id" f={f} set={set} />
            </Grid>
            <PaymentBox f={f} set={set} />
            <In label="Razorpay Transaction ID / Reference" k="payment_reference" f={f} set={set} />
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={f.terms === "yes"}
                onChange={(e) => set("terms", e.target.checked ? "yes" : "")}
              />
              <span>
                I have read and agree to the{" "}
                <Link
                  to="/partner-terms"
                  className="font-semibold text-primary underline"
                  target="_blank"
                >
                  Partner Enrollment Terms & Conditions
                </Link>
                .
              </span>
            </label>
          </div>
        )}

        {error && (
          <p
            className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            variant="outline"
            disabled={step === 0 || busy}
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button variant="cta" disabled={busy || restoring} onClick={next}>
              {busy ? "Saving…" : restoring ? "Restoring draft…" : "Continue"}
            </Button>
          ) : (
            <Button variant="cta" onClick={submit} disabled={busy || restoring}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application (₹{DEPOSIT_AMOUNT.toLocaleString("en-IN")} advance)
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function PaymentBox({ f, set }: { f: Form; set: (k: FormKey, v: string) => void }) {
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    await openRazorpayCheckout({
      amount: DEPOSIT_AMOUNT,
      purpose: "Partner Enrollment Advance Deposit",
      learnerName: f.full_name || "Partner Applicant",
      mobile: f.mobile,
      email: f.email || "partner@laxmidriving.com",
      description: `Laxmi Driving Training - Partner Advance ₹${DEPOSIT_AMOUNT}`,
      onSuccess: (res) => {
        setPaying(false);
        set("payment_reference", res.razorpay_payment_id);
        toast.success(`Payment of ₹${DEPOSIT_AMOUNT.toLocaleString("en-IN")} successful!`);
      },
      onError: (err) => {
        setPaying(false);
        toast.error(err instanceof Error ? err.message : "Payment cancelled or failed.");
      },
      onDismiss: () => {
        setPaying(false);
      },
    });
  }

  return (
    <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/[0.03] p-5 text-left text-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-base text-foreground">
          ₹{DEPOSIT_AMOUNT.toLocaleString("en-IN")} Partner Enrollment Advance Deposit
        </p>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          Razorpay Secure
        </span>
      </div>

      {f.payment_reference ? (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3 text-xs sm:text-sm text-success space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="size-4" /> Advance Payment Recorded
          </p>
          <p className="font-mono text-xs text-foreground">
            Transaction / Payment ID: {f.payment_reference}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="cta"
            size="lg"
            disabled={paying}
            onClick={handlePay}
            className="w-full text-base font-bold py-6 shadow-md"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Razorpay…
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" /> Pay ₹
                {DEPOSIT_AMOUNT.toLocaleString("en-IN")} with Razorpay
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            ⚡ Instant payment via Razorpay. Supports <strong>UPI (GPay, PhonePe, Paytm, QR Code)</strong>, Cards & NetBanking.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3.5 text-emerald-600" /> 256-bit SSL Secure
        </span>
        <span>•</span>
        <span>UPI / QR / Cards / NetBanking</span>
        <span>•</span>
        <span className="font-semibold text-foreground/80">Laxmi Driving Training Verified</span>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

const inputCls =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function In({
  label,
  k,
  f,
  set,
  type = "text",
  wide,
}: {
  label: string;
  k: FormKey;
  f: Form;
  set: (k: FormKey, v: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function Sel({
  label,
  k,
  f,
  set,
  opts,
}: {
  label: string;
  k: FormKey;
  f: Form;
  set: (k: FormKey, v: string) => void;
  opts: string[];
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select value={f[k]} onChange={(e) => set(k, e.target.value)} className={inputCls}>
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
