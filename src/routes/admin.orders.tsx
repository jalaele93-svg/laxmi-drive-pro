import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AdminPageHeader, DemoNote, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, orders } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Laxmi Admin" },
      { name: "description", content: "Every lesson booking with course, slot, instructor and payment status." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Orders,
});

const filters = ["All", "New", "Allocated", "In Progress", "Completed", "Cancelled"] as const;

function Orders() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "All" || o.status === filter) &&
        (q === "" ||
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.course.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="All lesson bookings with course, slot, assigned instructor and payment status."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Orders" value="3" hint="need attention" />
        <StatCard label="In Progress" value="1" hint="lesson running" />
        <StatCard label="Completed (Aug)" value="164" delta="+9.2%" trend="up" />
        <StatCard label="Cancellation Rate" value="2.8%" delta="-0.4%" trend="down" />
      </div>

      <Card className="card-surface">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order, name, course"
                className="pl-9"
                aria-label="Search orders"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-semibold">{o.id}</TableCell>
                    <TableCell>
                      <span className="block">{o.customer}</span>
                      <span className="text-xs text-muted-foreground">{o.phone}</span>
                    </TableCell>
                    <TableCell>{o.vehicle}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.course}
                      <span className="block text-xs">{o.level}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {o.date} · {o.time}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.instructor ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{inr(o.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.payment} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      No orders match this filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DemoNote>Sample bookings only — customer names and phone numbers are placeholders.</DemoNote>
    </>
  );
}
