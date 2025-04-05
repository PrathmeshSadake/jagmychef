import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    console.log(name);

    if (!name) {
      return NextResponse.json(
        { message: "Missing Required Field" },
        { status: 500 }
      );
    }

    const decodedName = decodeURIComponent(name as string);

    console.log("decodedName", decodedName);

    const category = await prisma.category.findFirst({
      where: { name: decodedName },
      include: {
        recipes: {
          where: {
            status: "published",
          },
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
    console.log(recipes);

    return NextResponse.json(recipes);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
