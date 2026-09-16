"use client";

import { ChevronLeft } from "lucide-react";

/**
 * Where you are, and one tap back out. Without it a category was a dead end —
 * the only way back was to reopen a dropdown and choose "All categories".
 *
 * `trail` is empty on the shelf screen, where the heading underneath already
 * names the category; repeating it twice just adds noise.
 */
export function Breadcrumb({
  trail = [],
  onBack,
  onTrailClick,
}: {
  trail?: string[];
  onBack: () => void;
  onTrailClick?: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-12 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white pl-2 pr-3 text-base font-semibold text-xyris-blue hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        Back
      </button>

      {trail.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 text-base leading-snug text-slate-600"
        >
          {trail.map((label, i) => {
            const last = i === trail.length - 1;
            return (
              <span key={`${label}-${i}`}>
                {i > 0 ? (
                  <span className="mx-1 text-slate-400" aria-hidden="true">
                    ›
                  </span>
                ) : null}
                {last || !onTrailClick ? (
                  <span className="font-semibold text-xyris-charcoal">
                    {label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTrailClick(i)}
                    className="font-semibold text-xyris-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue rounded"
                  >
                    {label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
