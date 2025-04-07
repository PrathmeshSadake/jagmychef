"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChefHat,
  Home,
  ListChecks,
  PlusCircle,
  Settings,
  ShoppingBasket,
  Utensils,
  ChevronRight,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/admin",
      icon: <Home className='h-5 w-5' />,
      label: "Dashboard",
      tooltip: "Dashboard",
    },
    {
      href: "/admin/recipes/new",
      icon: <PlusCircle className='h-5 w-5' />,
      label: "Add Recipe",
      tooltip: "Create New Recipe",
    },
    {
      href: "/admin/manage-ingredients",
      icon: <ListChecks className='h-5 w-5' />,
      label: "Ingredients",
      tooltip: "Manage Ingredients",
    },
    {
      href: "/admin/categories",
      icon: <BarChart3 className='h-5 w-5' />,
      label: "Categories",
      tooltip: "Manage Categories",
    },
    {
      href: "/admin/units",
      icon: <Settings className='h-5 w-5' />,
      label: "Units",
      tooltip: "Manage Units",
    },
    {
      href: "/admin/lists",
      icon: <ShoppingBasket className='h-5 w-5' />,
      label: "Shopping Lists",
      tooltip: "Manage Shopping Lists",
    },
    {
      href: "/admin/notes",
      icon: <ListChecks className='h-5 w-5' />,
      label: "Notes",
      tooltip: "Manage General Notes",
    },
  ];

  return (
    <Sidebar className='border-r border-border bg-card shadow-sm'>
      <SidebarHeader className='border-b border-border p-4'>
        <Link
          href='/admin'
          className='flex items-center gap-2 hover:opacity-80 transition-opacity'
        >
          {!collapsed && (
            <img
              src='https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcFVrYtvday3iXw56pT1NbcA7nvkLUaYjlhdVB'
              className='w-auto h-16 object-contain'
            />
          )}
        </Link>
        {/* <button
          onClick={() => setCollapsed(!collapsed)}
          className='absolute right-2 top-4 p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronRight
            className={`h-5 w-5 transform transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button> */}
      </SidebarHeader>

      <SidebarContent className='py-4'>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={collapsed ? item.tooltip : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 
                  ${pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"} 
                  transition-colors rounded-md mx-2
                `}
              >
                <Link href={item.href}>
                  <div className='flex items-center gap-3'>
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='border-t border-border p-4'>
        <div className='flex flex-col gap-4'>
          {/* <Link
            href='/admin/settings'
            className='flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors rounded-md'
          >
            <Settings className='h-5 w-5' />
            {!collapsed && <span>Settings</span>}
          </Link> */}

          {!collapsed && <UserButton />}

          {!collapsed && (
            <div className='text-xs text-muted-foreground mt-2 px-4'>
              © {new Date().getFullYear()} Grocery Genie Admin
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
