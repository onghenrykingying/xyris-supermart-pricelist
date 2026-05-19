"use client";

import { ArrowRight } from "lucide-react";
import type { CategoryMeta } from "@/lib/types";

export function CategoryPicker({
  categories,
  onPick,
}: {
  categories: CategoryMeta[];
  onPick: (slug: string) => void;
}) {
  return (
    <section
      aria-labelledby="picker-heading"
      className="!mt-6 rounded-lg border border-slate-200 bg-white p-4 sm:!mt-8"
    >
      <h2
        id="picker-heading"
        className="text-lg font-semibold text-xyris-charcoal"
      >
        Browse by category
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Pick a category to see prices. You can also search above.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <button
              type="button"
              onClick={() => onPick(c.slug)}
              className="group flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left hover:border-xyris-blue hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-xyris-charcoal">
                  {c.label}
                </span>
                <span className="block text-xs text-slate-500 tabular">
                  {c.skuCount.toLocaleString()} products
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-xyris-blue"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
