import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReturnInsuranceClient from "./client";

interface ReturnInsurancePageProps {
  params: { id: string };
}

export default async function ReturnInsurancePage({
  params,
}: ReturnInsurancePageProps) {
  await requireRole(ROLES.SUPER_ADMIN);
  const { id } = await params;

  const insurance = await prisma.dormInsurance.findUnique({
    where: { id },
    select: {
      id: true,
      amountPaid: true,
      status: true,
      student: {
        select: {
          fullNameKu: true,
          studentCode: true,
        },
      },
    },
  });

  if (!insurance || insurance.status !== "ACTIVE") notFound();

  return (
    <section className="container mx-auto px-4 max-w-xl py-6">
      <ReturnInsuranceClient insurance={insurance} />
    </section>
  );
}
