import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { friendlyError, type Booking, type Instructor } from "@/lib/operations";

export function BookingEditor({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(booking);
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      if (!/^[6-9]\d{9}$/.test(draft.mobile.trim()))
        throw new Error("Enter a valid 10-digit mobile number.");
      const { data, error } = await supabase
        .from("lesson_bookings")
        .update({
          full_name: draft.full_name.trim(),
          mobile: draft.mobile.trim(),
          email: draft.email.trim(),
          vehicle_type: draft.vehicle_type,
          experience: draft.experience,
          preferred_date: draft.preferred_date,
          preferred_time: draft.preferred_time,
          message: draft.message || null,
          staff_notes: draft.staff_notes || null,
          payment_status: draft.payment_status,
          amount: draft.amount,
        })
        .eq("id", booking.id)
        .select("id")
        .single();
      if (error || !data) throw error ?? new Error("This request could not be updated.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-bookings"] });
      setOpen(false);
      toast.success("Lesson request updated");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDraft(booking);
          setOpen(true);
        }}
      >
        <Pencil className="size-3.5" />
        Edit request
      </Button>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>Edit lesson request</DialogTitle>
        <DialogDescription>
          {booking.full_name} · {booking.id.slice(0, 8)}
        </DialogDescription>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {(["full_name", "mobile", "email"] as const).map((key) => (
            <label key={key} className="grid gap-1 text-sm font-medium">
              {key === "full_name" ? "Full name" : key === "mobile" ? "Mobile" : "Email"}
              <Input
                required
                type={key === "email" ? "email" : "text"}
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {(["vehicle_type", "experience"] as const).map((key) => (
              <label key={key} className="grid gap-1 text-sm font-medium">
                {key === "vehicle_type" ? "Vehicle" : "Experience"}
                <select
                  className="h-10 rounded border border-input bg-background px-2"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                >
                  {(key === "vehicle_type"
                    ? ["Car", "Bike", "Auto", "Scooter"]
                    : ["Beginner", "Intermediate", "Advanced"]
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Lesson date
              <Input
                required
                type="date"
                value={draft.preferred_date}
                onChange={(e) => setDraft({ ...draft, preferred_date: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Lesson time
              <Input
                required
                type="time"
                value={draft.preferred_time.slice(0, 5)}
                onChange={(e) => setDraft({ ...draft, preferred_time: e.target.value })}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Payment status
              <select
                className="h-10 rounded border border-input bg-background px-2 text-sm"
                value={draft.payment_status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setDraft({
                    ...draft,
                    payment_status: newStatus,
                    ...(newStatus === "Paid" && (!draft.amount || draft.amount === 0) ? { amount: 500 } : {}),
                    ...(newStatus === "Unpaid" && draft.amount === 500 ? { amount: null } : {}),
                  });
                }}
              >
                {["Unpaid", "Pending verification", "Paid", "Refunded"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Amount (₹)
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={draft.amount ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setDraft({ ...draft, amount: val });
                }}
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Learner message
            <Textarea
              value={draft.message ?? ""}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Internal staff notes
            <Textarea
              value={draft.staff_notes ?? ""}
              onChange={(e) => setDraft({ ...draft, staff_notes: e.target.value })}
            />
          </label>
          <Button type="submit" disabled={save.isPending}>
            <Save className="size-4" />
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type InstructorDraft = {
  name: string;
  specialty: string;
  experience_years: number;
  languages: string;
  vehicles: string[];
  availability: string;
  daily_capacity: number;
};
const blank: InstructorDraft = {
  name: "",
  specialty: "",
  experience_years: 0,
  languages: "",
  vehicles: [],
  availability: "Available",
  daily_capacity: 6,
};
export function InstructorEditor({ instructor }: { instructor?: Instructor }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InstructorDraft>(blank);
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      if (!draft.vehicles.length) throw new Error("Choose at least one vehicle.");
      const payload = {
        ...draft,
        name: draft.name.trim(),
        specialty: draft.specialty.trim(),
        languages: draft.languages
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };
      const query = instructor
        ? supabase.from("instructor_roster").update(payload).eq("id", instructor.id)
        : supabase.from("instructor_roster").insert(payload);
      const { data, error } = await query.select("id").single();
      if (error || !data) throw error ?? new Error("Instructor could not be saved.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-instructors"] });
      setOpen(false);
      toast.success("Instructor saved");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDraft(
            instructor
              ? { ...instructor, languages: instructor.languages.join(", ") }
              : { ...blank, vehicles: [] },
          );
          setOpen(true);
        }}
      >
        {instructor ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {instructor ? "Edit instructor" : "Add instructor"}
      </Button>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>{instructor ? "Edit instructor" : "Add instructor"}</DialogTitle>
        <DialogDescription>Working instructor roster</DialogDescription>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {(["name", "specialty", "languages"] as const).map((key) => (
            <label key={key} className="grid gap-1 text-sm font-medium capitalize">
              {key}
              <Input
                required={key !== "languages"}
                value={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Experience (years)
              <Input
                required
                type="number"
                min="0"
                max="80"
                value={draft.experience_years}
                onChange={(e) => setDraft({ ...draft, experience_years: Number(e.target.value) })}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Daily capacity
              <Input
                required
                type="number"
                min="1"
                max="20"
                value={draft.daily_capacity}
                onChange={(e) => setDraft({ ...draft, daily_capacity: Number(e.target.value) })}
              />
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Vehicles</legend>
            <div className="flex flex-wrap gap-4">
              {["Car", "Bike", "Auto", "Scooter"].map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.vehicles.includes(v)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        vehicles: e.target.checked
                          ? [...draft.vehicles, v]
                          : draft.vehicles.filter((x) => x !== v),
                      })
                    }
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1 text-sm font-medium">
            Availability
            <select
              className="h-10 rounded border border-input bg-background px-2"
              value={draft.availability}
              onChange={(e) => setDraft({ ...draft, availability: e.target.value })}
            >
              {["Available", "On Lesson", "Leave"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={save.isPending}>
            <Save className="size-4" />
            {save.isPending ? "Saving…" : "Save instructor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
