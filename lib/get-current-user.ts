// get-current-user.ts
import "server-only";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  if (!user || !user.isAllowed) {
    return notFound();
  }

  return user;
});
