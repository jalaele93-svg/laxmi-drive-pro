import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AdminPageHeader, DemoNote, StatCard } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers, inr } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Laxmi Admin" },
      {
        name: "description",
        content: "Learner directory with course progress, contact details and lifetime spend.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Customers,
});

function Customers() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [query]);

  const spend = customers.reduce((s, c) => s + c.spend, 0);
  const active = customers.filter((c) => c.lessonsDone < c.lessonsTotal).length;
  const graduated = customers.filter((c) => c.lessonsDone >= c.lessonsTotal).length;

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Learner directory with lesson progress, contact details and lifetime spend."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Learners" value={String(customers.length)} hint="in directory" />
        <StatCard label="In Training" value={String(active)} hint="course not finished" />
        <StatCard label="Course Completed" value={String(graduated)} hint="all lessons done" />
        <StatCard label="Lifetime Value" value={inr(spend)} delta="+5.4%" trend="up" />
      </div>

      <Card className="card-surface">
        <CardContent className="space-y-4 pt-6">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or email"
              className="pl-9"
              aria-label="Search customers"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="min-w-40">Progress</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="block font-semibold">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.id}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="block">{c.phone}</span>
                      <span className="text-xs">{c.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                        {c.vehicle}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="mb-1 text-xs text-muted-foreground">
                        {c.lessonsDone}/{c.lessonsTotal} lessons
                      </div>
                      <Progress value={(c.lessonsDone / c.lessonsTotal) * 100} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{c.joined}</TableCell>
                    <TableCell className="text-right font-semibold">{inr(c.spend)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No customers match this search.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DemoNote>Learner names, phone numbers and emails are placeholders — not real customer data.</DemoNote>
    </>
  );
}
