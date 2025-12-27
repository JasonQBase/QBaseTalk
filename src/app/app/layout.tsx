import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToastProvider } from "@/lib/hooks/use-toast";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

export const metadata: Metadata = {
  title: "EchoTalk - Dashboard",
  description: "Your English learning journey dashboard",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OfflineIndicator />
      <div className="bg-background flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}
