"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SKU } from "@/lib/types";
import { SKURow, ROW_HEIGHT, ROW_HEIGHT_WITH_LOCATION } from "./SKURow";
import { ViberCard, VIBER_CARD_HEIGHT } from "./ViberCard";

type Row =
  | { kind: "sku"; sku: SKU }
  | { kind: "viber"; id: string };

const VIBER_EVERY = 20;

function buildRows(skus: SKU[]): Row[] {
  const rows: Row[] = [];
  skus.forEach((sku, i) => {
    rows.push({ kind: "sku", sku });
    if ((i + 1) % VIBER_EVERY === 0 && i !== skus.length - 1) {
      rows.push({ kind: "viber", id: `viber-${i}` });
    }
  });
  return rows;
}

export function SKUList({
  skus,
  showLocation = false,
}: {
  skus: SKU[];
  showLocation?: boolean;
}) {
  const rowHeight = showLocation ? ROW_HEIGHT_WITH_LOCATION : ROW_HEIGHT;
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => buildRows(skus), [skus]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) =>
      rows[i].kind === "viber" ? VIBER_CARD_HEIGHT : rowHeight,
    overscan: 8,
    getItemKey: (i) => {
      const row = rows[i];
      return row.kind === "sku" ? row.sku.code : row.id;
    },
  });

  if (skus.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
        <p className="text-lg font-bold text-xyris-charcoal">
          Nothing found.
        </p>
        <p className="mt-1 text-base text-slate-600">
          Try a shorter word, or go back and pick another group.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-lg border border-slate-200 bg-white"
      style={{ height: "min(70vh, 720px)", contain: "strict" }}
    >
      <ul
        role="list"
        aria-label="Product list"
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((vi) => {
          const row = rows[vi.index];
          return (
            <li
              key={vi.key}
              className="absolute left-0 right-0 top-0"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {row.kind === "sku" ? (
                <SKURow sku={row.sku} showLocation={showLocation} />
              ) : (
                <ViberCard />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
