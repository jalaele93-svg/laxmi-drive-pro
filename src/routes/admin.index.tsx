import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — Laxmi Admin" }, { name: "description", content: "Manage overview for Laxmi Driving Training staff." }, { property: "og:title", content: "Overview — Laxmi Admin" }, { property: "og:description", content: "Manage overview for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="overview" />,
});
