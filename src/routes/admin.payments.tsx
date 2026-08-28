import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AdminPageHeader, DemoNote, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, payments } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Laxmi Admin" },
      {
        name: "description",
        content: "Track lesson payments, methods, gateway fees and settlement status.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Payments,
});

const filters = ["All", "Paid", "Pending", "Refunded", "Failed"] as const;

function Payments() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (q === "" ||
          p.id.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  const collected = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter((p) => p.status === "Refunded").reduce((s, p) => s + p.amount, 0);
  const fees = payments.reduce((s, p) => s + p.fee, 0);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Lesson payments with method, gateway fee and settlement status."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected" value={inr(collected)} delta="+6.8%" trend="up" hint="this week" />
        <StatCard label="Pending" value={inr(pending)} hint="awaiting confirmation" />
        <StatCard label="Refunded" value={inr(refunded)} hint="cancelled lessons" />
        <StatCard label="Gateway Fees" value={inr(fees)} hint="card & net banking" />
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
                placeholder="Search payment, order, name"
                className="pl-9"
                aria-label="Search payments"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold">{p.id}</TableCell>
                    <TableCell className="text-muted-foreground">{p.orderId}</TableCell>
                    <TableCell>{p.customer}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{inr(p.fee)}</TableCell>
                    <TableCell className="text-right font-semibold">{inr(p.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No payments match this filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DemoNote>Sample transactions only — connect a payment provider to show live settlements.</DemoNote>
    </>
  );
}
