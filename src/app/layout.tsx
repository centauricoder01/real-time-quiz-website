import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Application",
  description: "Build by Rajendra Patel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="text-black bg-white">
      <body>
        {children} 
      </body>
    </html>
  );
}
