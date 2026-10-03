import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VMware Modernization Planner | Rack2Cloud",
  description: "Model VMware renewal exposure, migration complexity, and modernization scenarios using deterministic infrastructure architecture assumptions.",
  keywords: [
    "vmware modernization planner",
    "vmware renewal cost",
    "vmware migration planning",
    "vmware renewal exposure",
    "vmware licensing",
    "vmware cloud foundation"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
