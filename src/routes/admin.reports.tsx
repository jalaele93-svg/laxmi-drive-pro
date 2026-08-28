import { createFileRoute } from "@tanstack/react-router";

import { AdminPageHeader, DemoNote, StatCard } from "@/components/admin/AdminUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, monthlyBookings, reportRows } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Laxmi Admin" },
      {
        name: "description",
        content: "Booking and revenue reports by course and month for Laxmi Driving Training.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Reports,
});

function Reports() {
  const totalBookings = reportRows.reduce((s, r) => s + r.bookings, 0);
  const totalRevenue = reportRows.reduce((s, r) => s + r.revenue, 0);
  const maxMonth = Math.max(...monthlyBookings.map((m) => m.car + m.bike + m.scooter));
  const best = reportRows.reduce((a, b) => (b.revenue > a.revenue ? b : a));

  return (
    <>
      <AdminPageHeader
        title="Reports"
        description="Booking volume and revenue split by course and by month."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bookings (YTD)" value={totalBookings.toLocaleString("en-IN")} delta="+11.2%" trend="up" />
        <StatCard label="Revenue (YTD)" value={inr(totalRevenue)} delta="+7.9%" trend="up" />
        <StatCard label="Avg Booking Value" value={inr(Math.round(totalRevenue / totalBookings))} hint="all courses" />
        <StatCard label="Top Course" value={best.label.split(" ")[0]!} hint={best.label} />
      </div>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base font-bold">Monthly bookings by vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 sm:gap-6">
            {monthlyBookings.map((m) => {
              const total = m.car + m.bike + m.scooter;
              return (
                <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{total}</span>
                  <div
                    className="flex w-full max-w-14 flex-col justify-end overflow-hidden rounded-lg"
                    style={{ height: `${Math.max(28, (total / maxMonth) * 180)}px` }}
                  >
                    <div className="bg-primary" style={{ flexGrow: m.car }} />
                    <div className="bg-accent" style={{ flexGrow: m.bike }} />
                    <div className="bg-primary/35" style={{ flexGrow: m.scooter }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" /> Car
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent" /> Bike
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary/35" /> Scooter
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base font-bold">Course performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="min-w-40">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRows.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="font-semibold">{r.label}</TableCell>
                    <TableCell className="text-right">{r.bookings}</TableCell>
                    <TableCell className="text-right font-semibold">{inr(r.revenue)}</TableCell>
                    <TableCell>
                      <div className="mb-1 text-xs text-muted-foreground">{r.share}%</div>
                      <Progress value={r.share} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DemoNote>Report figures are sample data for layout preview only.</DemoNote>
    </>
  );
}
