"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyFilterProps {
  selectedCompanies: string[];
  companies: string[];
  onChange: (companies: string[]) => void;
}

export function CompanyFilter({
  selectedCompanies,
  companies,
  onChange,
}: CompanyFilterProps) {
  const handleCompanyToggle = (company: string) => {
    if (selectedCompanies.includes(company)) {
      onChange(selectedCompanies.filter((c) => c !== company));
    } else {
      onChange([...selectedCompanies, company]);
    }
  };

  return (
    <Select>
      <SelectTrigger className="w-full bg-white/50 border-gray-200 hover:bg-white/80 transition-colors">
        <SelectValue
          placeholder={
            selectedCompanies.length > 0
              ? `${selectedCompanies.length} selected`
              : "All Companies"
          }
        />
      </SelectTrigger>
      <SelectContent className="glass-effect border-white/30">
        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          {companies.map((company) => (
            <div
              key={company}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
            >
              <Checkbox
                id={company}
                checked={selectedCompanies.includes(company)}
                onCheckedChange={() => handleCompanyToggle(company)}
                className="border-gray-300"
              />
              <label
                htmlFor={company}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {company}
              </label>
            </div>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
