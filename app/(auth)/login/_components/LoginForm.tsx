"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2, Mail } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ErrorContext } from "better-auth/react";
export default function LoginForm() {
  const [isgooglePending, setGooglTransition] = useTransition();

  const handleGoogleLogin = async () => {
    setGooglTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin/students",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Login successful");
          },
          onError: (error: ErrorContext) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  };
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900"></div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welocome back!</CardTitle>
          <CardDescription>Login with your Google Account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full container mx-auto"
            disabled={isgooglePending}
            onClick={handleGoogleLogin}
          >
            {isgooglePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <>
                <Mail className="size-4" />
                Sigin with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
