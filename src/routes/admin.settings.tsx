import { createFileRoute } from "@tanstack/react-router";
import { Operations } from "@/components/admin/Operations";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Laxmi Admin" },
      { name: "description", content: "Manage settings for Laxmi Driving Training staff." },
      { property: "og:title", content: "Settings — Laxmi Admin" },
      { property: "og:description", content: "Manage settings for Laxmi Driving Training staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Operations view="settings" />,
});
