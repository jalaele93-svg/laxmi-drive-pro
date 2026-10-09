import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partners — Laxmi Admin" }, { name: "description", content: "Manage partners for Laxmi Driving Training staff." }, { property: "og:title", content: "Partners — Laxmi Admin" }, { property: "og:description", content: "Manage partners for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="partners" />,
});
