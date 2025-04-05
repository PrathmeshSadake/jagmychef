import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/db";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY!);

interface Note {
  id: string;
  content: string;
  order: number;
}

export async function POST(request: Request) {
  try {
    const {
      to,
      name,
      recipeNames,
      shoppingListItems,
      selectedRecipeIds,
      subject,
    } = await request.json();

    if (!to || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Fetch all instructions from selected recipes
    let allInstructions: string[] = [];
    if (selectedRecipeIds && selectedRecipeIds.length > 0) {
      const selectedRecipes = await prisma.recipe.findMany({
        where: {
          id: {
            in: selectedRecipeIds,
          },
        },
        select: {
          instructions: true,
        },
      });

      // Combine all instructions from all recipes
      selectedRecipes.forEach((recipe) => {
        if (recipe.instructions && recipe.instructions.length > 0) {
          allInstructions = [...allInstructions, ...recipe.instructions];
        }
      });
    }

    // Fetch general notes
    const generalNotes = await prisma.note.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Create recipe list HTML
    const recipeListHTML =
      recipeNames && recipeNames.length > 0
        ? recipeNames.map((name: string) => `<li>${name}</li>`).join("")
        : "<li>No recipes selected</li>";

    // Create numbered instructions HTML
    const instructionsHTML =
      allInstructions.length > 0
        ? allInstructions
            .map((instruction, index) => `<li>${instruction}</li>`)
            .join("")
        : "<li>No preparation instructions available</li>";

    // Create general notes HTML
    const generalNotesHTML =
      generalNotes.length > 0
        ? `
          <h2>General Notes</h2>
          <div class="general-notes">
            ${generalNotes.map((note: Note) => `<p>${note.content}</p>`).join("")}
          </div>
        `
        : "";

    // Email HTML template with improved design and logo
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Customized Grocery List</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #000000;
              max-width: 600px;
              margin: 0 auto;
              padding: 0;
              background-color: #f9f9f9;
            }
            
            .container {
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              margin: 20px;
            }
            
            .header {
              background-color: #000;
              padding: 30px;
              text-align: center;
            }
            
            .logo {
              max-width: 180px;
              height: auto;
              margin-bottom: 10px;
            }
            
            .content {
              padding: 30px;
            }
            
            h1 {
              color: #000000;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            
            h2 {
              color: #000000;
              font-size: 20px;
              font-weight: 600;
              margin-top: 25px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eaeaea;
            }
            
            p {
              margin-bottom: 15px;
              color: #000000;
            }
            
            ul {
              padding-left: 20px;
              margin-bottom: 20px;
            }
            
            li {
              margin-bottom: 8px;
              color: #000000;
            }
            
            .recipe-list {
              background-color: #f5f8ff;
              border-radius: 8px;
              padding: 15px 20px;
              margin-top: 10px;
            }
            
            .shopping-list {
              background-color: #f5fff8;
              border-radius: 8px;
              padding: 15px 20px; 
              margin-top: 10px;
            }
            
            .prep-instructions {
              background-color: #fff5f8;
              border-radius: 8px;
              padding: 15px 20px; 
              margin-top: 10px;
            }
            
            .general-notes {
              background-color: #f5f5ff;
              border-radius: 8px;
              padding: 15px 20px; 
              margin-top: 10px;
            }
            
            .footer {
              margin-top: 30px;
              padding: 20px 30px;
              background-color: #f0f5ff;
              border-top: 1px solid #eaeaea;
              font-size: 14px;
              color: #000000;
              text-align: center;
            }
            
            .highlight {
              font-weight: 500;
              color: #000000;
            }
            
            @media only screen and (max-width: 480px) {
              .container {
                margin: 10px;
              }
              
              .header, .content, .footer {
                padding: 20px;
              }
              
              h1 {
                font-size: 22px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcbzQNr1TkFKWqywc8i6h2PtmJBgXDVeLSMrla" alt="GroGenie Logo" class="logo">
            </div>
            
            <div class="content">
              <h1>Your Customized Grocery List is Ready!</h1>
              
              <p>Dear <span class="highlight">${name}</span>,</p>
              
              <p>We hope this message finds you well!</p>
              
              <p>Attached is your personalized grocery list, designed to make your shopping experience easier and more efficient. Here is the menu you selected:</p>
              
              <h2>Your Selected Recipes</h2>
              <div class="recipe-list">
                <ul>
                  ${recipeListHTML}
                </ul>
              </div>
              
              <h2>Your Shopping List</h2>
              <div class="shopping-list">
                ${shoppingListItems}
              </div>
              
              <h2>Prep Instructions for Your Appointment</h2>
              <div class="prep-instructions">
                <ol>
                  ${instructionsHTML}
                </ol>
              </div>
              
              ${generalNotesHTML}
              
              <p>If you have any questions or need further assistance, please contact us via the JagMyChef app, as responses to this email are unmonitored.</p>
            </div>
            
            <div class="footer">
              <p>Thank you,<br><strong>GroGenie, Jag My Chef</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "GroGenie <no-reply@zepresume.com>",
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
