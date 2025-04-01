// app/api/recipe-requests/route.js
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, description, link, email } = await request.json();

    // Validate required fields
    if (!name || !description || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new recipe request
    const recipeRequest = await prisma.recipeRequest.create({
      data: {
        name,
        description,
        link: link || null,
        email,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, recipeRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe request:", error);
    return NextResponse.json(
      { error: "Failed to create recipe request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const recipeRequests = await prisma.recipeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ recipeRequests });
  } catch (error) {
    console.error("Error fetching recipe requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe requests" },
      { status: 500 }
    );
  }
}
