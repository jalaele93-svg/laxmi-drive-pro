import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Laxmi Admin" },
      { name: "description", content: "Manage customers for Laxmi Driving Training staff." },
      { property: "og:title", content: "Customers — Laxmi Admin" },
      { property: "og:description", content: "Manage customers for Laxmi Driving Training staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Operations view="customers" />,
});
