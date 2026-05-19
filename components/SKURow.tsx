"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { SKU } from "@/lib/types";
import { formatPeso } from "@/lib/format";
import { useOrder } from "./OrderProvider";

export const ROW_HEIGHT = 84;

export function SKURow({ sku }: { sku: SKU }) {
  const { add } = useOrder();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const onAdd = () => {
    add(sku);
    setJustAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 800);
  };

  return (
    <div
      className="flex h-full items-center gap-3 border-b border-slate-200 px-4"
      style={{ height: ROW_HEIGHT }}
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-base font-semibold text-xyris-charcoal">
          {sku.name}
        </p>
        <p className="truncate text-sm text-slate-500">
          {sku.brand} · {sku.subCategory}
        </p>
      </div>
      <p className="shrink-0 text-lg font-bold text-xyris-blue tabular">
        {formatPeso(sku.price)}
      </p>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${sku.name} to order list`}
        className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-xyris-yellow text-xyris-blue active:scale-90 transition-transform hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
      >
        {justAdded ? (
          <Check className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Plus className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
