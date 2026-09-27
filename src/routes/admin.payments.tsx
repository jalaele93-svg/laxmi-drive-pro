import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Laxmi Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="payments" />,
});
