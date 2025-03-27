"use client";

import { useState } from "react";
import { Download, FileText, Loader, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserDetailsDialog } from "./user-info-form";
import { selectedRecipeIdsAtom, userDetailsAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { format } from "date-fns";

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}
interface RecipeDetails {
  id: string;
  name: string;
  instructions: string[];
  chefInstructions?: string[];
}

interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}

interface ShoppingListActionsProps {
  shoppingList: ShoppingListByCategory;
  selectedRecipeIds?: string[]; // Add this prop for the recipe IDs
  selectedRecipes?: RecipeDetails[]; // Add this prop for recipe details
}

export function ShoppingListActions({
  shoppingList,
  selectedRecipeIds = [],
  selectedRecipes = [],
}: ShoppingListActionsProps) {
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [_, setSelectedRecipeIds] = useAtom(selectedRecipeIdsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"pdf" | "save">("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Convert shopping list to a simple text format for the AI
  const formatShoppingListForAI = () => {
    let itemsList = "";

    Object.entries(shoppingList).forEach(([category, items]) => {
      items.forEach((item) => {
        itemsList += `${item.quantity} ${item.unit} ${item.name}, `;
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
      // Get organized list from OpenAI
      const organizedList = await getOrganizedList();
      if (!organizedList) {
        toast.error("Couldn't generate the organized list");
        return;
      }

      // Dynamically import jsPDF to ensure it only loads on client side
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF();

      // Set initial positions
      const marginLeft = 20;
      let currentY = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Shopping List", marginLeft, currentY);
      currentY += 10;

      // Add user info if available
      if (userDetails) {
        currentY += 5;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${userDetails.name || ""}`, marginLeft, currentY);
        currentY += 6;
        doc.text(
          `Appointment Date: ${
            format(new Date(userDetails.date), "dd-MM-yyyy") || ""
          }`,
          marginLeft,
          currentY
        );
        currentY += 6;
        doc.text(
          `Appointment Day: ${
            format(new Date(userDetails.date), "EEEE") || ""
          }`,
          marginLeft,
          currentY
        );
        currentY += 10;
      } else {
        currentY += 10;
      }

      // Ingredients section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(66, 135, 245);
      doc.text("Ingredients", marginLeft, currentY);
      currentY += 8;

      // Reset text color for items
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Process organized list from OpenAI
      if (organizedList && organizedList.categories) {
        organizedList.categories.forEach((category: any) => {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          // Add category header
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(66, 135, 245);
          doc.text(category.name, marginLeft, currentY);
          currentY += 8;

          // Reset text color for items
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");

          // Add each item under this category
          category.items.forEach((item: any) => {
            // Check if we need a new page
            if (currentY > 250) {
              doc.addPage();
              currentY = 20;
            }

            const itemText = `• ${item.name}: ${item.quantity} ${
              item.unit || ""
            }`;
            doc.text(itemText, marginLeft, currentY);
            currentY += 6;
          });

          // Add extra space after each category
          currentY += 6;
        });
      }

      // Recipe Instructions section
      if (selectedRecipes.length > 0) {
        // Add a page break if needed
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(66, 135, 245);
        doc.text("Client Prep Instructions", marginLeft, currentY);
        currentY += 10;

        // Reset text color for instructions
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        selectedRecipes.forEach((recipe) => {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          // Recipe name
          // doc.setFont("helvetica", "bold");
          // doc.text(recipe.name, marginLeft, currentY);
          // currentY += 8;

          // Reset to normal font for instructions
          doc.setFont("helvetica", "normal");

          // Standard instructions
          if (recipe.instructions && recipe.instructions.length > 0) {
            recipe.instructions.forEach((instruction, index) => {
              // Check if we need a new page
              if (currentY > 250) {
                doc.addPage();
                currentY = 20;
              }

              const instructionText = `${index + 1}. ${instruction}`;

              // Wrap long instructions
              const splitText = doc.splitTextToSize(instructionText, 170);
              doc.text(splitText, marginLeft, currentY);
              currentY += 6 * splitText.length;
            });
          }

          // Chef's special instructions (if available)
          // if (recipe.chefInstructions && recipe.chefInstructions.length > 0) {
          //   currentY += 6;
          //   doc.setFont("helvetica", "bold");
          //   doc.text("Chef's Notes:", marginLeft, currentY);
          //   currentY += 8;

          //   doc.setFont("helvetica", "normal");
          //   recipe.chefInstructions.forEach((instruction) => {
          //     // Check if we need a new page
          //     if (currentY > 250) {
          //       doc.addPage();
          //       currentY = 20;
          //     }

          //     const splitText = doc.splitTextToSize(instruction, 170);
          //     doc.text(splitText, marginLeft, currentY);
          //     currentY += 6 * splitText.length;
          //   });
          // }

          // Add extra space between recipes
          currentY += 10;
        });
      }

      // Save the PDF
      doc.save("shopping-list.pdf");
      toast.success("Shopping list downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSaveToDatabase = async () => {
    try {
      setIsLoading(true);
      if (!userDetails) {
        toast.error("User details are required");
        return;
      }

      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userDetails.name,
          email: userDetails.email,
          date: userDetails.date,
          time: userDetails.time,
          recipeIds: selectedRecipeIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save shopping list");
      }

      await handlePdfDownload();

      toast.success("Shopping list saved successfully!");
      setUserDetails(null);
      setSelectedRecipeIds([]);
      router.replace("/");
    } catch (error) {
      console.error("Error saving shopping list:", error);
      toast.error("Failed to save shopping list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {/* <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handleDownload}
        disabled={isLoading}
      >
        <FileText className='h-4 w-4' />
        {isLoading ? "Processing..." : "PDF"}
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handleSaveClick}
        disabled={isLoading}
      >
        <Save className='h-4 w-4' />
        Save
      </Button> */}
      <Button className='w-full' onClick={handleSaveToDatabase}>
        {isLoading ? (
          <Loader className='h-4 w-5 animate-spin' />
        ) : (
          "Submit Menu and Download PDF"
        )}
      </Button>
    </div>
  );
}
