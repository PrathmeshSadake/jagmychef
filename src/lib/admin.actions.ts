"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get all lists
export async function getLists() {
  try {
    const lists = await prisma.list.findMany({
      include: {
        recipes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert dates to strings to make them serializable
    return lists.map((list) => ({
      ...list,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt?.toISOString(),
      Date: list.Date.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching lists:", error);
    throw new Error("Failed to fetch lists");
  }
}

// Delete a single list
export async function deleteList(listId: string) {
  try {
    await prisma.list.delete({
      where: { id: listId },
    });

    revalidatePath("/admin/lists");
    return { success: true };
  } catch (error) {
    console.error("Error deleting list:", error);
    throw new Error("Failed to delete list");
  }
}

// Delete multiple lists
export async function deleteBulkLists(listIds: string[]) {
  try {
    // Use Prisma's deleteMany to delete multiple records at once
    await prisma.list.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });

    revalidatePath("/admin/lists");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting lists:", error);
    throw new Error("Failed to delete lists");
  }
}
