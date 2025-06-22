// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TestTube2,
  Calculator,
  BarChart3,
  HelpCircle,
  Target,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Compare", href: "/", icon: BarChart3, active: pathname === "/" },
    {
      name: "Calculator",
      href: "/calculator",
      icon: Calculator,
      active: pathname === "/calculator",
    },
    {
      name: "Stack Builder",
      href: "/build-stack",
      icon: Target,
      active: pathname === "/build-stack",
    },
    {
      name: "FAQ",
      href: "/faq",
      icon: HelpCircle,
      active: pathname === "/faq",
    },
  ];

  return (
    <header className="sticky top-0 z-50 glass-effect shadow-lg border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                PeptidePrice
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Compare & Save</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`gap-2 transition-all duration-300 cursor-pointer ${
                      item.active
                        ? "gradient-primary text-white shadow-lg hover:shadow-xl"
                        : "hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/90 backdrop-blur-lg">
            <div className="py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 cursor-pointer ${
                        item.active
                          ? "gradient-primary text-white"
                          : "hover:bg-blue-50 hover:text-blue-700"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
