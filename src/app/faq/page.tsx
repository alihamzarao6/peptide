"use client";

import { useState, useMemo } from "react";
import {
  Search,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Shield,
  CreditCard,
  Truck,
  TestTube2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  popularity: number;
  helpful: number;
}

const faqData: FAQ[] = [
  // General Questions
  {
    id: "1",
    question: "What is PeptideDeals and how does it work?",
    answer:
      "PeptideDeals is a comparison platform that helps you find the best deals on research peptides from trusted retailers. We aggregate pricing information from multiple vendors, allowing you to compare prices, read reviews, and find the best deals in one place. We earn commissions through affiliate partnerships when you purchase through our links.",
    category: "general",
    tags: ["platform", "comparison", "how it works"],
    popularity: 95,
    helpful: 148,
  },
  {
    id: "2",
    question: "Are the prices shown on PeptideDeals accurate and up-to-date?",
    answer:
      "We update our price data regularly to ensure accuracy. However, prices can change frequently, and we recommend verifying the current price directly with the retailer before making a purchase. Stock availability and pricing are subject to change without notice.",
    category: "general",
    tags: ["pricing", "accuracy", "updates"],
    popularity: 87,
    helpful: 132,
  },
  {
    id: "3",
    question: "Do you sell peptides directly?",
    answer:
      "No, PeptideDeals does not sell peptides directly. We are a comparison platform that helps you find the best deals from established retailers. All purchases are made directly through the individual retailers' websites.",
    category: "general",
    tags: ["direct sales", "platform"],
    popularity: 78,
    helpful: 95,
  },

  // Ordering & Payment
  {
    id: "4",
    question: "How do I place an order through PeptideDeals?",
    answer:
      'To place an order, simply find the product you want, compare prices from different retailers, and click the "Buy" button next to your preferred option. This will redirect you to the retailer\'s website where you can complete your purchase directly. Make sure to use any available coupon codes for additional savings.',
    category: "ordering",
    tags: ["ordering", "how to buy", "process"],
    popularity: 92,
    helpful: 156,
  },
  {
    id: "5",
    question: "What payment methods do retailers accept?",
    answer:
      "Payment methods vary by retailer but commonly include credit cards, cryptocurrency, bank transfers, and payment services like Zelle. Some retailers may have restrictions on certain payment methods. Check the individual retailer's payment options during checkout.",
    category: "ordering",
    tags: ["payment", "credit card", "crypto", "zelle"],
    popularity: 76,
    helpful: 89,
  },
  {
    id: "6",
    question: "Can I use multiple coupon codes on a single order?",
    answer:
      "Typically, retailers only allow one coupon code per order. However, some retailers may have stackable discounts or automatic volume discounts. Check the retailer's specific terms and conditions for their coupon policy.",
    category: "ordering",
    tags: ["coupons", "discounts", "codes"],
    popularity: 68,
    helpful: 73,
  },

  // Shipping & Delivery
  {
    id: "7",
    question: "How long does shipping typically take?",
    answer:
      "Shipping times vary by retailer and location. Domestic US orders typically take 3-7 business days, while international orders can take 1-3 weeks. Some retailers offer expedited shipping options. Check with the specific retailer for their shipping timeframes.",
    category: "shipping",
    tags: ["shipping time", "delivery", "domestic", "international"],
    popularity: 85,
    helpful: 124,
  },
  {
    id: "8",
    question: "Do retailers ship internationally?",
    answer:
      "Many retailers offer international shipping, but availability varies by country and local regulations. Some products may be restricted in certain regions. Check the retailer's shipping policy and your local laws before ordering.",
    category: "shipping",
    tags: ["international", "shipping", "regulations"],
    popularity: 71,
    helpful: 98,
  },
  {
    id: "9",
    question: "How are peptides packaged for shipping?",
    answer:
      "Reputable retailers ship peptides in temperature-controlled packaging with ice packs or dry ice to maintain stability. Products are typically vacuum-sealed and include desiccants to prevent moisture damage. Discrete packaging is standard.",
    category: "shipping",
    tags: ["packaging", "temperature", "stability", "discrete"],
    popularity: 79,
    helpful: 107,
  },

  // Product Information
  {
    id: "10",
    question: "What is the difference between mg and mcg dosages?",
    answer:
      "mg (milligrams) and mcg (micrograms) are units of measurement. 1 mg = 1,000 mcg. This is important when calculating dosages - always double-check your units to avoid dosing errors. Many peptides are dosed in mcg due to their potency.",
    category: "products",
    tags: ["dosage", "mg", "mcg", "units", "measurement"],
    popularity: 88,
    helpful: 142,
  },
  {
    id: "11",
    question: "How should peptides be stored?",
    answer:
      "Lyophilized (powder) peptides should be stored in a freezer (-20°C or colder) and can last 1-2 years. Once reconstituted, most peptides should be refrigerated and used within 30 days. Always store away from light and moisture.",
    category: "products",
    tags: ["storage", "refrigeration", "freezer", "stability"],
    popularity: 91,
    helpful: 167,
  },
  {
    id: "12",
    question: "What is peptide purity and why does it matter?",
    answer:
      "Purity refers to the percentage of the desired peptide in the product, with higher purity meaning fewer impurities. Look for peptides with >95% purity from reputable suppliers who provide third-party testing certificates.",
    category: "products",
    tags: ["purity", "quality", "testing", "certificates"],
    popularity: 74,
    helpful: 89,
  },

  // Safety & Legal
  {
    id: "13",
    question: "Are research peptides legal?",
    answer:
      "Research peptides are legal to purchase and possess for research purposes in most countries. However, they are not approved for human consumption. Laws vary by jurisdiction, so check your local regulations before ordering.",
    category: "legal",
    tags: ["legal", "research", "regulations", "compliance"],
    popularity: 93,
    helpful: 178,
  },
  {
    id: "14",
    question: 'What does "for research purposes only" mean?',
    answer:
      "This designation means the peptides are intended for laboratory research and are not approved for human consumption, clinical use, or therapeutic purposes. They have not undergone clinical trials for safety and efficacy in humans.",
    category: "legal",
    tags: ["research only", "human consumption", "clinical"],
    popularity: 81,
    helpful: 134,
  },

  // Technical Support
  {
    id: "15",
    question: "I found an error in pricing. How can I report it?",
    answer:
      "If you notice pricing discrepancies or outdated information, please contact us immediately. We strive to maintain accurate data and appreciate user feedback to help us improve our service.",
    category: "support",
    tags: ["pricing error", "report", "feedback"],
    popularity: 45,
    helpful: 67,
  },
  {
    id: "16",
    question: "How can I request a new retailer to be added?",
    answer:
      "We're always looking to add reputable retailers to our platform. Contact us with the retailer's information, and we'll evaluate them based on our quality and reliability standards.",
    category: "support",
    tags: ["new retailer", "request", "addition"],
    popularity: 52,
    helpful: 34,
  },
];

const categories = [
  {
    id: "all",
    name: "All Categories",
    icon: HelpCircle,
    color: "bg-gray-100 text-gray-700",
    count: faqData.length,
  },
  {
    id: "general",
    name: "General",
    icon: MessageCircle,
    color: "bg-blue-100 text-blue-700",
    count: faqData.filter((faq) => faq.category === "general").length,
  },
  {
    id: "ordering",
    name: "Ordering & Payment",
    icon: CreditCard,
    color: "bg-green-100 text-green-700",
    count: faqData.filter((faq) => faq.category === "ordering").length,
  },
  {
    id: "shipping",
    name: "Shipping & Delivery",
    icon: Truck,
    color: "bg-purple-100 text-purple-700",
    count: faqData.filter((faq) => faq.category === "shipping").length,
  },
  {
    id: "products",
    name: "Product Information",
    icon: TestTube2,
    color: "bg-yellow-100 text-yellow-700",
    count: faqData.filter((faq) => faq.category === "products").length,
  },
  {
    id: "legal",
    name: "Safety & Legal",
    icon: Shield,
    color: "bg-red-100 text-red-700",
    count: faqData.filter((faq) => faq.category === "legal").length,
  },
  {
    id: "support",
    name: "Technical Support",
    icon: Phone,
    color: "bg-indigo-100 text-indigo-700",
    count: faqData.filter((faq) => faq.category === "support").length,
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort by popularity and helpfulness
    return filtered.sort(
      (a, b) => b.popularity + b.helpful - (a.popularity + a.helpful)
    );
  }, [searchQuery, selectedCategory]);

  const markAsHelpful = (faqId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [faqId]: !prev[faqId],
    }));
  };

  const popularFAQs = faqData
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 2xl:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about peptide pricing, ordering,
            shipping, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs... (e.g., shipping, payment, dosage)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg glass-effect border-white/30 shadow-lg"
            />
          </div>
          {searchQuery && (
            <div className="mt-3 text-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {filteredFAQs.length} result
                {filteredFAQs.length !== 1 ? "s" : ""} found
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card className="gradient-card border-white/60 shadow-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-blue-100 border-blue-200 shadow-md"
                          : "hover:bg-white/60 border-transparent"
                      } border`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Separator className="my-6 bg-gray-200/50" />

              {/* Popular FAQs */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Most Popular
                </h4>
                <div className="space-y-2">
                  {popularFAQs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => {
                        setSelectedCategory(faq.category);
                        setSearchQuery("");
                        document
                          .getElementById(`faq-${faq.id}`)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      <div className="text-xs text-gray-700 line-clamp-2">
                        {faq.question}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={
                            categories.find((c) => c.id === faq.category)?.color
                          }
                        >
                          {categories.find((c) => c.id === faq.category)?.name}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {filteredFAQs.length > 0 ? (
              <Card className="gradient-card border-white/60 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === "all"
                      ? "All Questions"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                  </h2>
                  <Badge variant="outline" className="text-sm">
                    {filteredFAQs.length} question
                    {filteredFAQs.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      id={`faq-${faq.id}`}
                      className="border border-white/40 rounded-lg bg-white/30 hover:bg-white/50 transition-colors"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-start gap-4 text-left">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {faq.question}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  categories.find((c) => c.id === faq.category)
                                    ?.color
                                }
                              >
                                {
                                  categories.find((c) => c.id === faq.category)
                                    ?.name
                                }
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{faq.helpful} helpful</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {faq.answer}
                          </p>

                          {/* Tags */}
                          {faq.tags.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xs text-gray-500">
                                Tags:
                              </span>
                              {faq.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Helpful Button */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <span className="text-xs text-gray-500">
                              Was this helpful?
                            </span>
                            <Button
                              variant={
                                helpfulVotes[faq.id] ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => markAsHelpful(faq.id)}
                              className="text-xs"
                            >
                              👍{" "}
                              {helpfulVotes[faq.id]
                                ? "Helpful!"
                                : "Mark as helpful"}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ) : (
              <Card className="gradient-card border-white/60 shadow-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any FAQs matching your search. Try
                    adjusting your search terms or browse all categories.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    View All FAQs
                  </Button>
                </div>
              </Card>
            )}

            {/* Contact Support Section */}
            <Card className="gradient-card border-white/60 shadow-xl p-6 mt-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Still need help?
                </h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Our support team is
                  here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </Card>

            {/* Important Notice */}
            <Alert className="mt-6 bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> All peptides listed on our platform
                are for research purposes only. This information is not intended
                as medical advice. Always consult with a healthcare professional
                before using any research compounds.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
