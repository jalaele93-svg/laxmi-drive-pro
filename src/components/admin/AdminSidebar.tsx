import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  IdCard,
  CalendarClock,
  Users,
  BarChart3,
  Settings,
  CarFront,
  ArrowLeft,
  FilePenLine,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Edit website", url: "/admin/website", icon: FilePenLine },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Partners", url: "/admin/partners", icon: CarFront },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Instructor roster", url: "/admin/drivers", icon: IdCard },
  { title: "Allocation", url: "/admin/allocation", icon: CalendarClock },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
            LD
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold leading-tight">Laxmi Admin</p>
            <p className="truncate text-xs text-muted-foreground">Staff workspace</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url)
                    }
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to website">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                <span>Back to website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
