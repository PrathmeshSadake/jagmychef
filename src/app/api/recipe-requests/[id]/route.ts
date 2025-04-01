import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// async function sendNotificationEmail(recipeRequest) {
//   // Only send email if the status is approved
//   if (recipeRequest.status !== "approved") return;

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to: recipeRequest.email,
//       subject: `Your Recipe Request "${recipeRequest.name}" Has Been Added`,
//       html: `
//         <h1>Good News!</h1>
//         <p>We're pleased to inform you that your recipe request for "${recipeRequest.name}" has been added to our collection.</p>
//         <p>Thank you for helping us improve our recipe database!</p>
//         <p>Visit our website to check it out.</p>
//       `,
//     });

//     console.log(`Notification email sent to ${recipeRequest.email}`);
//   } catch (error) {
//     console.error("Error sending notification email:", error);
//     // We don't want to fail the API request if email sending fails
//   }
// }

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }
    const { status } = await request.json();

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the recipe request
    const updatedRequest = await prisma.recipeRequest.update({
      where: { id },
      data: { status },
    });

    // Send notification email if status is approved
    // await sendNotificationEmail(updatedRequest);

    return NextResponse.json({ success: true, recipeRequest: updatedRequest });
  } catch (error) {
    console.error("Error updating recipe request:", error);
    return NextResponse.json(
      { error: "Failed to update recipe request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(null, { status: 500 });
    }

    await prisma.recipeRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe request:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe request" },
      { status: 500 }
    );
  }
}
