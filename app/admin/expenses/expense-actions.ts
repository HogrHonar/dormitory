"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";
import { expenseSchema, ExpenseFormValues } from "@/lib/zodSchemas";

export async function createExpense(
  values: ExpenseFormValues,
): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentUser();

  try {
    const allowed = await hasPermission("expenses:create");
    if (!allowed) {
      await auditLog({
        action: "CREATE",
        entityType: "Expense",
        userId: session?.id,
        userEmail: session?.email,
        userRole: session?.role?.name,
        severity: "WARNING",
        description: "Unauthorized attempt to create expense",
      });
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

    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
        description: description || null,
        date: new Date(date),
        documentUrl: documentUrl || null,
        categoryId,
        dormId: dormId || null,
      },
      include: {
        category: { select: { name: true } },
        dorm: { select: { title: true } },
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Expense",
      entityId: expense.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created expense "${expense.title}"`,
      newValues: {
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        category: expense.category.name,
        dorm: expense.dorm?.title ?? null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("createExpense error:", error);
    await auditLog({
      action: "CREATE",
      entityType: "Expense",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create expense",
    });
    return { success: false, error: "هەڵەیەک ڕوویدا لە دروستکردندا" };
  }
}

export async function updateExpense(
  id: string,
  values: ExpenseFormValues,
): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentUser();

  try {
    const allowed = await hasPermission("expenses:update");
    if (!allowed) {
      await auditLog({
        action: "UPDATE",
        entityType: "Expense",
        entityId: id,
        userId: session?.id,
        userEmail: session?.email,
        userRole: session?.role?.name,
        severity: "WARNING",
        description: "Unauthorized attempt to update expense",
      });
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

    const old = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        dorm: { select: { title: true } },
      },
    });

    const updated = await prisma.expense.update({
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
      include: {
        category: { select: { name: true } },
        dorm: { select: { title: true } },
      },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "Expense",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Updated expense "${updated.title}"`,
      oldValues: {
        title: old?.title,
        amount: old?.amount,
        date: old?.date,
        category: old?.category.name,
        dorm: old?.dorm?.title ?? null,
      },
      newValues: {
        title: updated.title,
        amount: updated.amount,
        date: updated.date,
        category: updated.category.name,
        dorm: updated.dorm?.title ?? null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("updateExpense error:", error);
    await auditLog({
      action: "UPDATE",
      entityType: "Expense",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to update expense",
    });
    return { success: false, error: "هەڵەیەک ڕوویدا لە نوێکردنەوەدا" };
  }
}

export async function deleteExpense(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getCurrentUser();

  try {
    const allowed = await hasPermission("expenses:delete");
    if (!allowed) {
      await auditLog({
        action: "DELETE",
        entityType: "Expense",
        entityId: id,
        userId: session?.id,
        userEmail: session?.email,
        userRole: session?.role?.name,
        severity: "WARNING",
        description: "Unauthorized attempt to delete expense",
      });
      return {
        success: false,
        error: "You do not have permission to delete an expense",
      };
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        dorm: { select: { title: true } },
      },
    });

    await prisma.expense.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "Expense",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted expense "${expense?.title}"`,
      oldValues: {
        title: expense?.title,
        amount: expense?.amount,
        date: expense?.date,
        category: expense?.category.name,
        dorm: expense?.dorm?.title ?? null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("deleteExpense error:", error);
    await auditLog({
      action: "DELETE",
      entityType: "Expense",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete expense",
    });
    return { success: false, error: "هەڵەیەک ڕوویدا لە سڕینەوەدا" };
  }
}
