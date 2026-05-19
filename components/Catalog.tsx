"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Manifest, SKU } from "@/lib/types";
import { loadAllCategories, loadCategory } from "@/lib/data";
import { applyFilters, type SortMode } from "@/lib/filter";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { SearchBar } from "./SearchBar";
import { Filters } from "./Filters";
import { CategoryPicker } from "./CategoryPicker";
import { SKUList } from "./SKUList";
import { ResultMeta } from "./ResultMeta";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; skus: SKU[] }
  | { status: "error"; message: string };

export function Catalog({
  manifest,
  updatedLabel,
}: {
  manifest: Manifest;
  updatedLabel: string;
}) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("price-asc");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 150);
  const [load, setLoad] = useState<LoadState>({ status: "idle" });
  const [globalSkus, setGlobalSkus] = useState<SKU[] | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  const filterActive =
    categorySlug === null &&
    (debouncedSearch.trim().length > 0 ||
      subCategory !== null ||
      brand !== null);

  const triggerGlobalPreload = useCallback(() => {
    if (globalSkus !== null || globalLoading) return;
    setGlobalLoading(true);
    loadAllCategories(manifest)
      .then((skus) => setGlobalSkus(skus))
      .catch(() => {
        // swallow — failed categories surface via per-category navigation
      })
      .finally(() => setGlobalLoading(false));
  }, [manifest, globalSkus, globalLoading]);

  useEffect(() => {
    if (filterActive) triggerGlobalPreload();
  }, [filterActive, triggerGlobalPreload]);

  useEffect(() => {
    if (!categorySlug) {
      setLoad({ status: "idle" });
      return;
    }
    let cancelled = false;
    setLoad({ status: "loading" });
    loadCategory(categorySlug)
      .then((file) => {
        if (!cancelled) setLoad({ status: "ready", skus: file.skus });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setLoad({
            status: "error",
            message: err.message || "Failed to load category.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const handleCategoryChange = useCallback((slug: string | null) => {
    setCategorySlug(slug);
    setSubCategory(null);
    setBrand(null);
  }, []);

  const handleSubCategoryChange = useCallback((label: string | null) => {
    setSubCategory(label);
    setBrand(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setCategorySlug(null);
    setSubCategory(null);
    setBrand(null);
    setSearch("");
  }, []);

  const filtered = useMemo(() => {
    if (filterActive) {
      const source = globalSkus ?? [];
      return applyFilters(source, {
        subCategory,
        brand,
        query: debouncedSearch,
        sort,
      });
    }
    const source = load.status === "ready" ? load.skus : [];
    return applyFilters(source, {
      subCategory,
      brand,
      query: debouncedSearch,
      sort,
    });
  }, [filterActive, globalSkus, load, subCategory, brand, debouncedSearch, sort]);

  return (
    <div className="space-y-3">
      <SearchBar
        value={search}
        onChange={setSearch}
        onFocus={triggerGlobalPreload}
      />
      <Filters
        categories={manifest.categories}
        selectedCategorySlug={categorySlug}
        selectedSubCategory={subCategory}
        selectedBrand={brand}
        sort={sort}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        onBrandChange={setBrand}
        onSortChange={setSort}
        onClearAll={handleClearAll}
      />

      {filterActive ? (
        <>
          <ResultMeta
            shownCount={filtered.length}
            totalCount={manifest.totalSKUs}
            updatedLabel={updatedLabel}
            loading={globalLoading && globalSkus === null}
          />
          {globalLoading && globalSkus === null ? (
            <ListSkeleton />
          ) : (
            <SKUList skus={filtered} />
          )}
        </>
      ) : categorySlug === null ? (
        <CategoryPicker
          categories={manifest.categories}
          onPick={handleCategoryChange}
        />
      ) : (
        <>
          <ResultMeta
            shownCount={filtered.length}
            totalCount={manifest.totalSKUs}
            updatedLabel={updatedLabel}
            loading={load.status === "loading"}
          />
          {load.status === "loading" ? (
            <ListSkeleton />
          ) : load.status === "error" ? (
            <ErrorBox
              message={load.message}
              onRetry={() => setCategorySlug(categorySlug)}
            />
          ) : (
            <SKUList skus={filtered} />
          )}
        </>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul
      role="status"
      aria-label="Loading products"
      className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
          <div className="h-5 w-16 rounded bg-slate-200" />
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-xyris-red bg-white px-4 py-6 text-center">
      <p className="font-semibold text-xyris-red">Couldn’t load this category.</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center rounded-full bg-xyris-blue px-4 py-2 text-sm font-semibold text-white hover:bg-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-blue"
      >
        Try again
      </button>
    </div>
  );
}
