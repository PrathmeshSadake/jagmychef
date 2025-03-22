import { createRecipe, updateRecipe } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await createRecipe(formData);

    if (result && !result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

// export async function PUT(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const recipeId = formData.get("id") as string;

//     if (!recipeId) {
//       return NextResponse.json(
//         { success: false, error: "Recipe ID is required" },
//         { status: 400 }
//       );
//     }

//     const result = await updateRecipe(recipeId, formData);

//     if (result && !result.success) {
//       return NextResponse.json(result, { status: 400 });
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating recipe:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to update recipe" },
//       { status: 500 }
//     );
//   }
// }
