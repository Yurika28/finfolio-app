"use client";

import { Button } from "@/components/ui/button";

interface RangeSelectorProps<T extends string> {
  ranges: readonly T[];
  selectedRange: T;
  onChange: (range: T) => void;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function RangeSelector<T extends string>({
  ranges,
  selectedRange,
  onChange,
  disabled = false,
  size = "default",
}: RangeSelectorProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {ranges.map((range) => {
        const isActive = range === selectedRange;
        return (
          <Button
            key={range}
            onClick={() => onChange(range)}
            variant={isActive ? "default" : "outline"}
            size={size}
            disabled={disabled}
            className={
              isActive
                ? "text-accent border-zinc-600 hover:bg-zinc-800"
                : "text-zinc-500 border-zinc-600 hover:text-accent hover:bg-zinc-800"
            }
          >
            {range}
          </Button>
        );
      })}
    </div>
  );
}
