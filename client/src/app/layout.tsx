import type { Metadata } from "next";
import "./globals.css";
import { StorageProvider } from "@/context/StorageContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Couture Studio | Atelier Gallery",
  description: "Bespoke fashion collective and luxury studio management",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <StorageProvider>
            <Suspense fallback={null}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </StorageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
