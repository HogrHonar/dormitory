// components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  Building,
  GalleryVerticalEnd,
  House,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type SimpleItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

type NestedItem = {
  title: string;
  url: string;
  subitems?: SimpleItem[];
};

type GroupItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: (SimpleItem | NestedItem)[];
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  permissions: Set<string>;
}

// ─── Nav builder — filters items based on permissions ─────────────────────────

// ─── Nav builder ─────────────────────────────────────────────

function buildNav(permissions: Set<string>): GroupItem[] {
  const can = (p: string) => permissions.has(p);

  const dormitoryItems: SimpleItem[] = [
    can("dormitories:read")
      ? { title: "ناونیشانی بەشە ناوخۆییەکان", url: "/admin/dormitory" }
      : undefined,
    can("rooms:read") ? { title: "ژوورەکان", url: "/admin/room" } : undefined,
    can("students:read")
      ? { title: "فێرخوازان", url: "/admin/students" }
      : undefined,
    can("insurance:read")
      ? { title: "بارمتە", url: "/admin/insurance" }
      : undefined,
    can("payments:read")
      ? { title: "ڕاپۆرتی کرێیەکان", url: "/admin/reports/payments" }
      : undefined,
    can("outgoing-payments:read")
      ? { title: "ڕادەستکردنی کرێ", url: "/admin/outgoing-payment" }
      : undefined,
    can("categories:read")
      ? { title: "جۆرەکان", url: "/admin/categories" }
      : undefined,
    can("expenses:read")
      ? { title: "خەرجییەکان", url: "/admin/expenses" }
      : undefined,
  ].filter(Boolean) as SimpleItem[];

  const roleItems: SimpleItem[] = [
    can("roles:read")
      ? { title: "دەسەڵاتەکان", url: "/admin/roles" }
      : undefined,
  ].filter(Boolean) as SimpleItem[];

  const instituteSubitems: SimpleItem[] = [
    can("departments:read")
      ? { title: "بەشەکان", url: "/admin/settings/instittue/departments" }
      : undefined,
    can("fees:read")
      ? { title: "کرێی بەشە ناوخۆییەکان", url: "/admin/installment" }
      : undefined,
  ].filter(Boolean) as SimpleItem[];

  const academySubitems: SimpleItem[] = [
    can("academic-years:read")
      ? { title: "ساڵی خوێندن", url: "/admin/settings/academy/educationalyear" }
      : undefined,
  ].filter(Boolean) as SimpleItem[];

  const settingsItems: NestedItem[] = [
    instituteSubitems.length
      ? { title: "پەیمانگە", url: "#", subitems: instituteSubitems }
      : undefined,
    academySubitems.length
      ? { title: "ئەکادیمی", url: "#", subitems: academySubitems }
      : undefined,
    roleItems.length
      ? { title: "هەژمار", url: "#", subitems: roleItems }
      : undefined,
  ].filter(Boolean) as NestedItem[];

  const nav: GroupItem[] = [
    {
      title: "سەرەکی",
      url: "/admin",
      icon: House,
    },

    dormitoryItems.length
      ? {
          title: "بەرێوەبردنی بەشە ناوخۆیی",
          url: "#",
          icon: Building,
          items: dormitoryItems,
        }
      : undefined,

    settingsItems.length
      ? {
          title: "ڕێکخستنەکان",
          url: "#",
          icon: Settings2,
          items: settingsItems,
        }
      : undefined,
  ].filter(Boolean) as GroupItem[];

  return nav;
}
// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar({ permissions, ...props }: AppSidebarProps) {
  const { data: session } = authClient.useSession();

  const user = {
    name: session?.user?.name ?? "Guest",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "",
  };

  const navItems = buildNav(permissions);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[{ name: "BTVI", logo: GalleryVerticalEnd, plan: "BTVI" }]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
