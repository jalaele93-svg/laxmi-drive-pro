import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    const { data: allowed, error } = await supabase.rpc("is_staff", { _user_id: user.id });
    if (error || !allowed) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Internal admin dashboard for Laxmi Driving Training: bookings, payments, instructors, slot allocation, customers and reports.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Dashboard — Laxmi Driving Training" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Manage bookings, payments, instructors and reports for Laxmi Driving Training.",
      },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="font-display text-sm font-bold tracking-tight">
              Laxmi Driving Training — Admin
            </span>
            <Badge variant="outline" className="ml-auto border-transparent bg-accent/15 text-accent-foreground">Staff</Badge>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              {/* Required: nested admin routes render here. */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
