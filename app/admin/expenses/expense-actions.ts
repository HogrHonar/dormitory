"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { expenseSchema, ExpenseFormValues } from "@/lib/zodSchemas";

export async function createExpense(
  values: ExpenseFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(ROLES.SUPER_ADMIN);

    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: "داتاکان دروست نین" };
    }

    const {
      title,
      amount,
      description,
      date,
      documentUrl,
      categoryId,
      dormId,
    } = parsed.data;

    await prisma.expense.create({
      data: {
        title,
        amount,
        description: description || null,
        date: new Date(date),
        documentUrl: documentUrl || null,
        categoryId,
        dormId: dormId || null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("createExpense error:", error);
    return { success: false, error: "هەڵەیەک ڕوویدا لە دروستکردندا" };
  }
}

export async function updateExpense(
  id: string,
  values: ExpenseFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(ROLES.SUPER_ADMIN);

    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: "داتاکان دروست نین" };
    }

    const {
      title,
      amount,
      description,
      date,
      documentUrl,
      categoryId,
      dormId,
    } = parsed.data;

    await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount,
        description: description || null,
        date: new Date(date),
        documentUrl: documentUrl || null,
        categoryId,
        dormId: dormId || null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("updateExpense error:", error);
    return { success: false, error: "هەڵەیەک ڕوویدا لە نوێکردنەوەدا" };
  }
}

export async function deleteExpense(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(ROLES.SUPER_ADMIN);

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("deleteExpense error:", error);
    return { success: false, error: "هەڵەیەک ڕوویدا لە سڕینەوەدا" };
  }
}
