import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const { to, name, status, recipeName } = await request.json();

    if (!to || !name || !status || !recipeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subject =
      status === "approved"
        ? "Your Recipe Request Has Been Approved!"
        : "Update on Your Recipe Request";

    const statusText = status === "approved" ? "approved" : "reviewed";

    // Create HTML content based on status
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
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
              background-color: #fff;
              padding: 5px;
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
            
            p {
              margin-bottom: 15px;
              color: #000000;
            }
            
            .status-box {
              ${
                status === "approved"
                  ? "background-color: #f0fff0; border-left: 4px solid #0a0;"
                  : "background-color: #fff8f0; border-left: 4px solid #f80;"
              }
              border-radius: 4px;
              padding: 15px 20px;
              margin: 20px 0;
            }
            
            .highlight {
              font-weight: 500;
              color: #000000;
            }
            
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-top: 15px;
              font-weight: 500;
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
              <img src="https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcbjULPdTkFKWqywc8i6h2PtmJBgXDVeLSMrla" alt="Grocery Genie Logo" class="logo">
            </div>
            
            <div class="content">
              <h1>${subject}</h1>
              
              <p>Dear <span class="highlight">${name}</span>,</p>
              
              <div class="status-box">
                <p>Your request for the recipe <strong>"${recipeName}"</strong> has been ${statusText}.</p>
                
                ${
                  status === "approved"
                    ? `<p>We're excited to let you know that your recipe request has been approved and will be added to our collection soon!</p>
                     <p>Thank you for your contribution to our growing recipe database.</p>`
                    : `<p>After careful review, we've determined that we're unable to add this recipe to our collection at this time.</p>
                     <p>We appreciate your understanding and encourage you to continue submitting recipe requests.</p>`
                }
              </div>
              
              <p>If you have any questions or would like to request another recipe, please visit our app.</p>
              
              ${
                status === "approved"
                  ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button bg-white text-black">Visit JagMyChef</a>`
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>Thank you,<br><strong>JagMyChef Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "JagMyChef <no-reply@zepresume.com>",
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
