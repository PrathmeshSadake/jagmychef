import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - Use standalone version with built-in fonts
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import OpenAI from "openai";
import prisma from "@/lib/db";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest, { params }: { params: any }) {
  const id = await params.id;
  try {
    // Fetch the list data with related recipes and their details
    const list = await prisma.list.findUnique({
      where: {
        id,
      },
      include: {
        recipes: {
          include: {
            ingredients: true,
            categories: true,
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Prepare data to send to OpenAI
    const recipeData = list.recipes.map((recipe) => ({
      name: recipe.name,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
      instructions: recipe.instructions,
      chefInstructions: recipe.chefInstructions,
    }));

    // Schema description for OpenAI to follow
    const schemaDescription = `
    {
      "clientDetails": {
        "name": "string",
        "appointmentDate": "string",
        "cookingTime": "string",
        "cleaningTime": "string"
      },
      "menu": [
        {
          "dishNumber": "number",
          "dishName": "string"
        }
      ],
      "cookingWorkflow": [
        {
          "dishNumber": "number",
          "dishName": "string",
          "steps": ["string"]
        }
      ],
      "preCookingChecklist": ["string"],
      "assemblyAndPacking": ["string"],
      "cleaningProtocol": ["string"],
      "completionSignOff": {
        "chefName": "string",
        "assistantName": "string"
      }
    }`;

    // Request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional chef workflow generator. 
          Given the following recipes and client information, create a detailed cooking workflow 
          in the exact JSON format described by the schema. Be practical, efficient, and precise 
          in your instructions. The output MUST strictly follow the provided schema with no additional fields.`,
        },
        {
          role: "user",
          content: `Client: ${list.name}
          Appointment Date: ${list.Date.toISOString().split("T")[0]}
          
          Recipes:
          ${JSON.stringify(recipeData, null, 2)}
          
          Generate a complete chef workflow following exactly this JSON schema:
          ${schemaDescription}
          
          The response must be valid JSON that can be parsed directly.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the generated workflow
    const workflowData = JSON.parse(
      completion.choices[0].message.content || ""
    );
    console.log(workflowData);

    // Create a new PDF document with basic configuration
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true, // This enables buffering which can help with async operations
    });

    // Create a buffer to store the PDF
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    // Create a promise to resolve when the PDF is complete
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
    });

    // Start building the PDF
    // Title
    doc
      .fontSize(18)
      .text("Chef's Appointment Workflow", { align: "center" })
      .moveDown(1);

    // Section 1: Assigned Time & Client Details
    doc.fontSize(14).text("1. Assigned Time & Client Details").moveDown(0.5);

    doc
      .fontSize(12)
      .text(`- Cooking Time: ${workflowData.clientDetails.cookingTime}`)
      .text(`- Cleaning Time: ${workflowData.clientDetails.cleaningTime}`)
      .text(`- Client Name: ${workflowData.clientDetails.name}`)
      .text(`- Appointment Date: ${workflowData.clientDetails.appointmentDate}`)
      .moveDown(1);

    // Section 2: Menu Overview
    doc.fontSize(14).text("2. Menu Overview").moveDown(0.5);

    workflowData.menu.forEach((dish: any) => {
      doc.fontSize(12).text(`[ ] Dish ${dish.dishNumber}: ${dish.dishName}`);
    });
    doc.moveDown(1);

    // Section 3: Cooking Workflow
    doc.fontSize(14).text("3. Cooking Workflow").moveDown(0.5);

    workflowData.cookingWorkflow.forEach((dish: any) => {
      doc
        .fontSize(13)
        .text(`Dish ${dish.dishNumber}: ${dish.dishName}`)
        .moveDown(0.3);

      dish.steps.forEach((step: any) => {
        doc.fontSize(12).text(`[ ] ${step}`);
      });
      doc.moveDown(0.5);
    });

    // Section 4: Pre-Cooking Checklist
    doc.fontSize(14).text("4. Pre-Cooking Checklist").moveDown(0.5);

    workflowData.preCookingChecklist.forEach((step: any) => {
      doc.fontSize(12).text(`[ ] ${step}`);
    });
    doc.moveDown(1);

    // Section 5: Assembly & Packing
    doc.fontSize(14).text("5. Assembly & Packing").moveDown(0.5);

    workflowData.assemblyAndPacking.forEach((step: any) => {
      doc.fontSize(12).text(`[ ] ${step}`);
    });
    doc.moveDown(1);

    // Section 6: Standard Cleaning Protocol
    doc.fontSize(14).text("6. Standard Cleaning Protocol").moveDown(0.5);

    workflowData.cleaningProtocol.forEach((step: any) => {
      doc.fontSize(12).text(`[ ] ${step}`);
    });
    doc.moveDown(1);

    // Section 7: Completion Sign-Off
    doc.fontSize(14).text("7. Completion Sign-Off").moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Chef Name: ${workflowData.completionSignOff.chefName}`)
      .text(`Assistant Name: ${workflowData.completionSignOff.assistantName}`)
      .moveDown(1);

    doc
      .text(
        "[ ] I confirm that all the checklist as per the above workflow was adhered to by me and my assistant."
      )
      .moveDown(0.5);

    doc
      .text("Chef Signature: ____________________________")
      .text("Assistant Signature: ________________________")
      .text("Date: ____________________");

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be generated
    const pdfBuffer = await pdfPromise;

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="chef_workflow_${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating workflow PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate workflow PDF" },
      { status: 500 }
    );
  }
}
