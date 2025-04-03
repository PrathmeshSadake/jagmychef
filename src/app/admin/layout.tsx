import type React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className='bg-background'>
        <header className='border-b border-border p-4 flex items-center'>
          <SidebarTrigger className='mr-4' />
          <h1 className='text-xl font-semibold'>Gro Genie | Jag my Chef</h1>
        </header>
        <main className='p-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
