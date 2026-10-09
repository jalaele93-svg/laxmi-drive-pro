import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { documentTypes, MAX_FILE_MB, ACCEPTED_FILE_TYPES, statusTone } from "@/lib/partner";
import { site, telHref, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/partner-dashboard")({
  head: () => ({ meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },{ title: "My Vehicle Partner Applications | Laxmi Driving Training" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PartnerDashboard,
});

function PartnerDashboard() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<Record<string, string>>({});
  const { data: applications = [], isLoading, error } = useQuery({ queryKey: ["my-partner-applications", user.id], queryFn: async () => {
    const { data, error } = await supabase.from("partner_applications").select("id,application_no,partner_id,status,payment_status,payment_reference,vehicle_type,registration_number,vehicle_make,vehicle_model,vehicle_verified,created_at,preferred_location,rejection_reason").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const { data: documents = [] } = useQuery({ queryKey: ["my-partner-documents", user.id], queryFn: async () => {
    const { data, error } = await supabase.from("partner_documents").select("id,application_id,doc_type,file_name,verified").eq("user_id", user.id);
    if (error) throw error;
    return data;
  } });
  async function upload(id: string, docType: string, file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > MAX_FILE_MB * 1024 * 1024) { toast.error(`Use a JPG, PNG or PDF under ${MAX_FILE_MB} MB.`); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${user.id}/${id}/${docType}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("partner-documents").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("partner_documents").insert({ user_id: user.id, application_id: id, doc_type: docType, file_path: path, file_name: file.name, mime_type: file.type, file_size: file.size });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["my-partner-documents"] });
      toast.success("Document uploaded for review");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); } finally { setBusy(false); }
  }
  async function sendReference(id: string) {
    const reference = ref[id]?.trim();
    if (!reference) { toast.error("Enter your transaction reference."); return; }
    setBusy(true);
    const { error } = await supabase.from("partner_applications").update({ payment_reference: reference, payment_method: "UPI / Bank Transfer", payment_status: "Under Verification" }).eq("id", id).eq("user_id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Reference sent for verification"); qc.invalidateQueries({ queryKey: ["my-partner-applications"] }); }
  }
  return <><PageHero eyebrow="Vehicle partner portal" title="Your Partner Dashboard" description="Track your vehicle application, documents and payment verification in one place." /><section className="section-y"><div className="container-page space-y-6"><div className="flex flex-wrap gap-3"><Button asChild variant="cta"><Link to="/partner-apply">Enroll another vehicle</Link></Button><Button asChild variant="outline"><Link to="/partner-terms">Partner terms</Link></Button></div>{isLoading && <p role="status">Loading your applications…</p>}{error && <p role="alert" className="text-destructive">Could not load applications. Please try again.</p>}{!isLoading && !error && !applications.length && <div className="card-surface p-7"><h2 className="text-xl font-bold">No applications yet</h2><p className="mt-2 text-muted-foreground">Apply to partner your Car, Motorcycle or Scooter. This is separate from booking a driving lesson.</p></div>}{applications.map((app) => <article key={app.id} className="card-surface space-y-5 p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Application {app.application_no ?? "Processing"}</p><h2 className="mt-1 text-xl font-bold">{app.vehicle_type} · {app.vehicle_make} {app.vehicle_model}</h2><p className="text-sm text-muted-foreground">{app.registration_number} · {app.preferred_location} · Applied {new Date(app.created_at).toLocaleDateString("en-IN")}</p>{app.partner_id && <p className="text-sm font-semibold">Partner ID: {app.partner_id}</p>}</div><span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone(app.status)}`}>{app.status}</span></div><div className="grid gap-3 sm:grid-cols-4">{[["Application", app.status], ["Vehicle", app.vehicle_verified ? "Verified" : "Under review"], ["Payment", app.payment_status], ["Documents", documents.filter((d) => d.application_id === app.id).length ? `${documents.filter((d) => d.application_id === app.id && d.verified).length} verified of ${documents.filter((d) => d.application_id === app.id).length}` : "Awaiting documents"]].map(([label, value]) => <div key={label} className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div>{app.rejection_reason && <p className="rounded-xl bg-destructive/10 p-3 text-sm">Note: {app.rejection_reason}</p>}{app.payment_status !== "Verified" && app.payment_status !== "Refunded" && <div className="space-y-2 rounded-xl border border-border p-4"><h3 className="font-semibold">₹2,000 advance verification</h3><p className="text-sm text-muted-foreground">Pay only using the payment instructions provided by our team. No UPI ID is published here until verified business details are supplied. Providing a reference does not prove payment.</p><div className="flex flex-wrap gap-2"><Input aria-label="UPI or bank transaction reference" placeholder="UPI / bank transaction reference" className="max-w-sm" value={ref[app.id] ?? app.payment_reference ?? ""} onChange={(e) => setRef((r) => ({ ...r, [app.id]: e.target.value }))} /><Button variant="outline" disabled={busy} onClick={() => sendReference(app.id)}>Send reference</Button></div></div>}<div className="space-y-3"><h3 className="font-semibold">Your documents</h3><div className="grid gap-3 sm:grid-cols-2">{documentTypes.map((d) => { const uploaded = documents.filter((item) => item.application_id === app.id && item.doc_type === d.id); return <div className="rounded-xl border border-border p-3" key={d.id}><p className="text-sm font-medium">{d.label}</p><p className="text-xs text-muted-foreground">{uploaded.length ? uploaded.map((item) => `${item.file_name} (${item.verified ? "verified" : "under review"})`).join(", ") : "Not uploaded"}</p><label className="mt-2 inline-flex cursor-pointer rounded-full border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted">{uploaded.length ? "Upload replacement" : "Upload document"}<input className="sr-only" type="file" accept={ACCEPTED_FILE_TYPES} disabled={busy} onChange={(e) => { upload(app.id, d.id, e.target.files?.[0]); e.target.value = ""; }} /></label></div>; })}</div></div><p className="text-sm text-muted-foreground">Training assignments, vehicle usage, earnings and payout history will appear when operations begin; none are recorded yet. Payment only initiates application processing. Approval requires document and vehicle verification.</p></article>)}<div className="rounded-2xl bg-primary p-6 text-primary-foreground"><h2 className="text-lg font-bold">Need partner support?</h2><p className="mt-1 text-sm">Contact {site.email} or call {site.phoneDisplay}.</p><div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="secondary"><a href={telHref}>Call support</a></Button><Button asChild variant="outlineOnDark"><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a></Button><Button asChild variant="outlineOnDark"><a href={`mailto:${site.email}`}>Email support</a></Button></div></div></div></section></>;
}
