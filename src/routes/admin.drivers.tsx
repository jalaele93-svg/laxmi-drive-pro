import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { AdminPageHeader, DemoNote, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { drivers } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/drivers")({
  head: () => ({
    meta: [
      { title: "Drivers — Laxmi Admin" },
      {
        name: "description",
        content: "Instructor roster with vehicle skills, licence details, ratings and daily load.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Drivers;
});

function Drivers() {
  const available = drivers.filter((d) => d.status === "Available").length;
  const onLesson = drivers.filter((d) => d.status === "On Lesson").length;
  const slots = drivers.reduce((s, d) => s + d.todaySlots, 0);
  const capacity = drivers.reduce((s, d) => s + d.capacity, 0);

  return (
    <>
      <AdminPageHeader
        title="Drivers"
        description="Instructor roster with vehicle skills, licence records, ratings and today's load."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Instructors" value={String(drivers.length)} hint="active roster" />
        <StatCard label="Available Now" value={String(available)} hint="ready for a slot" />
        <StatCard label="On Lesson" value={String(onLesson)} hint="currently teaching" />
        <StatCard
          label="Today's Load"
          value={`${slots}/${capacity}`}
          hint="slots booked vs capacity"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((d) => (
          <Card key={d.id} className="card-surface">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base font-bold">{d.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {d.id} · {d.area}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {d.vehicles.map((v) => (
                  <Badge key={v} variant="outline" className="border-transparent bg-primary/10 text-primary">
                    {v}
                  </Badge>
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Experience</dt>
                  <dd className="font-semibold text-foreground">{d.experience}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Licence</dt>
                  <dd className="font-semibold text-foreground">{d.license}</dd>
                </div>
              </dl>
              <div className="flex items-center gap-1 text-xs font-semibold text-accent-foreground">
                <Star className="size-3.5 fill-current" />
                {d.rating.toFixed(1)} learner rating
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Today's slots</span>
                  <span className="font-semibold text-foreground">
                    {d.todaySlots}/{d.capacity}
                  </span>
                </div>
                <Progress value={(d.todaySlots / d.capacity) * 100} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DemoNote>Instructor names, licence numbers and areas are placeholders — replace with real records.</DemoNote>
    </>
  );
}
