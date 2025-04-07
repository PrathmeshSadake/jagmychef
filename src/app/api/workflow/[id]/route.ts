import { NextRequest, NextResponse } from "next/server";
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

    // Return the workflow data as JSON
    return NextResponse.json({
      workflowData,
      clientName: list.name,
      appointmentDate: list.Date.toISOString().split("T")[0],
      logoUrl:
        "https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcFVrYtvday3iXw56pT1NbcA7nvkLUaYjlhdVB",
    });
  } catch (error) {
    console.error("Error generating workflow:", error);
    return NextResponse.json(
      { error: "Failed to generate workflow data" },
      { status: 500 }
    );
  }
}
