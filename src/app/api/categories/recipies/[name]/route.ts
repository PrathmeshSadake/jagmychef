import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(null, { status: 500 });
    }

    const decodedName = decodeURIComponent(name as string);

    console.log("decodedName", decodedName);

    const category = await prisma.category.findFirst({
      where: { name: decodedName },
      include: {
        recipes: {
          include: {
            categories: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const recipes = category.recipes;

    return NextResponse.json(recipes);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
