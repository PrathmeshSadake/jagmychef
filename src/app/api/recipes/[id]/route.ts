import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = await params.id;

//     // Delete the recipe (ingredients will be deleted automatically due to onDelete: Cascade)
//     await prisma.selection.deleteMany({
//       where: {
//         recipeId: id,
//       },
//     });

//     await prisma.recipe.delete({
//       where: {
//         id,
//       },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     console.error("Error deleting recipe:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
