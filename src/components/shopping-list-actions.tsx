"use client";

import { useState } from "react";
import { Download, FileText, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ShoppingListActionsProps {
  shoppingList: Record<string, any[]>;
}

export function ShoppingListActions({
  shoppingList,
}: ShoppingListActionsProps) {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    let csvContent = "Category,Ingredient,Quantity,Unit\n";

    Object.entries(shoppingList).forEach(([category, items]) => {
      items.forEach((item) => {
        csvContent += `${category},${item.name},${item.quantity},${item.unit}\n`;
      });
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shopping-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfDownload = async () => {
    // Dynamically import jsPDF to ensure it only loads on client side
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Shopping List", 14, 22);
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

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all selected recipes?")) {
      setIsClearing(true);

      try {
        // In a real app, you would call an API to clear all selections
        // For now, we'll just refresh the page
        router.refresh();
      } catch (error) {
        console.error("Error clearing selections:", error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handlePrint}
      >
        <Printer className='h-4 w-4' />
        Print
      </Button>
      {/* <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handleDownload}
      >
        <Download className='h-4 w-4' />
        CSV
      </Button> */}
      <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={handlePdfDownload}
      >
        <FileText className='h-4 w-4' />
        PDF
      </Button>
      {/* <Button variant="destructive" size="sm" className="gap-1" onClick={handleClearAll} disabled={isClearing}>
        <Trash2 className="h-4 w-4" />
        Clear All
      </Button> */}
    </div>
  );
}
