import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, image, order } = data;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // If no order is provided, get the highest order and add 1
    let categoryOrder = order;
    if (categoryOrder === undefined) {
      const categories = await prisma.category.findMany({
        orderBy: {
          order: "desc",
        },
        take: 1,
      });

      categoryOrder = categories.length > 0 ? categories[0].order + 1 : 0;
    }

    const category = await prisma.category.create({
      data: {
        name,
        image:
          image ||
          "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        order: categoryOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
