import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, name, recipeNames, shoppingListItems, subject } =
      await request.json();

    if (!to || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Create recipe list HTML
    const recipeListHTML =
      recipeNames && recipeNames.length > 0
        ? recipeNames.map((name: string) => `<li>${name}</li>`).join("")
        : "<li>No recipes selected</li>";

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Customized Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #4281f5; }
            h2 { color: #4281f5; margin-top: 20px; }
            h3 { margin-top: 15px; color: #555; }
            ul { padding-left: 20px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <h1>Your Customized Grocery List is Ready!</h1>
          <p>Dear ${name},</p>
          <p>We hope this message finds you well!</p>
          <p>Attached is your personalized grocery list, designed to make your shopping experience easier and more efficient. Here is the menu you selected:</p>
          
          <ul>
            ${recipeListHTML}
          </ul>
          
          <h2>Your Shopping List</h2>
          ${shoppingListItems}
          
          <p>If you have any questions or need further assistance, please contact us via the JagMyChef app, as responses to this email are unmonitored.</p>
          
          <div class="footer">
            <p>Thank you,<br>GroGenie, Jag My Chef.</p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "no-reply@zepresume.com",
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
