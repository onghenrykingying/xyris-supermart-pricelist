import type { SKU } from "./types";

export type SortMode = "price-asc" | "price-desc" | "name-asc";

export function applyFilters(
  skus: readonly SKU[],
  opts: {
    subCategory: string | null;
    brand: string | null;
    query: string;
    sort: SortMode;
  },
): SKU[] {
  const tokens = opts.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filtered = skus.filter((s) => {
    if (opts.subCategory && s.subCategory !== opts.subCategory) return false;
    if (opts.brand && s.brand !== opts.brand) return false;
    if (tokens.length === 0) return true;
    const hay = `${s.name} ${s.brand} ${s.code}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });

  switch (opts.sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return filtered;
}
