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
  checked?: boolean;
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
  selectedRecipeIds?: string[];
  selectedRecipes?: RecipeDetails[];
  checkedItems?: {
    [category: string]: boolean[];
  };
}

export function ShoppingListActions({
  shoppingList,
  selectedRecipeIds = [],
  selectedRecipes = [],
  checkedItems = {},
}: ShoppingListActionsProps) {
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [_, setSelectedRecipeIds] = useAtom(selectedRecipeIdsAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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

  // Get the checked status for an item
  const isItemChecked = (category: string, index: number): boolean => {
    return checkedItems[category]?.[index] || false;
  };

  // Create email content with shopping list details
  const createEmailContent = () => {
    // Get recipe names for the email
    const recipeNames = selectedRecipes.map((recipe) => recipe.name);

    // Format shopping list items for email
    let shoppingListItems = "";
    Object.entries(shoppingList).forEach(([category, items]) => {
      shoppingListItems += `<h3>${category}</h3><ul>`;

      items.forEach((item, index) => {
        const isChecked = isItemChecked(category, index);
        shoppingListItems += `<li${isChecked ? ' style="text-decoration: line-through;"' : ""}>`;
        shoppingListItems += `${item.name}: ${item.quantity} ${item.unit}`;
        shoppingListItems += `${isChecked ? " (already have)" : ""}`;
        shoppingListItems += `</li>`;
      });

      shoppingListItems += `</ul>`;
    });

    return {
      recipeNames,
      shoppingListItems,
    };
  };

  // Send email to customer with shopping list
  const sendCustomerEmail = async () => {
    try {
      if (!userDetails?.email) {
        console.error("Customer email is missing");
        return false;
      }

      const { recipeNames, shoppingListItems } = createEmailContent();

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userDetails.email,
          name: userDetails.name,
          recipeNames: recipeNames,
          shoppingListItems: shoppingListItems,
          subject: "Your Customized Grocery List is Ready!",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  // Modified handlePdfDownload function with checkbox support
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

            // Draw checkbox
            doc.rect(marginLeft, currentY - 4, 4, 4);

            // Find if this item is checked in any category
            let isChecked = false;
            Object.entries(shoppingList).forEach(([listCategory, items]) => {
              items.forEach((listItem, index) => {
                if (
                  listItem.name.toLowerCase() === item.name.toLowerCase() &&
                  isItemChecked(listCategory, index)
                ) {
                  isChecked = true;
                }
              });
            });

            // If checked, draw an X in the checkbox
            if (isChecked) {
              doc.line(marginLeft, currentY - 4, marginLeft + 4, currentY);
              doc.line(marginLeft, currentY, marginLeft + 4, currentY - 4);
            }

            // Format text differently based on checked status
            const itemText = `${item.name}: ${item.quantity} ${item.unit || ""}`;

            if (isChecked) {
              // Draw line through text for checked items
              const textWidth = doc.getTextWidth(itemText);
              doc.line(
                marginLeft + 6,
                currentY - 2,
                marginLeft + 6 + textWidth,
                currentY - 2
              );
            }

            // Add item text after checkbox
            doc.text(itemText, marginLeft + 6, currentY);
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
        let step = 1;
        selectedRecipes.forEach((recipe) => {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          // Reset to normal font for instructions
          doc.setFont("helvetica", "normal");

          // Standard instructions
          if (recipe.instructions && recipe.instructions.length > 0) {
            recipe.instructions.forEach((instruction) => {
              // Check if we need a new page
              if (currentY > 250) {
                doc.addPage();
                currentY = 20;
              }

              const instructionText = `${step}. ${instruction}`;

              // Wrap long instructions
              const splitText = doc.splitTextToSize(instructionText, 170);
              doc.text(splitText, marginLeft, currentY);
              currentY += 6 * splitText.length;
              step = step + 1;
            });
          }
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

      // Generate PDF
      await handlePdfDownload();

      // Send email with shopping list
      const emailSent = await sendCustomerEmail();

      if (emailSent) {
        // Show success dialog instead of toast
        setShowSuccessDialog(true);
      } else {
        toast.warning("Shopping list saved but email could not be sent");
      }

      // Don't reset state here, we'll do it when the dialog is closed
    } catch (error) {
      console.error("Error saving shopping list:", error);
      toast.error("Failed to save shopping list");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle dialog close/continue
  const handleSuccessDialogClose = () => {
    // Reset all states
    setUserDetails(null);
    setSelectedRecipeIds([]);
    setShowSuccessDialog(false);
    router.replace("/");
  };
  // At the very end of your component, before the final closing bracket
  return (
    <>
      <div className='flex items-center gap-2'>
        <Button className='w-full' onClick={handleSaveToDatabase}>
          {isLoading ? (
            <Loader className='h-4 w-5 animate-spin' />
          ) : (
            "Submit Menu and Download PDF"
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-md w-full'>
            <h2 className='text-xl font-bold mb-4'>Thank You!</h2>
            <p className='mb-6'>
              Thank you for selecting your menu for the appointment! Your
              grocery list has been sent to your email.
            </p>
            <div className='flex justify-end'>
              <Button onClick={handleSuccessDialogClose}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
