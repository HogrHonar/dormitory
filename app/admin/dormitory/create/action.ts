"use server";

import { DormitorySchemaType, DormitorySchema } from "@/lib/zodSchemas";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/has-permission";

export async function createDormitoryAction(values: DormitorySchemaType) {
  const allowed = await hasPermission("dormitories:create");
  if (!allowed)
    return { error: "You do not have permission to create a dormitory" };

  const parsed = DormitorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, managerId, description } = parsed.data;

  try {
    // Check if dormitory with same title already exists
    const existingDormitory = await prisma.dormitory.findUnique({
      where: { title },
    });

    if (existingDormitory) {
      return {
        error:
          "نوێخانەیەک بەم ناونیشانە پێشتر هەیە (A dormitory with this title already exists)",
      };
    }

    // Check if this manager already manages another dormitory
    const managerHasDormitory = await prisma.dormitory.findFirst({
      where: { managerId },
    });

    if (managerHasDormitory) {
      return {
        error:
          "ئەم بەڕێوەبەرە پێشتر نوێخانەیەکی هەیە (This manager already manages a dormitory)",
      };
    }

    const dormitory = await prisma.dormitory.create({
      data: {
        title,
        managerId,
        description,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      status: "success",
      message: "Dormitory created successfully",
      data: dormitory,
    };
  } catch {
    return {
      error: `Failed to create dormitory: $ {"Unknown error"}`,
    };
  }
}

export async function deleteDormitoryAction(dormitoryId: string) {
  const allowed = await hasPermission("dormitories:delete");
  if (!allowed)
    return { error: "You do not have permission to delete a dormitory" };

  try {
    await prisma.dormitory.delete({
      where: {
        id: dormitoryId,
      },
    });

    revalidatePath("/admin/dormitory");

    return {
      status: "success",
      message: "Dormitory deleted successfully",
    };
  } catch (error) {
    return {
      error: "Failed to delete dormitory. It may have associated rooms.",
    };
  }
}
