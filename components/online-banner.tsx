"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OnlineStatusToast() {
  const isOnline = useOnlineStatus();
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    if (!isOnline) {
      // Show persistent warning
      toastId.current = toast.error("No internet connection", {
        description: "Please check your network. Some features may not work.",
        duration: Infinity,
        icon: <WifiOff className="h-4 w-4" />,
      });
    } else {
      // Dismiss offline toast if exists
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;

        // Optional: Show reconnected message
        toast.success("Back online", {
          description: "Connection restored successfully.",
          icon: <Wifi className="h-4 w-4" />,
        });
      }
    }
  }, [isOnline]);

  return null;
}
