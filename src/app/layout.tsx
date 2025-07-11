import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { DisclaimerWrapper } from "@/components/DisclaimerWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PeptideDeals - Compare Peptide Deals and Prices from Top Retailers",
  description:
    "Find the best deals on peptides from top retailers in one place. Compare prices, read reviews, and save money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DisclaimerWrapper>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
              <Header />
              <main className="pb-16">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </DisclaimerWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
