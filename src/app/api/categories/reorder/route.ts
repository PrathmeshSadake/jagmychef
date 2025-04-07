import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { categories } = await request.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Categories array is required" },
        { status: 400 }
      );
    }

    // Update each category with its new order
    const updates = categories.map(({ id, order }) => {
      return prisma.category.update({
        where: { id },
        data: { order },
      });
    });

    // Execute all updates in a transaction
    await prisma.$transaction(updates);

    return NextResponse.json(
      { message: "Categories reordered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reordering categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
