import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Save shopping list items
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { listId, items } = data;

    if (!listId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete existing items for this list to avoid duplicates
    await prisma.shoppingListItem.deleteMany({
      where: {
        listId: listId,
      },
    });

    // Create new shopping list items
    const createdItems = await prisma.shoppingListItem.createMany({
      data: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity || "",
        unit: item.unit || "",
        category: item.category,
        isChecked: item.isChecked || false,
        listId: listId,
      })),
    });

    return NextResponse.json({ success: true, count: createdItems.count });
  } catch (error) {
    console.error("Error saving shopping list items:", error);
    return NextResponse.json(
      { error: "Failed to save shopping list items" },
      { status: 500 }
    );
  }
}

// Get shopping list items for a specific list
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const listId = url.searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        { error: "List ID is required" },
        { status: 400 }
      );
    }

    const items = await prisma.shoppingListItem.findMany({
      where: {
        listId: listId,
      },
      orderBy: {
        category: "asc",
      },
    });

    // Group items by category
    const itemsByCategory = items.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return NextResponse.json({ success: true, items: itemsByCategory });
  } catch (error) {
    console.error("Error fetching shopping list items:", error);
    return NextResponse.json(
      { error: "Failed to fetch shopping list items" },
      { status: 500 }
    );
  }
}
