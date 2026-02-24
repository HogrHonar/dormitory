"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/has-permission";

import { expenseSchema, ExpenseFormValues } from "@/lib/zodSchemas";

export async function createExpense(
  values: ExpenseFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    const allowed = await hasPermission("expenses:create");
    if (!allowed) {
      return {
        success: false,
        error: "You do not have permission to create an expense",
      };
    }

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
    const allowed = await hasPermission("expenses:update");
    if (!allowed) {
      return {
        success: false,
        error: "You do not have permission to update an expense",
      };
    }

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
    const allowed = await hasPermission("expenses:delete");
    if (!allowed) {
      return {
        success: false,
        error: "You do not have permission to delete an expense",
      };
    }

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
