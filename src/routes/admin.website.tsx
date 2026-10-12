import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditor } from "@/components/admin/WebsiteEditor";

export const Route = createFileRoute("/admin/website")({
  head: () => ({ meta: [
    { title: "Website Editor — Laxmi Admin" },
    { name: "description", content: "Edit Laxmi Driving Training courses, pricing, instructor profiles, student reviews and frequently asked questions." },
    { property: "og:title", content: "Website Editor — Laxmi Admin" },
    { property: "og:description", content: "Manage public website content for Laxmi Driving Training." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: WebsiteEditor,
});