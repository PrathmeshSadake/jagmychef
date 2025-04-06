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

      // Request the PDF from our API
      const response = await fetch(`/api/workflow/${listId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate workflow PDF");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = url;
      a.download = `chef_workflow_${listId}.pdf`;

      // Append to the body, click, and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Workflow PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading workflow PDF:", error);
      toast.error("Failed to download workflow PDF");
    } finally {
      setIsDownloading(false);
    }
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
