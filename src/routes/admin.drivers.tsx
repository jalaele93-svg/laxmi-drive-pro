import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/drivers")({
  head: () => ({ meta: [{ title: "Drivers — Laxmi Admin" }, { name: "description", content: "Manage drivers for Laxmi Driving Training staff." }, { property: "og:title", content: "Drivers — Laxmi Admin" }, { property: "og:description", content: "Manage drivers for Laxmi Driving Training staff." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Operations view="drivers" />,
});
