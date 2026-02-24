import { prisma } from "@/lib/prisma";
import CreateInsuranceClient from "./page-client";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function CreateInsurancePage() {
  const canRead = await hasPermission("insurance:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  // Only students who are assigned to a room
  const students = await prisma.student.findMany({
    where: {
      roomId: { not: null },
      isActive: true,
    },
    select: {
      id: true,
      studentCode: true,
      fullNameKu: true,
    },
    orderBy: { fullNameKu: "asc" },
  });

  return (
    <section className="container mx-auto px-4 max-w-xl py-6">
      <CreateInsuranceClient students={students} />
    </section>
  );
}
