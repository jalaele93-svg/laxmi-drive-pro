import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partners — Laxmi Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="partners" />,
});
