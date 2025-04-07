"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface WorkflowDownloadButtonProps {
  listId: string;
}

export function WorkflowDownloadButton({
  listId,
}: WorkflowDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Request the workflow data from our API
      const response = await fetch(`/api/workflow/${listId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate workflow data");
      }

      // Get the JSON data from the response
      const data = await response.json();
      const { workflowData, clientName, appointmentDate, logoUrl } = data;

      // Generate PDF on the client side
      await generatePDF(workflowData, clientName, appointmentDate, logoUrl);

      toast.success("Workflow PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading workflow PDF:", error);
      toast.error("Failed to download workflow PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDF = async (
    workflowData: any,
    clientName: string,
    appointmentDate: string,
    logoUrl: string
  ) => {
    const { default: jsPDF } = await import("jspdf");

    // Create a new PDF document
    const doc = new jsPDF();

    // Set initial positions and constants
    const marginLeft = 20;
    let currentY = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 2 * marginLeft - 5; // Subtract 5 for safety margin

    // Add logo to the top left with proper aspect ratio
    try {
      // Fetch the image from the URL
      const imageResponse = await fetch(logoUrl);
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        const logoData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });

        // Add the image to the PDF with proper dimensions to maintain aspect ratio
        doc.addImage(logoData, "PNG", marginLeft, currentY, 60, 40);
        currentY += 45; // Add space after logo
      }
    } catch (error) {
      console.log("Error adding logo to PDF, continuing without it:", error);
      currentY += 5;
    }

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Chef's Appointment Workflow", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 12;

    // Section 1: Assigned Time & Client Details
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245); // Blue color for section headers
    doc.text("1. Assigned Time & Client Details", marginLeft, currentY);
    currentY += 8;

    // Create details section
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color to black

    // First row
    doc.text(
      `Cooking Time: ${workflowData.clientDetails.cookingTime}`,
      marginLeft,
      currentY
    );
    doc.text(
      `Client Name: ${workflowData.clientDetails.name}`,
      marginLeft + contentWidth / 2,
      currentY
    );
    currentY += 8;

    // Second row
    doc.text(
      `Cleaning Time: ${workflowData.clientDetails.cleaningTime}`,
      marginLeft,
      currentY
    );
    doc.text(
      `Appointment Date: ${workflowData.clientDetails.appointmentDate}`,
      marginLeft + contentWidth / 2,
      currentY
    );
    currentY += 12;

    // Section 2: Menu Overview
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("2. Menu Overview", marginLeft, currentY);
    currentY += 8;

    // Menu items
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    workflowData.menu.forEach((dish: any) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      // Draw checkbox
      doc.rect(marginLeft, currentY - 4, 4, 4);

      const menuItemText = `Dish ${dish.dishNumber}: ${dish.dishName}`;
      const lines = doc.splitTextToSize(menuItemText, contentWidth - 10);
      doc.text(lines, marginLeft + 6, currentY);
      currentY += lines.length * 6;
    });
    currentY += 8;

    // Section 3: Cooking Workflow
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("3. Cooking Workflow", marginLeft, currentY);
    currentY += 8;

    // Reset text color for content
    doc.setTextColor(0, 0, 0);

    // Cooking workflow steps
    workflowData.cookingWorkflow.forEach((dish: any) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Dish ${dish.dishNumber}: ${dish.dishName}`,
        marginLeft,
        currentY
      );
      currentY += 6;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      dish.steps.forEach((step: any) => {
        // Check if we need a new page
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        // Draw checkbox
        doc.rect(marginLeft, currentY - 4, 4, 4);

        // Add text with proper wrapping
        const stepText = step;
        const lines = doc.splitTextToSize(stepText, contentWidth - 10);
        doc.text(lines, marginLeft + 6, currentY);
        currentY += lines.length * 6;
      });
      currentY += 5;
    });

    // Section 4: Pre-Cooking Checklist
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("4. Pre-Cooking Checklist", marginLeft, currentY);
    currentY += 8;

    // Pre-cooking checklist items
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    workflowData.preCookingChecklist.forEach((step: any) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      // Draw checkbox
      doc.rect(marginLeft, currentY - 4, 4, 4);

      // Add text with proper wrapping
      const stepText = step;
      const lines = doc.splitTextToSize(stepText, contentWidth - 10);
      doc.text(lines, marginLeft + 6, currentY);
      currentY += lines.length * 6;
    });
    currentY += 8;

    // Section 5: Assembly & Packing
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("5. Assembly & Packing", marginLeft, currentY);
    currentY += 8;

    // Assembly & packing items
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    workflowData.assemblyAndPacking.forEach((step: any) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      // Draw checkbox
      doc.rect(marginLeft, currentY - 4, 4, 4);

      // Add text with proper wrapping
      const stepText = step;
      const lines = doc.splitTextToSize(stepText, contentWidth - 10);
      doc.text(lines, marginLeft + 6, currentY);
      currentY += lines.length * 6;
    });
    currentY += 8;

    // Section 6: Standard Cleaning Protocol
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("6. Standard Cleaning Protocol", marginLeft, currentY);
    currentY += 8;

    // Cleaning protocol items
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    workflowData.cleaningProtocol.forEach((step: any) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      // Draw checkbox
      doc.rect(marginLeft, currentY - 4, 4, 4);

      // Add text with proper wrapping
      const stepText = step;
      const lines = doc.splitTextToSize(stepText, contentWidth - 10);
      doc.text(lines, marginLeft + 6, currentY);
      currentY += lines.length * 6;
    });
    currentY += 8;

    // Section 7: Completion Sign-Off
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 135, 245);
    doc.text("7. Completion Sign-Off", marginLeft, currentY);
    currentY += 8;

    // Sign-off information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Chef Name: ${workflowData.completionSignOff.chefName}`,
      marginLeft,
      currentY
    );
    currentY += 6;

    doc.text(
      `Assistant Name: ${workflowData.completionSignOff.assistantName}`,
      marginLeft,
      currentY
    );
    currentY += 10;

    // Checklist confirmation with checkbox
    // Draw checkbox
    doc.rect(marginLeft, currentY - 4, 4, 4);

    const confirmText = `I confirm that all checklist items were adhered to by me and my assistant.`;
    const confirmLines = doc.splitTextToSize(confirmText, contentWidth - 10);
    doc.text(confirmLines, marginLeft + 6, currentY);
    currentY += confirmLines.length * 6 + 8;

    // Signature lines
    doc.text(
      "Chef Signature: ____________________________",
      marginLeft,
      currentY
    );
    currentY += 8;

    doc.text(
      "Assistant Signature: ________________________",
      marginLeft,
      currentY
    );
    currentY += 8;

    // Date signature line
    doc.text("Date: ____________________", marginLeft, currentY);

    // Save and download the PDF
    doc.save(`chef_workflow_${listId}.pdf`);
  };

  return (
    <Button
      onClick={handleDownload}
      variant='outline'
      disabled={isDownloading}
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isDownloading ? "Generating..." : "Download Chef Workflow"}
    </Button>
  );
}
