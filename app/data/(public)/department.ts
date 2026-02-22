"use server";

import { prisma } from "@/lib/prisma";
import { DepartmentSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  return await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
}

export type Department = Awaited<ReturnType<typeof getDepartments>>[0];

export async function createDepartment(data: DepartmentSchemaType) {
  await prisma.department.create({
    data,
  });
  revalidatePath("/admin/settings/instittue/departments");
}

export async function deleteDepartment(id: string) {
  await prisma.department.delete({
    where: { id },
  });

  revalidatePath("/admin/settings/instittue/departments");
}

export async function updateDepartment(id: string, code: string, name: string) {
  await prisma.department.update({
    where: { id },
    data: {
      code,
      name,
    },
  });

  revalidatePath("/admin/settings/instittue/departments");
}
