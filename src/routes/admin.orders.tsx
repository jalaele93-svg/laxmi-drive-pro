import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Laxmi Admin" }, { name: "description", content: "Manage orders for Laxmi Driving Training staff." }, { property: "og:title", content: "Orders — Laxmi Admin" }, { property: "og:description", content: "Manage orders for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="orders" />,
});
