import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Download, RefreshCw, XCircle } from "lucide-react";
import { BookingEditor, InstructorEditor } from "@/components/admin/AdminEditors";
import { downloadCsv } from "@/lib/admin-export";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { site, instructors as publishedInstructors } from "@/lib/site";
import { applicationStatuses, documentTypes, paymentStatuses } from "@/lib/partner";
import {
  friendlyError,
  listBookings,
  listInstructors,
  listPartnerDocuments,
  listPartners,
  rupees,
  type Booking,
  type Instructor,
  type Partner,
} from "@/lib/operations";

type View =
  | "overview"
  | "orders"
  | "payments"
  | "drivers"
  | "allocation"
  | "customers"
  | "reports"
  | "partners"
  | "settings";
const bookingStates = ["New", "Confirmed", "In Progress", "Completed", "Cancelled"];
const paymentStates = ["Unpaid", "Pending verification", "Paid", "Refunded"];

function useAdminData(view: View) {
  const bookings = useQuery({
    queryKey: ["staff-bookings"],
    queryFn: listBookings,
    enabled: view !== "settings" && view !== "drivers" && view !== "partners",
  });
  const instructors = useQuery({
    queryKey: ["staff-instructors"],
    queryFn: listInstructors,
    enabled: ["drivers", "allocation", "overview", "orders", "payments"].includes(view),
  });
  const partners = useQuery({
    queryKey: ["staff-partners"],
    queryFn: listPartners,
    enabled: view === "partners" || view === "overview",
  });
  const documents = useQuery({
    queryKey: ["staff-documents"],
    queryFn: listPartnerDocuments,
    enabled: view === "partners",
  });
  return { bookings, instructors, partners, documents };
}
function useSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      table,
      id,
      changes,
    }: {
      table: "lesson_bookings" | "instructor_roster" | "partner_applications" | "partner_documents";
      id: string;
      changes: Record<string, unknown>;
    }) => {
      // Each table is staff-only under database access policies; the type-specific payload is checked by the database.
      const { data, error } = await supabase
        .from(table)
        .update(changes as never)
        .eq("id", id)
        .select("id")
        .single();
      if (error || !data)
        throw error ?? new Error("Record could not be updated. Check your staff access.");
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Saved");
    },
    onError: (error) => toast.error(friendlyError(error)),
  });
}
function SelectField({
  label,
  value,
  choices,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  choices: readonly string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <select
        aria-label={label}
        className="h-9 max-w-full rounded border border-input bg-background px-2 text-sm text-foreground"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </label>
  );
}
function PaymentAmountInput({
  initialAmount,
  onSave,
  disabled = false,
}: {
  initialAmount: number | null;
  onSave: (amount: number | null) => void;
  disabled?: boolean;
}) {
  const [val, setVal] = useState<string>(initialAmount != null ? String(initialAmount) : "");

  useEffect(() => {
    setVal(initialAmount != null ? String(initialAmount) : "");
  }, [initialAmount]);

  const commit = () => {
    const trimmed = val.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed !== initialAmount && (parsed === null || (Number.isInteger(parsed) && parsed >= 0))) {
      onSave(parsed);
    }
  };

  return (
    <Input
      type="number"
      min="0"
      className="h-9 w-28 font-medium"
      value={val}
      placeholder="0"
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      disabled={disabled}
    />
  );
}
function LoadState({ error, loading }: { error: unknown; loading: boolean }) {
  if (loading)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading records…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="text-sm text-destructive">
        Records could not be loaded. {friendlyError(error)}
      </p>
    );
  return null;
}
function Summary({ bookings, partners }: { bookings: Booking[]; partners: Partner[] }) {
  const paid = bookings
    .filter((b) => b.payment_status === "Paid")
    .reduce((a, b) => a + (b.amount ?? 0), 0);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Lesson requests" value={String(bookings.length)} hint="recorded requests" />
      <StatCard
        label="New requests"
        value={String(bookings.filter((b) => b.status === "New").length)}
        hint="awaiting response"
      />
      <StatCard label="Collected" value={rupees(paid)} hint="staff-confirmed payments" />
      <StatCard
        label="Partner applications"
        value={String(partners.length)}
        hint="submitted applications"
      />
    </div>
  );
}
function BookingRow({
  b,
  instructors,
  save,
  mode,
}: {
  b: Booking;
  instructors: Instructor[];
  save: ReturnType<typeof useSave>;
  mode: View;
}) {
  const update = (changes: Record<string, unknown>) =>
    save.mutate({ table: "lesson_bookings", id: b.id, changes });
  return (
    <article className="grid gap-3 border-b border-border py-4 last:border-0 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <p className="font-semibold">
          {b.full_name}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            · {b.vehicle_type} / {b.experience}
          </span>
        </p>
        <a className="text-sm text-primary" href={`tel:${b.mobile}`}>
          {b.mobile}
        </a>
        <p className="text-xs text-muted-foreground">
          {b.email} · {b.preferred_date} at {b.preferred_time.slice(0, 5)}
        </p>
        {b.message && (
          <div className="mt-1">
            {b.message.includes("PAID") || b.message.includes("Razorpay") ? (
              <span className="inline-block rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                {b.message}
              </span>
            ) : (
              <p className="text-sm">{b.message}</p>
            )}
          </div>
        )}
        {b.staff_notes && (
          <p className="mt-2 text-xs text-muted-foreground">Staff notes: {b.staff_notes}</p>
        )}
        <div className="mt-3">
          <BookingEditor booking={b} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <SelectField
          label="Booking status"
          value={b.status}
          choices={bookingStates}
          onChange={async (newStatus) => {
            if (newStatus === b.status) return;
            update({ status: newStatus });
            if (b.email && b.email.trim() !== "" && b.email.includes("@")) {
              try {
                const payload = {
                  bookingId: b.id,
                  customerEmail: b.email.trim(),
                  customerName: b.full_name || "Learner",
                  newStatus,
                  vehicleType: b.vehicle_type || "",
                  preferredDate: b.preferred_date || "",
                  preferredTime: b.preferred_time || "",
                  mobile: b.mobile || "",
                };

                let emailSuccess = false;
                let errorMsg = "";

                try {
                  const apiRes = await fetch("/api/send-booking-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const json = await apiRes.json().catch(() => null);
                  if (json?.success) {
                    emailSuccess = true;
                  } else if (json?.error) {
                    errorMsg = json.error;
                  }
                } catch (e: unknown) {
                  console.warn("Direct status email error:", e);
                }

                if (emailSuccess) {
                  toast.success(`Booking status changed to "${newStatus}" and email notification sent to ${b.email}!`);
                } else {
                  toast.warning(`Status updated to "${newStatus}", but email notification failed: ${errorMsg || "check server logs"}`);
                }
              } catch (err: unknown) {
                console.error("Status update email error:", err);
                toast.warning(`Status changed to "${newStatus}", but email could not be sent.`);
              }
            } else {
              toast.info(`Booking status changed to "${newStatus}". (Customer has no email address recorded)`);
            }
          }}
          disabled={save.isPending}
        />
        <SelectField
          label="Instructor"
          value={b.instructor ?? "Unassigned"}
          choices={[
            "Unassigned",
            ...instructors
              .filter((i) => i.availability !== "Leave" && i.vehicles.includes(b.vehicle_type))
              .map((i) => i.name),
            ...(b.instructor &&
            !instructors.some(
              (i) =>
                i.name === b.instructor &&
                i.availability !== "Leave" &&
                i.vehicles.includes(b.vehicle_type),
            )
              ? [b.instructor]
              : []),
          ]}
          onChange={(instructor) =>
            update({ instructor: instructor === "Unassigned" ? null : instructor })
          }
          disabled={save.isPending}
        />
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <SelectField
          label="Payment"
          value={b.payment_status}
          choices={paymentStates}
          onChange={(payment_status) => {
            if (payment_status === b.payment_status) return;
            if (payment_status === "Paid" && (!b.amount || b.amount === 0)) {
              update({ payment_status: "Paid", amount: 500 });
            } else if (payment_status === "Unpaid") {
              update({ payment_status: "Unpaid", amount: null });
            } else {
              update({ payment_status });
            }
          }}
          disabled={save.isPending}
        />
        <div className="grid gap-1 text-xs font-semibold text-muted-foreground">
          Amount (₹)
          <PaymentAmountInput
            initialAmount={b.amount}
            onSave={(amount) => update({ amount })}
            disabled={save.isPending}
          />
        </div>

        {b.payment_status !== "Paid" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 h-9 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold"
            disabled={save.isPending}
            onClick={() =>
              update({
                payment_status: "Paid",
                amount: b.amount && b.amount > 0 ? b.amount : 500,
              })
            }
          >
            ✓ Mark ₹500 Paid
          </Button>
        )}

        <div className="basis-full text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Preference: <strong className="text-foreground font-medium">{b.payment_choice}</strong></span>
            <span>·</span>
            {b.payment_status === "Paid" ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Verified Paid: ₹{(b.amount ?? 500).toLocaleString("en-IN")}
              </span>
            ) : b.payment_status === "Pending verification" ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ⏳ Payment Pending Verification
              </span>
            ) : (
              <span className="text-muted-foreground">
                Payment Status: Unpaid
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function BookingList({
  bookings,
  instructors,
  save,
  mode,
}: {
  bookings: Booking[];
  instructors: Instructor[];
  save: ReturnType<typeof useSave>;
  mode: View;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [vehicle, setVehicle] = useState("All");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0);
  const rows = bookings.filter(
    (b) =>
      (filter === "All" ||
        (mode === "payments"
          ? b.payment_status === filter
          : filter === "Unassigned"
            ? !b.instructor
            : b.status === filter)) &&
      (vehicle === "All" || b.vehicle_type === vehicle) &&
      (!date || b.preferred_date === date) &&
      `${b.full_name} ${b.mobile} ${b.email} ${b.vehicle_type}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / 20));
  const currentPage = Math.min(page, pageCount - 1);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
          Search
          <Input
            aria-label="Search lesson requests"
            placeholder="Name, mobile or email"
            className="max-w-xs"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <SelectField
          label={mode === "payments" ? "Payment filter" : "Status filter"}
          value={filter}
          choices={[
            "All",
            ...(mode === "payments"
              ? paymentStates
              : mode === "allocation"
                ? ["Unassigned", ...bookingStates]
                : bookingStates),
          ]}
          onChange={(v) => {
            setFilter(v);
            setPage(0);
          }}
        />
        <SelectField
          label="Vehicle filter"
          value={vehicle}
          choices={["All", "Car", "Bike", "Auto", "Scooter"]}
          onChange={(v) => {
            setVehicle(v);
            setPage(0);
          }}
        />
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
          Lesson date
          <Input
            aria-label="Filter lesson date"
            type="date"
            className="w-40"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <Button
          variant="outline"
          size="sm"
          disabled={!rows.length}
          onClick={() =>
            downloadCsv(
              "laxmi-lessons.csv",
              [
                "ID",
                "Name",
                "Mobile",
                "Email",
                "Vehicle",
                "Date",
                "Time",
                "Instructor",
                "Status",
                "Payment",
                "Amount INR",
              ],
              rows.map((b) => [
                b.id,
                b.full_name,
                b.mobile,
                b.email,
                b.vehicle_type,
                b.preferred_date,
                b.preferred_time,
                b.instructor,
                b.status,
                b.payment_status,
                b.amount,
              ]),
            )
          }
        >
          <Download className="size-4" />
          Export
        </Button>
        {(query || date || vehicle !== "All" || filter !== "All") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setDate("");
              setVehicle("All");
              setFilter("All");
              setPage(0);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{rows.length} matching requests</p>
      <div className="border-t border-border">
        {rows.slice(currentPage * 20, (currentPage + 1) * 20).map((b) => (
          <BookingRow key={b.id} b={b} instructors={instructors} save={save} mode={mode} />
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-sm text-muted-foreground">No matching lesson requests yet.</p>
        )}
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage + 1 >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
function Partners({
  partners,
  documents,
  save,
}: {
  partners: Partner[];
  documents: Awaited<ReturnType<typeof listPartnerDocuments>>;
  save: ReturnType<typeof useSave>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = partners.filter(
    (p) =>
      (statusFilter === "All" || p.status === statusFilter) &&
      `${p.application_no} ${p.full_name} ${p.mobile} ${p.registration_number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const app = partners.find((p) => p.id === selected);
  const appDocs = documents.filter((d) => d.application_id === selected);
  const requiredDocsVerified = documentTypes
    .filter((d) => d.required)
    .every((d) => appDocs.some((doc) => doc.doc_type === d.id && doc.verified));
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  async function openDocument(path: string) {
    const { data, error } = await supabase.storage
      .from("partner-documents")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Document could not be opened.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  const updateApp = (changes: Record<string, unknown>) => {
    if (
      (changes["status"] === "Rejected" || changes["status"] === "Correction Required") &&
      !reason.trim()
    ) {
      toast.error("Enter a reason before rejecting or requesting corrections.");
      return;
    }
    if (changes["status"] === "Rejected" || changes["status"] === "Correction Required")
      changes["rejection_reason"] = reason.trim();
    if (app) save.mutate({ table: "partner_applications", id: app.id, changes });
  };

  const notifyPartnerStatus = (newStatus: string, partnerId?: string, staffReason?: string) => {
    if (!app?.email || !app.email.includes("@") || app.email.endsWith("@partner.laxmidriving.com")) {
      return;
    }
    fetch("/api/send-partner-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerEmail: app.email,
        partnerName: app.full_name,
        applicationNo: app.application_no || app.id.slice(0, 8),
        newStatus,
        partnerId,
        reason: staffReason,
        vehicleDetails: `${app.vehicle_type} ${app.vehicle_make} ${app.vehicle_model} (${app.registration_number})`,
      }),
    }).catch((err) => console.warn("Partner status email failed:", err));
  };

  const handleApprove = () => {
    if (!app) return;
    const missing: string[] = [];
    if (app.payment_status !== "Verified") missing.push("Deposit Payment Verification");
    if (!app.vehicle_verified) missing.push("Vehicle Inspection Verification");
    if (!requiredDocsVerified) missing.push("All 6 Required Documents Verification");

    if (missing.length > 0) {
      toast.error(`Cannot approve yet. Missing: ${missing.join(", ")}`);
      return;
    }

    const partnerId =
      app.partner_id ||
      `LDT-VP-${app.application_no?.replace(/\D/g, "").slice(-6) ?? app.id.slice(0, 6)}`;

    updateApp({
      status: "Approved",
      partner_id: partnerId,
    });
    notifyPartnerStatus("Approved", partnerId);
    toast.success(`Partner Approved! Assigned Partner ID: ${partnerId}`);
  };

  const handleDecline = () => {
    if (!app) return;
    if (!reason.trim()) {
      toast.error("Please enter a reason in the 'Correction / rejection reason' box below before declining.");
      return;
    }
    updateApp({
      status: "Rejected",
      rejection_reason: reason.trim(),
    });
    notifyPartnerStatus("Rejected", undefined, reason.trim());
    toast.success("Application marked as Declined / Rejected.");
  };

  const handleRequestCorrections = () => {
    if (!app) return;
    if (!reason.trim()) {
      toast.error("Please enter what needs correction in the reason box below.");
      return;
    }
    updateApp({
      status: "Correction Required",
      rejection_reason: reason.trim(),
    });
    notifyPartnerStatus("Correction Required", undefined, reason.trim());
    toast.success("Requested corrections from partner.");
  };

  const handleVerifyDeposit = () => {
    if (!app) return;
    updateApp({
      payment_status: "Verified",
      payment_verified_at: new Date().toISOString(),
      payment_paid_at: new Date().toISOString(),
    });
    toast.success("Advance Deposit marked as Verified!");
  };

  const handleVerifyAllDocs = () => {
    if (!app) return;
    const unverified = appDocs.filter((d) => !d.verified);
    if (!unverified.length) {
      toast.info("All documents are already verified.");
      return;
    }
    unverified.forEach((d) => {
      save.mutate({
        table: "partner_documents",
        id: d.id,
        changes: {
          verified: true,
          verified_at: new Date().toISOString(),
        },
      });
    });
    toast.success(`Verified ${unverified.length} documents.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(240px,1fr)_minmax(0,2.5fr)]">
      <div className="space-y-3">
        <Input
          aria-label="Search partners"
          placeholder="Name, ID or registration"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Application filter"
          value={statusFilter}
          choices={["All", ...applicationStatuses]}
          onChange={setStatusFilter}
        />
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filtered.map((p) => (
            <Button
              key={p.id}
              variant={selected === p.id ? "default" : "outline"}
              className="h-auto w-full justify-start whitespace-normal py-3 text-left flex flex-col items-start gap-1"
              onClick={() => {
                setSelected(p.id);
                setNote(p.admin_notes ?? "");
                setReason(p.rejection_reason ?? "");
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">{p.application_no ?? "Application"}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.status === "Approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : p.status === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <span className="font-semibold text-sm">{p.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {p.vehicle_type} · {p.registration_number}
              </span>
            </Button>
          ))}
          {!filtered.length && (
            <p className="text-sm text-muted-foreground p-3">No matching partner applications.</p>
          )}
        </div>
      </div>

      {app ? (
        <div className="space-y-6 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold">{app.full_name}</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                  #{app.application_no || app.id.slice(0, 8)}
                </span>
                {app.partner_id && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                    ID: {app.partner_id}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {app.vehicle_type} · {app.registration_number} · {app.vehicle_make} {app.vehicle_model} ({app.manufacturing_year || "—"})
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                <a href={`tel:${app.mobile}`} className="font-semibold text-primary hover:underline">
                  📞 {app.mobile}
                </a>
                {app.email && (
                  <a href={`mailto:${app.email}`} className="text-primary hover:underline">
                    ✉️ {app.email}
                  </a>
                )}
                <span className="text-muted-foreground">
                  📍 {app.preferred_location} ({app.preferred_use || "Training"})
                </span>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                disabled={save.isPending || app.status === "Approved"}
                onClick={handleApprove}
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                {app.status === "Approved" ? "Approved ✓" : "Approve Partner"}
              </Button>
              <Button
                variant="destructive"
                disabled={save.isPending || app.status === "Rejected"}
                onClick={handleDecline}
              >
                <XCircle className="mr-1.5 size-4" />
                Decline / Reject
              </Button>
            </div>
          </div>

          {/* Verification Status Checklist */}
          <div className="rounded-xl border p-4 bg-muted/30 space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center justify-between">
              <span>Verification Checklist:</span>
              <span className="text-muted-foreground font-normal">
                (All 3 must be green to approve)
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between font-semibold ${
                  app.payment_status === "Verified"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-background border-border text-foreground"
                }`}
              >
                <span>Deposit: {app.payment_status}</span>
                {app.payment_status === "Verified" ? "✓" : "⏳"}
              </div>
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between font-semibold ${
                  app.vehicle_verified
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-background border-border text-foreground"
                }`}
              >
                <span>Vehicle Inspected</span>
                {app.vehicle_verified ? "✓" : "⏳"}
              </div>
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between font-semibold ${
                  requiredDocsVerified
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-background border-border text-foreground"
                }`}
              >
                <span>Docs (6/6) Verified</span>
                {requiredDocsVerified ? "✓" : "⏳"}
              </div>
            </div>
          </div>

          {/* Bank & Payment Details Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <CreditCard className="size-4 text-primary" /> Bank & Payment Information
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    app.payment_status === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : app.payment_status === "Under Verification"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Deposit: {app.payment_status}
                </span>
                {app.payment_status !== "Verified" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    disabled={save.isPending}
                    onClick={handleVerifyDeposit}
                  >
                    Mark Verified
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Account Holder Name:</span>
                <span className="font-bold text-sm text-foreground">{app.bank_account_name || "—"}</span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Bank Name:</span>
                <span className="font-bold text-sm text-foreground">{app.bank_name || "—"}</span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Account Number:</span>
                <span className="font-mono font-bold text-sm text-foreground select-all">{app.bank_account_number || "—"}</span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">IFSC Code:</span>
                <span className="font-mono font-bold text-sm text-foreground select-all">{app.bank_ifsc || "—"}</span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">UPI ID:</span>
                <span className="font-mono font-semibold text-foreground select-all">{app.upi_id || "None provided"}</span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Advance Deposit:</span>
                <span className="font-bold text-sm text-emerald-700">₹{(app.deposit_amount || 2000).toLocaleString("en-IN")}</span>
              </div>
              <div className="sm:col-span-2 p-2.5 bg-background rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Transaction / Payment Reference:</span>
                <span className="font-mono font-bold text-foreground select-all mt-0.5 block">
                  {app.payment_reference || "No reference entered yet"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Status & Deposit Dropdowns */}
          <div className="flex flex-wrap gap-4 items-end">
            <SelectField
              label="Application Status"
              value={app.status}
              choices={applicationStatuses}
              onChange={(status) => {
                if (
                  ["Approved", "Active"].includes(status) &&
                  (app.payment_status !== "Verified" ||
                    !requiredDocsVerified ||
                    !app.vehicle_verified)
                ) {
                  toast.error(
                    "Verify the deposit, all required documents, and vehicle inspection before approving.",
                  );
                  return;
                }
                const partnerId =
                  status === "Approved" && !app.partner_id
                    ? `LDT-VP-${app.application_no?.replace(/\D/g, "").slice(-6) ?? app.id.slice(0, 6)}`
                    : undefined;

                updateApp({
                  status,
                  ...(partnerId ? { partner_id: partnerId } : {}),
                });
                if (["Approved", "Rejected", "Correction Required"].includes(status)) {
                  notifyPartnerStatus(status, partnerId, reason);
                }
              }}
              disabled={save.isPending}
            />
            <SelectField
              label="Deposit Status"
              value={app.payment_status}
              choices={paymentStatuses}
              onChange={(payment_status) =>
                updateApp({
                  payment_status,
                  ...(payment_status === "Verified"
                    ? {
                        payment_verified_at: new Date().toISOString(),
                        payment_paid_at: new Date().toISOString(),
                      }
                    : {}),
                })
              }
              disabled={save.isPending}
            />
            <label className="flex items-center gap-2 text-sm font-semibold pb-1">
              <input
                type="checkbox"
                checked={app.vehicle_verified}
                disabled={save.isPending}
                onChange={(e) =>
                  updateApp({
                    vehicle_verified: e.target.checked,
                    vehicle_verified_at: e.target.checked ? new Date().toISOString() : null,
                  })
                }
              />
              Vehicle inspected and verified
            </label>
          </div>

          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Uploaded Documents</h3>
              {appDocs.some((d) => !d.verified) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={save.isPending}
                  onClick={handleVerifyAllDocs}
                >
                  Verify All Documents
                </Button>
              )}
            </div>
            <div className="space-y-2 border rounded-xl p-3 bg-background">
              {appDocs.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 py-2 text-sm"
                >
                  <Button
                    variant="link"
                    className="h-auto p-0 font-medium text-primary hover:underline text-left"
                    onClick={() => openDocument(d.file_path)}
                  >
                    📄 {documentTypes.find((t) => t.id === d.doc_type)?.label ?? d.doc_type} ·{" "}
                    <span className="text-xs text-muted-foreground">{d.file_name}</span>
                  </Button>
                  <label className="flex items-center gap-1.5 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={d.verified}
                      disabled={save.isPending}
                      onChange={(e) =>
                        save.mutate({
                          table: "partner_documents",
                          id: d.id,
                          changes: {
                            verified: e.target.checked,
                            verified_at: e.target.checked ? new Date().toISOString() : null,
                          },
                        })
                      }
                    />
                    Verified
                  </label>
                </div>
              ))}
              {!appDocs.length && (
                <p className="text-sm text-muted-foreground py-2 text-center">No documents uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Rejection / Correction Reason Box */}
          <div className="space-y-2">
            <label className="grid gap-2 text-sm font-semibold">
              Correction / Rejection Reason (Visible to Partner)
              <Textarea
                placeholder="Explain why the application is declined or what documents/corrections are required..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={save.isPending}
                onClick={() => updateApp({ rejection_reason: reason || null })}
              >
                Save Reason Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
                disabled={save.isPending}
                onClick={handleRequestCorrections}
              >
                <AlertTriangle className="mr-1.5 size-3.5" />
                Send Correction Request Email
              </Button>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="space-y-2">
            <label className="grid gap-2 text-sm font-semibold">
              Internal Staff Notes (Private)
              <Textarea
                placeholder="Private notes for staff only..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={save.isPending}
              onClick={() => updateApp({ admin_notes: note })}
            >
              Save Internal Notes
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold">Select an application to view details.</p>
          <p className="text-xs mt-1">Review applicant information, vehicle details, bank credentials, and uploaded documents.</p>
        </div>
      )}
    </div>
  );
}
function SettingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [draft, setDraft] = useState<Record<string, string | number | boolean>>({});
  const current = {
    institute_name: site.name,
    phone: site.phoneDisplay,
    email: site.email,
    slot_minutes: 45,
    max_lessons_daily: 6,
    first_slot: "07:00",
    last_slot: "19:00",
    sms_enabled: false,
    whatsapp_enabled: false,
    auto_allocate: false,
    online_payments: false,
    ...data,
    ...draft,
  };
  const save = useMutation({
    mutationFn: async () => {
      if (
        !current.institute_name.trim() ||
        !current.phone.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email)
      )
        throw new Error("Enter a name, phone and valid email.");
      if (
        !Number.isInteger(current.slot_minutes) ||
        current.slot_minutes < 1 ||
        !Number.isInteger(current.max_lessons_daily) ||
        current.max_lessons_daily < 1 ||
        current.first_slot >= current.last_slot
      )
        throw new Error("Check lesson duration, daily limit and opening times.");
      const { data: saved, error } = await supabase
        .from("site_settings")
        .upsert({
          id: 1,
          institute_name: current.institute_name,
          phone: current.phone,
          email: current.email,
          slot_minutes: current.slot_minutes,
          max_lessons_daily: current.max_lessons_daily,
          first_slot: current.first_slot,
          last_slot: current.last_slot,
          sms_enabled: current.sms_enabled,
          whatsapp_enabled: current.whatsapp_enabled,
          auto_allocate: current.auto_allocate,
          online_payments: current.online_payments,
        })
        .select("id")
        .single();
      if (error || !saved) throw error ?? new Error("Settings could not be saved.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-settings"] });
      setDraft({});
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <div className="space-y-5">
      <LoadState loading={isLoading} error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            "institute_name",
            "phone",
            "email",
            "slot_minutes",
            "max_lessons_daily",
            "first_slot",
            "last_slot",
          ] as const
        ).map((key) => (
          <label key={key} className="grid gap-2 text-sm font-semibold capitalize">
            {key.replaceAll("_", " ")}
            <Input
              type={
                key.includes("slot") && key !== "slot_minutes"
                  ? "time"
                  : typeof current[key] === "number"
                    ? "number"
                    : "text"
              }
              value={String(current[key])}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  [key]: typeof current[key] === "number" ? Number(e.target.value) : e.target.value,
                }))
              }
            />
          </label>
        ))}
      </div>
      <div className="grid gap-3">
        {(["sms_enabled", "whatsapp_enabled", "auto_allocate", "online_payments"] as const).map(
          (key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(current[key])}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
              />
              {key.replaceAll("_", " ")}
            </label>
          ),
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        These are staff preferences. Messaging and online payment services are not connected yet;
        switching them on does not send messages or collect funds. Public contact details remain
        unchanged until reviewed separately.
      </p>
      <Button
        variant="cta"
        onClick={() => save.mutate()}
        disabled={save.isPending || isLoading || Boolean(error)}
      >
        Save settings
      </Button>
    </div>
  );
}
export function Operations({ view }: { view: View }) {
  const { bookings: bq, instructors: iq, partners: pq, documents: dq } = useAdminData(view);
  const save = useSave();
  const qc = useQueryClient();
  const bookings = bq.data ?? [],
    instructors = iq.data ?? [],
    partners = pq.data ?? [];
  const title: Record<View, string> = {
    overview: "Overview",
    orders: "Lesson requests",
    payments: "Payments",
    drivers: "Instructors",
    allocation: "Allocation",
    customers: "Learners",
    reports: "Reports",
    partners: "Partner applications",
    settings: "Settings",
  };
  const paid = bookings.filter((b) => b.payment_status === "Paid");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const currentMonth = today.slice(0, 7);
  const monthRows = bookings.filter((b) => b.created_at.startsWith(currentMonth));
  const customers = useMemo(
    () => Array.from(new Map([...bookings].reverse().map((b) => [b.mobile, b])).values()),
    [bookings],
  );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title[view]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("staff-") })
            }
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
        description={
          view === "overview"
            ? "Live activity from saved lesson requests and partner applications."
            : view === "payments"
              ? "Manual payment records. Only mark paid after independently confirming receipt."
              : view === "partners"
                ? "Review applications, documents and payment references before approval."
                : view === "settings"
                  ? "Team preferences and booking rules."
                  : "Saved records for Laxmi Driving Training."
        }
      />
      <LoadState
        loading={Boolean(bq.isLoading || iq.isLoading || pq.isLoading || dq.isLoading)}
        error={bq.error || iq.error || pq.error || dq.error}
      />
      {view === "overview" && (
        <>
          <Summary bookings={bookings} partners={partners} />
          <h2 className="text-lg font-bold">Recent requests</h2>
          <BookingList
            bookings={bookings.slice(0, 8)}
            instructors={instructors}
            save={save}
            mode={view}
          />
        </>
      )}
      {view === "orders" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="New"
              value={String(bookings.filter((b) => b.status === "New").length)}
            />
            <StatCard
              label="Confirmed"
              value={String(bookings.filter((b) => b.status === "Confirmed").length)}
            />
            <StatCard
              label="Completed"
              value={String(bookings.filter((b) => b.status === "Completed").length)}
            />
          </div>
          <BookingList bookings={bookings} instructors={instructors} save={save} mode={view} />
        </>
      )}
      {view === "payments" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Confirmed collected"
              value={rupees(paid.reduce((a, b) => a + (b.amount ?? 0), 0))}
            />
            <StatCard
              label="Unpaid requests"
              value={String(bookings.filter((b) => b.payment_status === "Unpaid").length)}
            />
            <StatCard
              label="Needs verification"
              value={String(
                bookings.filter((b) => b.payment_status === "Pending verification").length,
              )}
            />
          </div>
          <BookingList bookings={bookings} instructors={instructors} save={save} mode={view} />
        </>
      )}
      {view === "allocation" && (
        <>
          <p className="text-sm text-muted-foreground">
            Select an available instructor for a confirmed lesson. Changes save for the team.
          </p>
          <BookingList
            bookings={bookings.filter((b) => b.status !== "Cancelled" && b.status !== "Completed")}
            instructors={instructors}
            save={save}
            mode={view}
          />
        </>
      )}
      {view === "drivers" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Working roster · {instructors.length}</h2>
            <InstructorEditor />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {instructors.map((row) => (
              <article
                key={row.id}
                className="space-y-3 rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <h2 className="font-bold">{row.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {row.specialty} · {row.experience_years} years
                  </p>
                  <p className="text-xs text-muted-foreground">{row.languages.join(", ")}</p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <SelectField
                    label="Availability"
                    value={row.availability}
                    choices={["Available", "On Lesson", "Leave"]}
                    disabled={save.isPending}
                    onChange={(availability) =>
                      save.mutate({
                        table: "instructor_roster",
                        id: row.id,
                        changes: { availability },
                      })
                    }
                  />
                  <InstructorEditor instructor={row} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.vehicles.join(" · ")} · {row.daily_capacity} lessons / day
                </p>
              </article>
            ))}
          </div>
          {publishedInstructors.some(
            (person) => !instructors.some((i) => i.name === person.name),
          ) && (
            <>
              <h2 className="text-lg font-bold">Published team not yet in roster</h2>
              <div className="divide-y divide-border">
                {publishedInstructors
                  .filter((person) => !instructors.some((i) => i.name === person.name))
                  .map((person) => (
                    <div
                      key={person.name}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="font-semibold">{person.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {person.role} · {person.experience}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const vehicles =
                            person.name === "Jalandhara Patro"
                              ? ["Bike"]
                              : person.name === "Sneha Kumari"
                                ? ["Scooter"]
                                : ["Car", "Auto"];
                          const { data, error } = await supabase
                            .from("instructor_roster")
                            .insert({
                              name: person.name,
                              specialty: person.role,
                              experience_years: Number.parseInt(person.experience, 10),
                              languages: person.languages.split(",").map((v) => v.trim()),
                              vehicles,
                            })
                            .select("id")
                            .single();
                          if (error || !data)
                            toast.error(error?.message ?? "Could not add instructor");
                          else {
                            toast.success("Instructor added");
                            iq.refetch();
                          }
                        }}
                      >
                        Add to roster
                      </Button>
                    </div>
                  ))}
              </div>
            </>
          )}
        </>
      )}
      {view === "customers" && (
        <>
          <StatCard
            label="Unique learners"
            value={String(customers.length)}
            hint="by mobile number"
          />
          <div className="divide-y divide-border">
            {customers.map((c) => (
              <div className="py-3" key={c.mobile}>
                <p className="font-semibold">
                  {c.full_name} · {c.vehicle_type}
                </p>
                <a href={`tel:${c.mobile}`} className="text-sm text-primary">
                  {c.mobile}
                </a>
                <p className="text-xs text-muted-foreground">
                  {c.email} · Most recent request: {c.created_at.slice(0, 10)}
                </p>
              </div>
            ))}
            {!customers.length && (
              <p className="py-5 text-sm text-muted-foreground">No learner requests yet.</p>
            )}
          </div>
        </>
      )}
      {view === "reports" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Requests this month" value={String(monthRows.length)} />
            <StatCard
              label="Confirmed collected"
              value={rupees(paid.reduce((a, b) => a + (b.amount ?? 0), 0))}
            />
            <StatCard
              label="Completed lessons"
              value={String(bookings.filter((b) => b.status === "Completed").length)}
            />
          </div>
          <div className="divide-y divide-border">
            {["Car", "Bike", "Scooter", "Auto"].map((vehicle) => (
              <div key={vehicle} className="flex justify-between py-3 text-sm">
                <span>{vehicle}</span>
                <span>{bookings.filter((b) => b.vehicle_type === vehicle).length} requests</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                "laxmi-vehicle-report.csv",
                ["Vehicle", "Requests", "Completed", "Collected INR"],
                ["Car", "Bike", "Scooter", "Auto"].map((v) => [
                  v,
                  bookings.filter((b) => b.vehicle_type === v).length,
                  bookings.filter((b) => b.vehicle_type === v && b.status === "Completed").length,
                  paid
                    .filter((b) => b.vehicle_type === v)
                    .reduce((sum, b) => sum + (b.amount ?? 0), 0),
                ]),
              )
            }
          >
            <Download className="size-4" />
            Export report
          </Button>
          <p className="text-xs text-muted-foreground">
            Reports include recorded requests only; historical paper records are not imported.
          </p>
        </>
      )}
      {view === "partners" && (
        <Partners partners={partners} documents={dq.data ?? []} save={save} />
      )}
      {view === "settings" && <SettingsPanel />}
    </div>
  );
}
