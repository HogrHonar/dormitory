import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import CreateInsuranceClient from "./page-client";

export default async function CreateInsurancePage() {
  await requireRole(ROLES.SUPER_ADMIN);

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
