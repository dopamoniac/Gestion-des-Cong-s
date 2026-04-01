import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "إدارة الإجازات — Gestion des Congés",
  description: "Application de gestion des demandes de congé pour les employés. Simple, rapide et fiable.",
  keywords: ["congés", "gestion des congés", "RH", "demande de congé", "leave management", "employee absence"],
  authors: [{ name: "Département RH" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "إدارة الإجازات — Gestion des Congés",
    description: "Application de gestion des demandes de congé",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
