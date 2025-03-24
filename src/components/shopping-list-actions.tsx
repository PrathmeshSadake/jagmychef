"use client";

import { useState } from "react";
import { Download, FileText, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserDetailsDialog } from "./user-info-form";
import { selectedRecipeIdsAtom, userDetailsAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { toast } from "sonner";

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}

interface ShoppingListActionsProps {
  shoppingList: ShoppingListByCategory;
  selectedRecipeIds?: string[]; // Add this prop for the recipe IDs
}

export function ShoppingListActions({
  shoppingList,
  selectedRecipeIds = [],
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
        doc.text(`Date: ${userDetails.date || ""}`, marginLeft, currentY);
        currentY += 6;
        doc.text(`Time: ${userDetails.time || ""}`, marginLeft, currentY);
        currentY += 10;
      } else {
        currentY += 10;
      }

      // Process organized list from OpenAI
      if (organizedList && organizedList.categories) {
        // For each category
        organizedList.categories.forEach((category: any) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }

          // Add category header
          doc.setFontSize(16);
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
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }

            // Format item text
            const itemText = `• ${item.name}: ${item.quantity} ${
              item.unit || ""
            }`;
            doc.text(itemText, marginLeft, currentY);
            currentY += 6;

            // Add calories on a separate line if available
            if (item.calories) {
              doc.setFont("helvetica", "italic");
              doc.text(
                `  (${item.calories} calories per serving)`,
                marginLeft,
                currentY
              );
              doc.setFont("helvetica", "normal");
              currentY += 6;
            }
          });

          // Add extra space after each category
          currentY += 6;
        });
      } else {
        // Fallback to original format if AI organization fails
        Object.entries(shoppingList).forEach(([category, items]) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }

          // Add category header
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(66, 135, 245);
          doc.text(category, marginLeft, currentY);
          currentY += 8;

          // Reset text color for items
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");

          // Add each item under this category
          items.forEach((item) => {
            // Check if we need a new page
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }

            const itemText = `• ${item.name}: ${item.quantity} ${item.unit}`;
            doc.text(itemText, marginLeft, currentY);
            currentY += 6;
          });

          // Add extra space after each category
          currentY += 6;
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

  const handleDownload = () => {
    setActionType("pdf");
    // Check if user details are available
    if (userDetails && Object.keys(userDetails).length > 0) {
      // Details exist, proceed directly
      handlePdfDownload();
    } else {
      // No details, open dialog
      setIsDialogOpen(true);
    }
  };

  const handleSaveClick = () => {
    setActionType("save");
    // Check if user details are available
    if (userDetails && Object.keys(userDetails).length > 0) {
      // Details exist, proceed directly
      handleSaveToDatabase();
    } else {
      // No details, open dialog
      setIsDialogOpen(true);
    }
  };

  const handleDialogSave = () => {
    setIsDialogOpen(false);
    // Now proceed with the action based on type
    if (actionType === "pdf") {
      handlePdfDownload();
    } else {
      handleSaveToDatabase();
    }
  };

  const handleSaveToDatabase = async () => {
    try {
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

      toast.success("Shopping list saved successfully!");
      router.refresh(); // Refresh the page to show updated data

      setUserDetails(null);
      setSelectedRecipeIds([]);
      router.replace("/");
    } catch (error) {
      console.error("Error saving shopping list:", error);
      toast.error("Failed to save shopping list");
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
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
      </Button>
    </div>
  );
}
