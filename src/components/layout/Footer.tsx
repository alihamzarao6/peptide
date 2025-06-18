"use client";

import Link from "next/link";
import { TestTube2, Mail, Shield, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const retailers = [
  "Amino Asylum",
  "AMP Peptides",
  "Ascension Peptides",
  "Atomik Labz",
  "Modern Aminos",
  "Omegamino",
  "Peptide Tech",
  "Prime Peptides",
  "Simple Peptide",
  "Solution Peptides",
  "Swiss Chems",
  "Unchained Compounds",
];

const informationLinks = [
  { name: "About Us", href: "/about" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Disclaimer", href: "/disclaimer" },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <TestTube2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">PeptidePrice</h2>
                <p className="text-blue-200 text-sm">Compare & Save</p>
              </div>
            </Link>

            <p className="text-gray-300 leading-relaxed mb-6">
              Compare peptide prices across multiple retailers to find the best
              deals. Use our coupon codes for additional savings.
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                asChild
              >
                <Link href="mailto:info@peptideprice.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>

          {/* Retailers */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Featured Retailers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {retailers.map((retailer) => (
                <Link
                  key={retailer}
                  href={`/?company=${encodeURIComponent(retailer)}`}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm py-1 hover:underline"
                >
                  {retailer}
                </Link>
              ))}
            </div>
          </div>

          {/* Information */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Information
            </h3>
            <div className="space-y-3">
              {informationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-blue-400 transition-colors text-sm py-1 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/faq"
                className="block text-gray-300 hover:text-blue-400 transition-colors text-sm py-1 hover:underline flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h4 className="font-semibold text-blue-400 mb-3">
                Platform Stats
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Peptides Tracked:</span>
                  <span className="text-white font-medium">50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Retailers Monitored:</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price Updates:</span>
                  <span className="text-white font-medium">Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-white/20" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-300 text-sm">
              © 2025 PeptidePrice. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              This website is for informational purposes only. We do not sell
              peptides directly.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-xs text-gray-400 text-center">
              <p>Made with ❤️ for the research community</p>
              <p className="mt-1">Last updated: June 2025</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-200 text-xs leading-relaxed">
            <strong>Disclaimer:</strong> All peptides listed are for research
            purposes only. Prices and availability are subject to change. Always
            verify current pricing and product availability directly with
            retailers. We earn commissions from affiliate links.
          </p>
        </div>
      </div>
    </footer>
  );
}
