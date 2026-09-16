"use client";

import { ChevronRight, LayoutGrid } from "lucide-react";
import type { CategoryMeta } from "@/lib/types";
import { categoryIcon } from "@/lib/categoryIcons";

/**
 * The step between a category and its products. Personal Care alone holds
 * 2,116 items; dropping someone straight into that list is the wall people
 * complained about. Six large targets beat one endless scroll.
 */
export function SubCategoryPicker({
  category,
  onPickSub,
  onShowAll,
}: {
  category: CategoryMeta;
  onPickSub: (label: string) => void;
  onShowAll: () => void;
}) {
  const Icon = categoryIcon(category.slug);
  return (
    <section aria-labelledby="sub-heading" className="!mt-4">
      <h2 id="sub-heading" className="flex items-center gap-2 text-xl font-bold text-xyris-charcoal">
        <Icon className="h-6 w-6 text-xyris-blue" strokeWidth={1.75} aria-hidden="true" />
        {category.label}
      </h2>
      <p className="mt-1 text-base text-slate-600">Tap a shelf to see prices.</p>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <button
            type="button"
            onClick={onShowAll}
            className="flex min-h-[72px] w-full items-center gap-3 rounded-xl border-2 border-xyris-blue bg-xyris-yellow-light px-4 py-3 text-left active:scale-[0.99] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
          >
            <LayoutGrid className="h-6 w-6 shrink-0 text-xyris-blue" strokeWidth={1.75} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-xyris-charcoal">
                Show everything
              </span>
              <span className="block text-sm text-slate-600 tabular">
                {category.skuCount.toLocaleString()} items
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-xyris-blue" aria-hidden="true" />
          </button>
        </li>

        {category.subCategories.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => onPickSub(s.label)}
              className="flex min-h-[72px] w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left hover:border-xyris-blue hover:bg-xyris-yellow-light active:scale-[0.99] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-snug text-xyris-charcoal">
                  {s.label}
                </span>
                <span className="block text-sm text-slate-600 tabular">
                  {s.skuCount.toLocaleString()} items
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
