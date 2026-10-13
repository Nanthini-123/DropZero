import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropZero",
  description: "Student Success Intelligence & Dropout Early-Warning System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
