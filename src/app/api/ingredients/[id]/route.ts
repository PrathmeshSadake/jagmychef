import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }

    await prisma.ingredient.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
