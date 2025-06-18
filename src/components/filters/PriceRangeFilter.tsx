"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  priceRange: { min: number; max: number };
  onChange: (priceRange: { min: number; max: number }) => void;
}

export function PriceRangeFilter({
  priceRange,
  onChange,
}: PriceRangeFilterProps) {
  const [localRange, setLocalRange] = useState([
    priceRange.min,
    priceRange.max,
  ]);

  useEffect(() => {
    setLocalRange([priceRange.min, priceRange.max]);
  }, [priceRange]);

  const handleSliderChange = (values: number[]) => {
    setLocalRange(values);
    onChange({ min: values[0], max: values[1] });
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = Math.max(0, parseInt(e.target.value) || 0);
    const max = Math.max(min, localRange[1]);
    setLocalRange([min, max]);
    onChange({ min, max });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = Math.min(1000, parseInt(e.target.value) || 1000);
    const min = Math.min(max, localRange[0]);
    setLocalRange([min, max]);
    onChange({ min, max });
  };

  return (
    <div className="space-y-4">
      <Slider
        value={localRange}
        onValueChange={handleSliderChange}
        max={1000}
        min={0}
        step={10}
        className="w-full"
      />
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <Input
              type="number"
              value={localRange[0]}
              onChange={handleMinChange}
              className="pl-7 bg-white/50 border-gray-200"
              min="0"
              max="1000"
            />
          </div>
        </div>
        <div className="text-gray-400 font-medium">to</div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <Input
              type="number"
              value={localRange[1]}
              onChange={handleMaxChange}
              className="pl-7 bg-white/50 border-gray-200"
              min="0"
              max="1000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
