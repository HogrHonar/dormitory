"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function AdminGetCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    if (!categories) {
      return [];
    }
    return categories;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function createCategory(name: string) {
  try {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.delete({
      where: {
        id,
      },
    });
    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.log(error);
    return null;
  }
}
