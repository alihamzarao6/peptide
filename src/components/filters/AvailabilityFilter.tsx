"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "lucide-react";

interface AvailabilityFilterProps {
  availability: boolean;
  onChange: (availability: boolean) => void;
}

export function AvailabilityFilter({
  availability,
  onChange,
}: AvailabilityFilterProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/30 border border-white/40 hover:bg-white/50 transition-colors">
      <Checkbox
        id="availability"
        checked={availability}
        onCheckedChange={(checked) => onChange(!!checked)}
        className="border-gray-300"
      />
      <label
        htmlFor="availability"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
      >
        <Package className="h-4 w-4 text-green-600" />
        Show only available items
      </label>
    </div>
  );
}
