import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Booking = Database["public"]["Tables"]["lesson_bookings"]["Row"];
export type Instructor = Database["public"]["Tables"]["instructor_roster"]["Row"];
export type Partner = Database["public"]["Tables"]["partner_applications"]["Row"];
export type PartnerDocument = Database["public"]["Tables"]["partner_documents"]["Row"];
export type Settings = Database["public"]["Tables"]["site_settings"]["Row"];

export async function listBookings() {
  const { data, error } = await supabase
    .from("lesson_bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}
export async function listInstructors() {
  const { data, error } = await supabase.from("instructor_roster").select("*").order("name");
  if (error) throw error;
  return data;
}
export async function listPartners() {
  const { data, error } = await supabase
    .from("partner_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}
export async function listPartnerDocuments() {
  const { data, error } = await supabase
    .from("partner_documents")
    .select("*")
    .eq("is_current", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export const friendlyError = (e: unknown) => (e instanceof Error ? e.message : "Please try again.");
