import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
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
import { sendBookingStatusEmail } from "@/lib/email.server";

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

                // 1. Direct API call
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

                // 2. Server function fallback
                if (!emailSuccess) {
                  try {
                    const fnRes = await sendBookingStatusEmail({ data: payload });
                    if (fnRes.success) {
                      emailSuccess = true;
                    } else if (fnRes.error) {
                      errorMsg = fnRes.error;
                    }
                  } catch (fnErr: unknown) {
                    console.warn("ServerFn status email fallback error:", fnErr);
                  }
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
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(230px,1fr)_minmax(0,2fr)]">
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
        {filtered.map((p) => (
          <Button
            key={p.id}
            variant={selected === p.id ? "default" : "outline"}
            className="h-auto w-full justify-start whitespace-normal py-3 text-left"
            onClick={() => {
              setSelected(p.id);
              setNote(p.admin_notes ?? "");
              setReason(p.rejection_reason ?? "");
            }}
          >
            {p.application_no ?? "Application"} · {p.full_name} · {p.status}
          </Button>
        ))}
        {!filtered.length && (
          <p className="text-sm text-muted-foreground">No matching partner applications.</p>
        )}
      </div>
      {app && (
        <div className="space-y-5 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <h2 className="text-xl font-bold">
              {app.full_name} · {app.application_no}
            </h2>
            <p className="text-sm text-muted-foreground">
              {app.vehicle_type} · {app.registration_number} · {app.vehicle_make}{" "}
              {app.vehicle_model}
            </p>
            <p className="text-sm text-muted-foreground">
              {app.preferred_location} · {app.preferred_availability}
            </p>
            <a href={`tel:${app.mobile}`} className="text-sm text-primary">
              {app.mobile}
            </a>
            <span className="mx-2">·</span>
            <a href={`mailto:${app.email}`} className="text-sm text-primary">
              {app.email}
            </a>
          </div>
          <div className="flex flex-wrap gap-4">
            <SelectField
              label="Application"
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
                    "Verify the deposit and all required documents before approving. Confirm the vehicle inspection separately.",
                  );
                  return;
                }
                updateApp({
                  status,
                  ...(status === "Approved" && !app.partner_id
                    ? {
                        partner_id: `LDT-VP-${app.application_no?.replace(/\D/g, "").slice(-6) ?? app.id.slice(0, 6)}`,
                      }
                    : {}),
                });
              }}
              disabled={save.isPending}
            />
            <SelectField
              label="Deposit verification"
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
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
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
          <p className="text-sm">
            ₹{app.deposit_amount} advance · Reference: {app.payment_reference || "Not provided"}.
            Verify funds independently before marking verified. Verify the vehicle in person before
            approval.
          </p>
          <div className="space-y-2">
            <h3 className="font-semibold">Documents</h3>
            {documents
              .filter((d) => d.application_id === app.id)
              .map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm"
                >
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => openDocument(d.file_path)}
                  >
                    {documentTypes.find((t) => t.id === d.doc_type)?.label ?? d.doc_type} ·{" "}
                    {d.file_name}
                  </Button>
                  <label className="flex items-center gap-2">
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
            {!documents.some((d) => d.application_id === app.id) && (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            Internal notes
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <Button
            variant="outline"
            disabled={save.isPending}
            onClick={() => updateApp({ admin_notes: note })}
          >
            Save notes
          </Button>
          <label className="grid gap-2 text-sm font-semibold">
            Correction / rejection reason (visible to partner)
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <Button
            variant="outline"
            disabled={save.isPending}
            onClick={() => updateApp({ rejection_reason: reason || null })}
          >
            Save reason
          </Button>
          <p className="text-xs text-muted-foreground">
            Approval requires separate document and vehicle verification. Bank details are
            intentionally not shown here.
          </p>
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
