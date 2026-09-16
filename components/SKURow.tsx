"use client";

import { Minus, Plus } from "lucide-react";
import type { SKU } from "@/lib/types";
import { formatPeso } from "@/lib/format";
import { useOrder } from "./OrderProvider";

/**
 * Two fixed heights so the virtualizer can measure without rendering. The
 * taller one carries the "Category › Sub-category" line, which only earns its
 * place in search results — inside a shelf you already know where you are.
 */
export const ROW_HEIGHT = 116;
export const ROW_HEIGHT_WITH_LOCATION = 140;

export function SKURow({
  sku,
  showLocation = false,
}: {
  sku: SKU;
  showLocation?: boolean;
}) {
  const { list, add, setQuantity } = useOrder();
  const entry = list.find((e) => e.code === sku.code);
  const qty = entry?.quantity ?? 0;

  return (
    <div
      className="flex h-full flex-col justify-center gap-2 border-b border-slate-200 px-4"
      style={{ height: showLocation ? ROW_HEIGHT_WITH_LOCATION : ROW_HEIGHT }}
    >
      <div className="min-w-0">
        {/* Full width, two lines: 4,120 names used to be cut off mid-word. */}
        <p className="line-clamp-2 text-[17px] font-semibold leading-snug text-xyris-charcoal">
          {sku.name}
        </p>
        {showLocation ? (
          <p className="mt-0.5 truncate text-sm text-slate-600">
            {sku.category} › {sku.subCategory}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[22px] font-bold leading-none text-xyris-blue tabular">
          {formatPeso(sku.price)}
        </p>

        {qty === 0 ? (
          <button
            type="button"
            onClick={() => add(sku)}
            aria-label={`Add ${sku.name} to order list`}
            className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-xyris-yellow pl-3 pr-4 text-base font-bold text-xyris-blue active:scale-95 transition-transform hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Add
          </button>
        ) : (
          <div className="inline-flex shrink-0 items-center rounded-full bg-xyris-yellow">
            <button
              type="button"
              onClick={() => setQuantity(sku.code, qty - 1)}
              aria-label={`Remove one ${sku.name}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-xyris-blue active:scale-90 transition-transform hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              aria-label={`${qty} in your order list`}
              className="min-w-[2rem] text-center text-lg font-bold text-xyris-blue tabular"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(sku.code, qty + 1)}
              aria-label={`Add one more ${sku.name}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-xyris-blue active:scale-90 transition-transform hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
