import { NextRequest } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || items.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "No items provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Define the schema for the grocery list
    const schema = {
      type: "object",
      properties: {
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "string" },
                    calories: { type: "number" },
                    unit: { type: "string" },
                  },
                  required: ["name", "quantity"],
                },
              },
            },
            required: ["name", "items"],
          },
        },
      },
      required: ["categories"],
    };

    const prompt = `
Organize the following shopping list items into a well-structured grocery list JSON object,
categorized by food type.

Here are the items:
${items}

Please format the response as a JSON object strictly following this schema:
${JSON.stringify(schema, null, 2)}

Make sure to:
1. Include a diverse set of categories (Produce, Dairy, Proteins, Grains, Snacks, Beverages, Frozen Foods, Canned Goods, Condiments, Baking Supplies, etc.)
2. Provide quantity and unit when possible
3. Include approximate calories per standard serving where appropriate
4. Combine similar items and sum quantities when appropriate
5. Make sure the response is valid JSON

Example format (this is just for illustration - add more categories as needed):
{
  "categories": [
    {
      "name": "Produce",
      "items": [
        {
          "name": "Apple",
          "quantity": "5",
          "unit": "whole",
          "calories": 95
        },
        {
          "name": "Spinach",
          "quantity": "1",
          "unit": "bag",
          "calories": 7
        }
      ]
    },
    {
      "name": "Proteins",
      "items": [
        {
          "name": "Chicken Breast",
          "quantity": "2",
          "unit": "lbs",
          "calories": 165
        }
      ]
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or another appropriate model
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that organizes grocery lists into structured JSON format with detailed nutritional information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for consistent JSON formatting
      response_format: { type: "json_object" }, // Ensures response is valid JSON
    });

    // Parse the JSON response to validate it
    const jsonResponse = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return new Response(
      JSON.stringify({
        groceryList: jsonResponse,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating grocery list:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate grocery list",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
