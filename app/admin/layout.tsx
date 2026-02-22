// app/layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { getUserPermissions } from "@/lib/has-permission";
import { OnlineStatusToast } from "@/components/online-banner";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = await getUserPermissions();

  return (
    <>
      <OnlineStatusToast />

      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>

          <Toaster />
        </SidebarInset>

        <AppSidebar side="right" variant="inset" permissions={permissions} />
      </SidebarProvider>
    </>
  );
}
