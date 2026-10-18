import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Laxmi Admin" },
      { name: "description", content: "Manage payments for Laxmi Driving Training staff." },
      { property: "og:title", content: "Payments — Laxmi Admin" },
      { property: "og:description", content: "Manage payments for Laxmi Driving Training staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Operations view="payments" />,
});
