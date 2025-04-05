"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface ListDownloadButtonProps {
  list: {
    name: string;
    email: string;
    Date: Date;
    recipes: Array<{
      id: string;
      name: string;
      description?: string;
      prepTime?: string;
      image?: string;
      ingredients: Array<{
        id: string;
        name: string;
        quantity: string;
        unit: string;
      }>;
      categories: Array<{
        id: string;
        name: string;
      }>;
      instructions?: string[];
      chefInstructions?: string[];
    }>;
  };
}

export function ListDownloadButton({ list }: ListDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Convert shopping list to a simple text format for the AI
  const formatShoppingListForAI = () => {
    let itemsList = "";

    list.recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        itemsList += `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}, `;
      });
    });

    return itemsList.trim();
  };

  // Send items to OpenAI and get organized grocery list
  const getOrganizedList = async () => {
    try {
      setIsLoading(true);
      const itemsText = formatShoppingListForAI();

      const response = await fetch("/api/generate-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: itemsText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate organized list");
      }

      const data = await response.json();
      return data.groceryList;
    } catch (error) {
      console.error("Error generating organized list:", error);
      toast.error("Failed to organize shopping list");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfDownload = async () => {
    try {
      setIsDownloading(true);

      // Get organized shopping list from AI
      const organizedList = await getOrganizedList();

      // Fetch all notes from the database
      const notesResponse = await fetch("/api/notes/all");
      const notes = await notesResponse.json();

      // Initialize PDF document
      const doc = new jsPDF();
      const marginLeft = 20;

      // ===== FIRST PAGE - CUSTOMER COPY =====
      let currentY = 20;

      // Add logo at the top of the first page
      try {
        const logoUrl =
          "https://1p7ctab0bz.ufs.sh/f/LSctCnwEvjMcbjULPdTkFKWqywc8i6h2PtmJBgXDVeLSMrla";
        const logoData = await fetch(logoUrl)
          .then((response) => response.blob())
          .then((blob) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          });

        if (logoData) {
          const logoWidth = 100;
          const logoHeight = 40;
          const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
          doc.addImage(
            logoData as string,
            "PNG",
            logoX,
            currentY,
            logoWidth,
            logoHeight
          );
          currentY += logoHeight + 10; // Add space after the logo
        }
      } catch (error) {
        console.error("Error adding logo:", error);
        // Continue even if logo loading fails
      }

      // Add header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "CUSTOMER COPY",
        doc.internal.pageSize.getWidth() / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      // Add Shopping List title
      doc.setFontSize(18);
      doc.text("Shopping List", marginLeft, currentY);
      currentY += 15;

      // Add customer info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${list.name}`, marginLeft, currentY);
      currentY += 6;
      doc.text(
        `Appointment Date: ${list.Date ? format(list.Date, "dd-MM-yyyy") : ""}`,
        marginLeft,
        currentY
      );
      currentY += 6;
      doc.text(
        `Appointment Day: ${list.Date ? format(list.Date, "EEEE") : ""}`,
        marginLeft,
        currentY
      );
      currentY += 15;

      // If we have an organized list from the AI, use it
      if (organizedList && organizedList.categories) {
        organizedList.categories.forEach((category: any) => {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          // Category name
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(66, 135, 245);
          doc.text(category.name, marginLeft, currentY);
          currentY += 10;

          // Reset text color
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");

          // Category items
          category.items.forEach((item: any) => {
            const itemText = `• ${item.quantity} ${item.unit || ""} ${item.name}`;
            doc.text(itemText, marginLeft, currentY);
            currentY += 6;
          });

          currentY += 5;
        });
      } else {
        // Fallback to a simple categorized list if AI fails
        const categories: any = {
          Dairy: [],
          Proteins: [],
          Produce: [],
          Condiments: [],
          Other: [],
        };

        // Simple categorization logic
        list.recipes.forEach((recipe) => {
          recipe.ingredients.forEach((ingredient) => {
            const name = ingredient.name.toLowerCase();
            if (
              name.includes("yogurt") ||
              name.includes("cheese") ||
              name.includes("milk") ||
              name.includes("cream")
            ) {
              categories.Dairy.push(ingredient);
            } else if (
              name.includes("chicken") ||
              name.includes("beef") ||
              name.includes("fish") ||
              name.includes("meat")
            ) {
              categories.Proteins.push(ingredient);
            } else if (
              name.includes("onion") ||
              name.includes("tomato") ||
              name.includes("carrot") ||
              name.includes("lettuce") ||
              name.includes("vegetable")
            ) {
              categories.Produce.push(ingredient);
            } else if (
              name.includes("sauce") ||
              name.includes("paste") ||
              name.includes("oil") ||
              name.includes("vinegar") ||
              name.includes("spice")
            ) {
              categories.Condiments.push(ingredient);
            } else {
              categories.Other.push(ingredient);
            }
          });
        });

        // Display each category
        Object.entries(categories).forEach(
          ([categoryName, items]: [any, any]) => {
            if (items.length === 0) return;

            // Check if we need a new page
            if (currentY > 250) {
              doc.addPage();
              currentY = 20;
            }

            // Category name
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(66, 135, 245);
            doc.text(categoryName, marginLeft, currentY);
            currentY += 10;

            // Reset text color
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            // Category items
            items.forEach((ingredient: any) => {
              const itemText = `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
              doc.text(itemText, marginLeft, currentY);
              currentY += 6;
            });

            currentY += 5;
          }
        );
      }

      // Add customer prep instructions section - grouped by all recipes
      doc.addPage();
      currentY = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(66, 135, 245);
      doc.text("Customer Preparation Instructions", marginLeft, currentY);
      currentY += 10;

      // Reset text color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      // Collect and display all customer instructions
      let instructionCount = 1;
      list.recipes.forEach((recipe) => {
        if (recipe.instructions && recipe.instructions.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text(`For ${recipe.name}:`, marginLeft, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");

          recipe.instructions.forEach((instruction) => {
            const splitInstruction = doc.splitTextToSize(
              `${instructionCount}. ${instruction}`,
              170
            );
            doc.text(splitInstruction, marginLeft, currentY);
            currentY += 6 * splitInstruction.length;
            instructionCount++;

            // Check if we need a new page
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }
          });

          currentY += 5;
        }
      });

      // Add recipes image gallery section
      doc.addPage();
      currentY = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(66, 135, 245);
      doc.text("Recipes Gallery", marginLeft, currentY);
      currentY += 10;

      // Reset text color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      // Add recipe images with names
      for (const recipe of list.recipes) {
        // Skip recipes without images
        if (!recipe.image) continue;

        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        try {
          // Add recipe name
          doc.setFont("helvetica", "bold");
          doc.text(recipe.name, marginLeft, currentY);
          currentY += 8;
          doc.setFont("helvetica", "normal");

          // Convert image URL to base64 for jsPDF
          const imgData = await fetch(recipe.image)
            .then((response) => response.blob())
            .then((blob) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            });

          // Add image to PDF
          if (imgData) {
            const imgWidth = 160;
            const imgHeight = 100;
            doc.addImage(
              imgData as string,
              "JPEG",
              marginLeft,
              currentY,
              imgWidth,
              imgHeight
            );
            currentY += imgHeight + 15; // Add space after the image
          }
        } catch (error) {
          console.error(`Error adding image for ${recipe.name}:`, error);
          // Continue with the next recipe even if this one fails
          currentY += 10;
        }
      }

      // Add notes section before the office use page
      if (notes && notes.length > 0) {
        doc.addPage();
        currentY = 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(66, 135, 245);
        doc.text("Notes", marginLeft, currentY);
        currentY += 10;

        // Reset text color
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Display all notes
        for (const note of notes) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          const splitNote = doc.splitTextToSize(note.content, 170);
          doc.text(splitNote, marginLeft, currentY);
          currentY += 6 * splitNote.length + 5; // Add space between notes
        }
      }

      // ===== OFFICE USE SECTION =====
      doc.addPage();
      currentY = 20;

      // Add header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "FOR OFFICE USE ONLY",
        doc.internal.pageSize.getWidth() / 2,
        currentY,
        { align: "center" }
      );
      currentY += 20;

      // Add title/name
      doc.setFontSize(18);
      doc.text(list.name, marginLeft, currentY);
      currentY += 15;

      // Add user info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Email: ${list.email || ""}`, marginLeft, currentY);
      currentY += 6;
      doc.text(
        `Appointment Date: ${
          list.Date ? format(list.Date, "dd-MMM-yyyy") : ""
        }`,
        marginLeft,
        currentY
      );
      currentY += 6;
      doc.text(
        `Appointment Day: ${list.Date ? format(list.Date, "EEEE") : ""}`,
        marginLeft,
        currentY
      );
      currentY += 15;

      // Recipes section - each recipe starts on a new page
      list.recipes.forEach((recipe, recipeIndex) => {
        // Start each recipe on a new page (except the first one)
        if (recipeIndex > 0) {
          doc.addPage();
          currentY = 20;
        }

        // Recipe name
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(66, 135, 245);
        doc.text(
          `Recipe ${recipeIndex + 1}: ${recipe.name}`,
          marginLeft,
          currentY
        );
        currentY += 10;

        // Reset text color
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Description
        if (recipe.description) {
          const splitDescription = doc.splitTextToSize(recipe.description, 170);
          doc.text(splitDescription, marginLeft, currentY);
          currentY += 6 * splitDescription.length;
        }

        // Prep Time
        if (recipe.prepTime) {
          doc.text(`Prep Time: ${recipe.prepTime}`, marginLeft, currentY);
          currentY += 6;
        }

        // Categories
        if (recipe.categories.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Categories:", marginLeft, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");
          const categoriesText = recipe.categories
            .map((cat) => cat.name)
            .join(", ");
          doc.text(categoriesText, marginLeft, currentY);
          currentY += 6;
        }

        // Ingredients
        if (recipe.ingredients.length > 0) {
          currentY += 4;
          doc.setFont("helvetica", "bold");
          doc.text("Ingredients:", marginLeft, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");

          recipe.ingredients.forEach((ingredient) => {
            const ingredientText = `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
            doc.text(ingredientText, marginLeft, currentY);
            currentY += 6;
          });
        }

        // Customer Instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
          currentY += 4;
          doc.setFont("helvetica", "bold");
          doc.text("Customer Prep Instructions:", marginLeft, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");

          recipe.instructions.forEach((instruction, idx) => {
            const splitInstruction = doc.splitTextToSize(
              `${idx + 1}. ${instruction}`,
              170
            );
            doc.text(splitInstruction, marginLeft, currentY);
            currentY += 6 * splitInstruction.length;
          });
        }

        // Chef Instructions
        if (recipe.chefInstructions && recipe.chefInstructions.length > 0) {
          currentY += 4;
          doc.setFont("helvetica", "bold");
          doc.text("Chef Instructions:", marginLeft, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");

          recipe.chefInstructions.forEach((instruction, idx) => {
            const splitInstruction = doc.splitTextToSize(
              `${idx + 1}. ${instruction}`,
              170
            );
            doc.text(splitInstruction, marginLeft, currentY);
            currentY += 6 * splitInstruction.length;
          });
        }
      });

      // Save the PDF
      doc.save(`${list.name}-list.pdf`);
      toast.success("List downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handlePdfDownload}
      disabled={isDownloading || isLoading}
      className='flex items-center gap-2'
    >
      <DownloadIcon className='h-4 w-4' />
      {isDownloading || isLoading ? "Generating..." : "Download List"}
    </Button>
  );
}
