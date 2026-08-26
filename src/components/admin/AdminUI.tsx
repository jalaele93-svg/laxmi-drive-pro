import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
}) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <Card className="card-surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-2xl font-extrabold text-foreground">{value}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend === "down" ? "text-destructive" : "text-success",
              )}
            >
              <TrendIcon className="size-3.5" />
              {delta}
            </span>
          ) : null}
          {hint ? <span className="text-muted-foreground">{hint}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "border-transparent bg-success/12 text-success",
  warning: "border-transparent bg-accent/15 text-accent-foreground",
  danger: "border-transparent bg-destructive/12 text-destructive",
  info: "border-transparent bg-primary/10 text-primary",
  neutral: "border-transparent bg-muted text-muted-foreground",
};

export function statusTone(status: string): Tone {
  switch (status) {
    case "Paid":
    case "Completed":
    case "Available":
      return "success";
    case "Pending":
    case "New":
    case "On Lesson":
      return "warning";
    case "Failed":
    case "Cancelled":
      return "danger";
    case "Allocated":
    case "In Progress":
      return "info";
    default:
      return "neutral";
  }
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-semibold", toneClass[statusTone(status)])}>
      {status}
    </Badge>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
      {children}
    </p>
  );
}
