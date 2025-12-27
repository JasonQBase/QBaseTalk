"use client";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-destructive text-destructive-foreground animate-in slide-in-from-bottom-2 fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span>You are offline</span>
    </div>
  );
}
