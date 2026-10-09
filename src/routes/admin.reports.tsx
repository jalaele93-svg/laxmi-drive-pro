import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Laxmi Admin" }, { name: "description", content: "Manage reports for Laxmi Driving Training staff." }, { property: "og:title", content: "Reports — Laxmi Admin" }, { property: "og:description", content: "Manage reports for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="reports" />,
});
