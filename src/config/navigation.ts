import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

export type NavItem = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
};

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    titleKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleKey: "products",
    href: "/products",
    icon: Package,
  },
  {
    titleKey: "sales",
    href: "/sales",
    icon: ShoppingBag,
  },
  {
    titleKey: "movements",
    href: "/movements",
    icon: Receipt,
  },
  {
    titleKey: "reports",
    href: "/reports",
    icon: ClipboardList,
  },
  {
    titleKey: "users",
    href: "/users",
    icon: Users,
  },
  {
    titleKey: "settings",
    href: "/settings",
    icon: Settings,
  },
];

