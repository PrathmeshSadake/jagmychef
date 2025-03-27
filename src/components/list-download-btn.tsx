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

  const handlePdfDownload = async () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();

      // Set initial positions
      const marginLeft = 20;
      let currentY = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(list.name, marginLeft, currentY);
      currentY += 10;

      // Add user info
      currentY += 5;
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
      currentY += 10;

      // Recipes section
      list.recipes.forEach((recipe, recipeIndex) => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Recipe name
        doc.setFontSize(16);
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

          recipe.chefInstructions.forEach((instruction) => {
            const splitInstruction = doc.splitTextToSize(instruction, 170);
            doc.text(splitInstruction, marginLeft, currentY);
            currentY += 6 * splitInstruction.length;
          });
        }

        // Add space between recipes
        currentY += 10;
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
      disabled={isDownloading}
      className='flex items-center gap-2'
    >
      <DownloadIcon className='h-4 w-4' />
      Download List
    </Button>
  );
}
