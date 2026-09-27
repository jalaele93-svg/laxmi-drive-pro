import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Laxmi Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="reports" />,
});
