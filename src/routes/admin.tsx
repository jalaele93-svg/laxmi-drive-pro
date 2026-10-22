import { Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { redirect: "/admin" } });
    }
    const { data: allowed, error } = await supabase.rpc("is_staff", { _user_id: user.id });
    if (error || !allowed) {
      // Check user_roles table directly as well for robustness
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "staff"])
        .maybeSingle();

      if (!roleRow) {
        throw redirect({ to: "/auth", search: { redirect: "/admin" } });
      }
    }
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Could not sign out. Please try again.");
      return;
    }
    await navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
  }
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
            <Badge
              variant="outline"
              className="ml-auto border-transparent bg-accent/15 text-accent-foreground"
            >
              Staff
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title="Sign out"
              onClick={signOut}
            >
              <LogOut className="size-4" />
            </Button>
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
