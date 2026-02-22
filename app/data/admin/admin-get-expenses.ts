import { prisma } from "@/lib/prisma";

export async function adminGetExpenses() {
  return prisma.expense.findMany({
    include: {
      category: {
        select: { id: true, name: true },
      },
      dorm: {
        select: { id: true, title: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function adminGetExpenseFormData() {
  const [categories, dorms] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.dormitory.findMany({ select: { id: true, title: true } }),
  ]);
  return { categories, dorms };
}
