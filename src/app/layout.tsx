import type { Metadata } from "next";
import "./globals.css";
import { StorageProvider } from "@/context/StorageContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Couture Studio | Luxury Management",
  description: "Bespoke fashion pricing and invoicing for the modern designer",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#3E2723",
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
            <div className="app-shell">
              <main className="main-content">
                {children}
              </main>
              <Navbar />
            </div>
          </StorageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
