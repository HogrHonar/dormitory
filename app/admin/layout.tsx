// app/layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { getUserPermissions } from "@/lib/has-permission";
import { OnlineStatusToast } from "@/components/online-banner";
import { SiteHeader } from "@/components/site-header";

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
          <SiteHeader />

          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>

          <Toaster />
        </SidebarInset>

        <AppSidebar side="right" variant="inset" permissions={permissions} />
      </SidebarProvider>
    </>
  );
}
