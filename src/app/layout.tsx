import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestion des Congés — Leave Management",
  description: "Leave Management System — إدارة الإجازات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} bg-background text-foreground`}
        style={{ fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, 'Arial', sans-serif", fontSize: '11px' }}
      >
        {children}
      </body>
    </html>
  );
}
