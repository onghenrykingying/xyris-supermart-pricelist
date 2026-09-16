"use client";

import type { SortMode } from "@/lib/filter";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "price-asc", label: "Cheapest first" },
  { value: "price-desc", label: "Most expensive first" },
];

export function SortBar({
  sort,
  onSortChange,
}: {
  sort: SortMode;
  onSortChange: (sort: SortMode) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-base text-slate-600">
      <span className="shrink-0">Sort by</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortMode)}
        aria-label="Sort products"
        className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-xyris-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue sm:flex-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
