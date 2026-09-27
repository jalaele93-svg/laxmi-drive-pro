import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/allocation")({
  head: () => ({ meta: [{ title: "Allocation — Laxmi Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="allocation" />,
});
