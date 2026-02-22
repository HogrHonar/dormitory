"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useSignout() {
  const router = useRouter();
  const handleSignout = async function signout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("You have been signed out.");
        },
        onError: () => {
          toast.error("Failed to sign out.");
        },
      },
    });
  };
  return {
    handleSignout,
  };
}
