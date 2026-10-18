import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../app/globals.css";
import DashboardWrapper from "./dashboard/dashboardWrapper";

const font = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Run | Inventory Management",
  description: "Shoe inventory and sales analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${font.className} h-full antialiased`}>
      <body className="min-h-full w-full flex flex-col overflow-x-hidden bg-gray-50 text-gray-900">
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}
