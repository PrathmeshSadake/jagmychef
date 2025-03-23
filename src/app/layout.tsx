import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jagmychef",
  description: "A Private Culinary Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={`${fraunces.className}`}>
          {children}

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
