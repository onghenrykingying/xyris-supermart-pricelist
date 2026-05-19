"use client";

import { X } from "lucide-react";
import type { CategoryMeta } from "@/lib/types";
import type { SortMode } from "@/lib/filter";

interface Props {
  categories: CategoryMeta[];
  selectedCategorySlug: string | null;
  selectedSubCategory: string | null;
  selectedBrand: string | null;
  sort: SortMode;
  onCategoryChange: (slug: string | null) => void;
  onSubCategoryChange: (label: string | null) => void;
  onBrandChange: (brand: string | null) => void;
  onSortChange: (sort: SortMode) => void;
  onClearAll: () => void;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name A–Z" },
];

export function Filters({
  categories,
  selectedCategorySlug,
  selectedSubCategory,
  selectedBrand,
  sort,
  onCategoryChange,
  onSubCategoryChange,
  onBrandChange,
  onSortChange,
  onClearAll,
}: Props) {
  const selectedCategory =
    categories.find((c) => c.slug === selectedCategorySlug) ?? null;

  const activeSubCategory = selectedCategory?.subCategories.find(
    (s) => s.label === selectedSubCategory,
  );

  const brandOptions = activeSubCategory
    ? activeSubCategory.brands
    : (selectedCategory?.brands ?? []);

  const anyActive =
    selectedCategorySlug || selectedSubCategory || selectedBrand;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          label="Category"
          value={selectedCategorySlug ?? ""}
          onChange={(v) => onCategoryChange(v || null)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label} ({c.skuCount.toLocaleString()})
            </option>
          ))}
        </Select>

        <Select
          label="Sub-category"
          value={selectedSubCategory ?? ""}
          onChange={(v) => onSubCategoryChange(v || null)}
          disabled={!selectedCategory}
        >
          <option value="">
            {selectedCategory ? "All sub-categories" : "Pick a category first"}
          </option>
          {selectedCategory?.subCategories.map((s) => (
            <option key={s.label} value={s.label}>
              {s.label} ({s.skuCount.toLocaleString()})
            </option>
          ))}
        </Select>

        <Select
          label="Brand"
          value={selectedBrand ?? ""}
          onChange={(v) => onBrandChange(v || null)}
          disabled={!selectedCategory}
        >
          <option value="">
            {selectedCategory ? "All brands" : "Pick a category first"}
          </option>
          {brandOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            aria-label="Sort products"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-xyris-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {anyActive ? (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-sm font-medium text-xyris-blue hover:text-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue rounded"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={label}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-xyris-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        {children}
      </select>
    </label>
  );
}
