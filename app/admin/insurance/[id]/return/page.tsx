import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";
import ReturnInsuranceClient from "./client";

interface ReturnInsurancePageProps {
  params: { id: string };
}

export default async function ReturnInsurancePage({
  params,
}: ReturnInsurancePageProps) {
  const canRead = await hasPermission("insurance:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

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

  if (!insurance || insurance.status !== "ACTIVE") {
    redirect("/unauthorized");
  }

  return (
    <section className="container mx-auto px-4 max-w-xl py-6">
      <ReturnInsuranceClient insurance={insurance} />
    </section>
  );
}
