import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, date, time, recipeIds } = data;

    if (
      !name ||
      !email ||
      !date ||
      !time ||
      !recipeIds ||
      !Array.isArray(recipeIds)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new shopping list with connected recipes
    const newList = await prisma.list.create({
      data: {
        name,
        email,
        Date: date, // Match the schema field name (capitalized)
        Time: time, // Match the schema field name (capitalized)
        recipes: {
          connect: recipeIds.map((id: string) => ({ id })),
        },
      },
      include: {
        recipes: true,
      },
    });

    return NextResponse.json({ success: true, list: newList });
  } catch (error) {
    console.error("Error saving shopping list:", error);
    return NextResponse.json(
      { error: "Failed to save shopping list" },
      { status: 500 }
    );
  }
}
