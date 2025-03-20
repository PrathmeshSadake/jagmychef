import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET all units
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// CREATE a new unit
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, symbol } = data;
    
    if (!name || name.trim() === "" || !symbol || symbol.trim() === "") {
      return NextResponse.json(
        { error: "Unit name and symbol are required" },
        { status: 400 }
      );
    }
    
    const unit = await prisma.unit.create({
      data: {
        name,
        symbol,
      },
    });
    
    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}

// UPDATE an existing unit
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, symbol } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }
    
    if (!name || name.trim() === "" || !symbol || symbol.trim() === "") {
      return NextResponse.json(
        { error: "Unit name and symbol are required" },
        { status: 400 }
      );
    }
    
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        name,
        symbol,
      },
    });
    
    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// DELETE a unit
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      );
    }
    
    await prisma.unit.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}