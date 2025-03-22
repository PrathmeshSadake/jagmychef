"use client";

import { useState } from "react";
import { Download, FileText, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserDetailsDialog } from "./user-info-form";
import { userDetailsAtom } from "@/lib/atoms";
import { useAtom } from "jotai";

interface ShoppingListActionsProps {
  shoppingList: Record<string, any[]>;
}

export function ShoppingListActions({
  shoppingList,
}: ShoppingListActionsProps) {
  const [userDetails] = useAtom(userDetailsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handlePdfDownload = async () => {
    // Dynamically import jsPDF to ensure it only loads on client side
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Menu", 14, 22);
    doc.setFontSize(12);

    // Prepare table data
    const tableData: any = [];
    Object.entries(shoppingList).forEach(([category, items]) => {
      items.forEach((item) => {
        tableData.push([category, item.name, item.quantity, item.unit]);
      });
    });

    // Add table
    autoTable(doc, {
      head: [["Category", "Ingredient", "Quantity", "Unit"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 135, 245] },
    });

    // Save the PDF
    doc.save("shopping-list.pdf");
  };

  const handleDownload = () => {
    // Check if user details are available
    if (userDetails) {
      // Details exist, proceed directly
      handlePdfDownload();
    } else {
      // No details, open dialog
      setIsDialogOpen(true);
    }
  };

  const handleDialogSave = () => {
    setIsDialogOpen(false);
    // Now proceed with the action
    handlePdfDownload();
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handleDownload}
      >
        <FileText className='h-4 w-4' />
        PDF
      </Button>
      <UserDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleDialogSave}
      />
    </div>
  );
}
