import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const text = z.string().trim().min(1).max(300);
const details = z.object({
  full_name: text,
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z
    .string()
    .max(254)
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    })
    .default(""),
  alternate_mobile: z.string().max(10),
  address: text,
  city: text,
  district: text,
  state: text,
  pincode: z.string().regex(/^\d{6}$/),
  vehicle_type: z.enum(["Car", "Motorcycle", "Scooter"]),
  registration_number: text,
  vehicle_make: text,
  vehicle_model: text,
    manufacturing_year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
    fuel_type: z.enum(["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]),
    transmission: z.enum(["Manual", "Automatic", "Gearless (Scooter)"]),
    vehicle_color: z.string().max(100),
    odometer_km: z.string().regex(/^\d*$/),
    ownership_status: z.enum(["Individual Owner", "Business Owner", "Company/Fleet Owner"]),
    preferred_location: z.string().max(100),
    preferred_use: z.string().max(100),
    preferred_availability: z.string().max(100),
    bank_account_name: z.string().max(200),
    bank_name: z.string().max(200),
    bank_account_number: z.string().max(40),
    bank_ifsc: z.string().max(11),
    upi_id: z.string().max(200),
  });
const editable: Database["public"]["Enums"]["partner_application_status"][] = [
  "Draft",
  "Correction Required",
  "Payment Pending",
  "Submitted",
];
const documentType = z.enum([
  "rc",
  "insurance",
  "puc",
  "licence",
  "photo_front",
  "photo_rear",
  "photo_side",
  "photo_interior",
]);

export const savePartnerDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), values: details }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing, error: readError } = await context.supabase
      .from("partner_applications")
      .select("id,status,user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) {
      console.error("[savePartnerDraft] read error:", readError);
      throw new Error(`Could not check saved application: ${readError.message}`);
    }
    if (existing && (existing.user_id !== context.userId || !editable.includes(existing.status)))
      throw new Error("This application is no longer editable.");
    const payload = {
      ...data.values,
      manufacturing_year: data.values.manufacturing_year,
      odometer_km: data.values.odometer_km ? Number(data.values.odometer_km) : null,
    };
    const query = existing
      ? context.supabase
          .from("partner_applications")
          .update(payload)
          .eq("id", data.id)
          .eq("user_id", context.userId)
      : context.supabase.from("partner_applications").insert({
          ...payload,
          id: data.id,
          user_id: context.userId,
          status: "Draft",
          terms_accepted: false,
          payment_status: "Pending",
          deposit_amount: 2000,
        });
    const { data: app, error } = await query.select("id,application_no").single();
    if (error || !app) {
      console.error("[savePartnerDraft] query error:", error);
      throw new Error(
        error?.message
          ? `Application could not be saved: ${error.message}`
          : "Application could not be saved. Retry with the same application.",
      );
    }
    return app;
  });

export const preparePartnerUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        docType: documentType,
        version: z.string().uuid(),
        mime: z.enum(["image/jpeg", "image/png", "application/pdf"]),
        size: z.number().int().positive().max(10485760),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: app } = await context.supabase
      .from("partner_applications")
      .select("id,status")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (!app || !editable.includes(app.status))
      throw new Error("This application is not editable. Contact our team.");
    const extension =
      data.mime === "application/pdf" ? "pdf" : data.mime === "image/png" ? "png" : "jpg";
    const path = `${context.userId}/${data.id}/${data.docType}-${data.version}.${extension}`;
    const { data: signed, error } = await context.supabase.storage
      .from("partner-documents")
      .createSignedUploadUrl(path);
    if (error || !signed) {
      console.error("[preparePartnerUpload] error:", error);
      throw new Error(error?.message ? `Could not prepare upload: ${error.message}` : "Could not prepare upload. Please retry.");
    }
    return { path, token: signed.token };
  });

export const confirmPartnerUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        docType: documentType,
        path: z.string().max(500),
        name: text,
        mime: z.enum(["image/jpeg", "image/png", "application/pdf"]),
        size: z.number().int().positive().max(10485760),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!data.path.startsWith(`${context.userId}/${data.id}/${data.docType}-`))
      throw new Error("Invalid document path.");
    const { data: app } = await context.supabase
      .from("partner_applications")
      .select("id,status")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (!app || !editable.includes(app.status))
      throw new Error("This application is no longer editable.");
    const { data: file, error } = await context.supabase.storage
      .from("partner-documents")
      .download(data.path);
    if (error || !file || file.size !== data.size)
      throw new Error("Upload has not been confirmed. Retry this file.");
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const isPdf =
      bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70 && bytes[4] === 45;
    const isPng = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
    const isJpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!(data.mime === "application/pdf" ? isPdf : data.mime === "image/png" ? isPng : isJpg)) {
      await context.supabase.storage.from("partner-documents").remove([data.path]);
      throw new Error("This file is not a valid JPG, PNG or PDF.");
    }

    const { hasSupabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (hasSupabaseAdmin()) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: id, error: saveError } = await supabaseAdmin.rpc("replace_partner_document", {
        _application_id: data.id,
        _user_id: context.userId,
        _doc_type: data.docType,
        _file_path: data.path,
        _file_name: data.name,
        _mime_type: data.mime,
        _file_size: data.size,
      });
      if (saveError) {
        console.error("[confirmPartnerUpload] RPC error:", saveError);
        throw new Error(`File uploaded but could not be saved: ${saveError.message}`);
      }
      return { id };
    }

    // Fallback if SUPABASE_SERVICE_ROLE_KEY is not defined:
    // Delete existing document for this doc_type, then insert new current row
    await context.supabase
      .from("partner_documents")
      .delete()
      .eq("application_id", data.id)
      .eq("user_id", context.userId)
      .eq("doc_type", data.docType);

    const { data: inserted, error: saveError } = await context.supabase
      .from("partner_documents")
      .insert({
        application_id: data.id,
        user_id: context.userId,
        doc_type: data.docType,
        file_path: data.path,
        file_name: data.name,
        mime_type: data.mime,
        file_size: data.size,
        is_current: true,
      })
      .select("id")
      .single();

    if (saveError || !inserted) {
      console.error("[confirmPartnerUpload] fallback insert error:", saveError);
      throw new Error(
        saveError?.message
          ? `File uploaded but not recorded: ${saveError.message}`
          : "File uploaded but not recorded. Retry to confirm it.",
      );
    }
    return { id: inserted.id };
  });

export const finalizePartnerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        terms: z.literal(true),
        reference: z.string().trim().max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: app } = await context.supabase
      .from("partner_applications")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (!app || !editable.includes(app.status))
      throw new Error("This application cannot be submitted again.");
    if (
      !app.preferred_location ||
      !app.preferred_use ||
      !app.preferred_availability ||
      !app.bank_account_name ||
      !app.bank_name ||
      !app.bank_account_number ||
      !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(app.bank_ifsc ?? "")
    )
      throw new Error("Complete your preferences and bank details.");
    const { data: docs, error } = await context.supabase
      .from("partner_documents")
      .select("doc_type")
      .eq("application_id", data.id)
      .eq("is_current", true);
    if (
      error ||
      ["rc", "insurance", "puc", "licence", "photo_front", "photo_rear"].some(
        (type) => !docs?.some((d) => d.doc_type === type),
      )
    )
      throw new Error("Upload and save all six required documents before submitting.");

    const updatePayload = {
      terms_accepted: true,
      status: "Payment Pending" as const,
      submitted_at: app.submitted_at ?? new Date().toISOString(),
      ...(app.payment_status === "Pending" && data.reference
        ? {
            payment_reference: data.reference,
            payment_status: "Under Verification" as const,
            payment_method: "UPI / Bank Transfer",
          }
        : {}),
    };

    const { hasSupabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (hasSupabaseAdmin()) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: updateError } = await supabaseAdmin
        .from("partner_applications")
        .update(updatePayload)
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .in("status", editable);
      if (updateError) {
        console.error("[finalizePartnerApplication] admin update error:", updateError);
        throw new Error(`Submission could not be confirmed: ${updateError.message}`);
      }
    } else {
      const { error: updateError } = await context.supabase
        .from("partner_applications")
        .update(updatePayload)
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .in("status", editable);
      if (updateError) {
        console.error("[finalizePartnerApplication] user update error:", updateError);
        throw new Error(
          updateError.message.includes("staff")
            ? "Submission requires database service role configuration (SUPABASE_SERVICE_ROLE_KEY missing in environment)."
            : `Submission could not be confirmed: ${updateError.message}`,
        );
      }
    }

    return {
      no: app.application_no ?? app.id,
      ref: Boolean(data.reference || app.payment_reference),
    };
  });
