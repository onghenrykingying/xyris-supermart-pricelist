"use client";

import type { CategoryMeta } from "@/lib/types";
import { categoryIcon } from "@/lib/categoryIcons";

export function CategoryPicker({
  categories,
  onPick,
}: {
  categories: CategoryMeta[];
  onPick: (slug: string) => void;
}) {
  return (
    <section aria-labelledby="picker-heading" className="!mt-5">
      <h2
        id="picker-heading"
        className="text-xl font-bold text-xyris-charcoal"
      >
        What are you looking for?
      </h2>
      <p className="mt-1 text-base text-slate-600">
        Tap a group to see prices, or search at the top.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const Icon = categoryIcon(c.slug);
          return (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => onPick(c.slug)}
                className="flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-4 text-center hover:border-xyris-blue hover:bg-xyris-yellow-light active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
              >
                <Icon
                  className="h-10 w-10 shrink-0 text-xyris-blue"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-base font-bold leading-tight text-xyris-charcoal">
                  {c.label}
                </span>
                <span className="text-sm text-slate-600 tabular">
                  {c.skuCount.toLocaleString()} items
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
