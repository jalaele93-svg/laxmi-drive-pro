import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/allocation")({
  head: () => ({ meta: [{ title: "Allocation — Laxmi Admin" }, { name: "description", content: "Manage allocation for Laxmi Driving Training staff." }, { property: "og:title", content: "Allocation — Laxmi Admin" }, { property: "og:description", content: "Manage allocation for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="allocation" />,
});
