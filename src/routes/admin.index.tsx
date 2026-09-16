import { createFileRoute, Link } from "@tanstack/react-router";

import { AdminPageHeader, DemoNote, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, kpis, monthlyBookings, orders } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Overview — Laxmi Admin" },
      { name: "description", content: "Bookings, revenue and instructor utilisation at a glance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const max = Math.max(...monthlyBookings.map((m) => m.car + m.bike + m.scooter));

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Snapshot of bookings, revenue and instructor capacity for Laxmi Driving Training."
        actions={
          <Button asChild variant="cta">
            <Link to="/admin/orders">View all orders</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Bookings by month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-3">
              {monthlyBookings.map((m) => {
                const total = m.car + m.bike + m.scooter;
                return (
                  <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="flex w-full flex-col justify-end overflow-hidden rounded-t-lg"
                      style={{ height: `${(total / max) * 100}%` }}
                      title={`${m.month}: ${total} bookings`}
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
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" /> Car
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" /> Bike
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary/35" /> Scooter
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base">Today at a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Lessons scheduled", value: "18" },
              { label: "Unallocated slots", value: "3" },
              { label: "Instructors on duty", value: "4 of 5" },
              { label: "Payments pending", value: inr(14000) },
              { label: "New enquiries", value: "7" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base">Recent bookings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 5).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-semibold">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{o.course}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {o.date} · {o.time}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{inr(o.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DemoNote>
        All numbers on this dashboard are sample data. Connect Lovable Cloud to replace them with real
        bookings, payments and instructor records.
      </DemoNote>
    </>
  );
}
