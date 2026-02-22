"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEducationYears() {
  return prisma.educationalYear.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function deleteEducationalYear(id: string) {
  await prisma.educationalYear.delete({
    where: { id },
  });

  revalidatePath("/admin/settings/academy/educationalyear");
}

export async function updateEducationalYear(id: string, name: string) {
  await prisma.educationalYear.update({
    where: { id },
    data: {
      name,
    },
  });

  revalidatePath("/admin/settings/academy/educationalyear");
}

export async function createEducationalYear(name: string) {
  await prisma.educationalYear.create({
    data: {
      name,
    },
  });

  revalidatePath("/admin/settings/academy/educationalyear");
}
