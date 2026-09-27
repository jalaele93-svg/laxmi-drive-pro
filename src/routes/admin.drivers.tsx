import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/drivers")({
  head: () => ({ meta: [{ title: "Drivers — Laxmi Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="drivers" />,
});
