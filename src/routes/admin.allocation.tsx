import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { AdminPageHeader, DemoNote, StatCard } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allocationSlots, drivers } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/allocation")({
  head: () => ({
    meta: [
      { title: "Allocation — Laxmi Admin" },
      {
        name: "description",
        content: "Assign instructors to today's lesson slots and clear unallocated bookings.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Allocation,
});

function Allocation() {
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(allocationSlots.map((s) => [s.order, s.driver])),
  );

  const total = allocationSlots.length;
  const allocated = allocationSlots.filter((s) => assignments[s.order]).length;

  return (
    <>
      <AdminPageHeader
        title="Allocation"
        description="Today's slot board. Assign an instructor to each booking and clear the unallocated queue."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              setAssignments(Object.fromEntries(allocationSlots.map((s) => [s.order, s.driver])))
            }
          >
            Reset board
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Slots Today" value={String(total)} hint="all vehicle types" />
        <StatCard label="Allocated" value={String(allocated)} hint="instructor assigned" />
        <StatCard label="Unallocated" value={String(total - allocated)} hint="need an instructor" />
        <StatCard
          label="Board Coverage"
          value={`${Math.round((allocated / total) * 100)}%`}
          hint="of today's slots"
        />
      </div>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base font-bold">Slot board — today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allocationSlots.map((slot) => {
            const eligible = drivers.filter(
              (d) => d.vehicles.includes(slot.vehicle) && d.status !== "Leave",
            );
            const assigned = assignments[slot.order];

            return (
              <div
                key={slot.order}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-extrabold">{slot.time}</span>
                    <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                      {slot.vehicle}
                    </Badge>
                    {assigned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="size-3.5" /> Allocated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                        <CircleAlert className="size-3.5" /> Unallocated
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {slot.order} · {slot.customer}
                  </p>
                </div>

                <div className="sm:w-64">
                  <Select
                    value={assigned ?? "unassigned"}
                    onValueChange={(v) =>
                      setAssignments((prev) => ({
                        ...prev,
                        [slot.order]: v === "unassigned" ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger aria-label={`Assign instructor for ${slot.order}`}>
                      <SelectValue placeholder="Choose instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {eligible.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name} — {d.todaySlots}/{d.capacity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <DemoNote>
        Allocation changes stay in this browser session only — connect Lovable Cloud to save them.
      </DemoNote>
    </>
  );
}
