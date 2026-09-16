"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Manifest, SKU } from "@/lib/types";
import { loadAllCategories, loadCategory } from "@/lib/data";
import { applyFilters, type SortMode } from "@/lib/filter";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { SearchBar } from "./SearchBar";
import { SortBar } from "./SortBar";
import { Breadcrumb } from "./Breadcrumb";
import { CategoryPicker } from "./CategoryPicker";
import { SubCategoryPicker } from "./SubCategoryPicker";
import { SKUList } from "./SKUList";
import { ROW_HEIGHT, ROW_HEIGHT_WITH_LOCATION } from "./SKURow";
import { ResultMeta } from "./ResultMeta";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; skus: SKU[] }
  | { status: "error"; message: string };

/**
 * Three screens, one level apart: groups → shelves → prices. Search cuts
 * across all of them and always looks everywhere, so there is never a hidden
 * filter quietly excluding what someone is typing.
 */
export function Catalog({
  manifest,
  updatedLabel,
}: {
  manifest: Manifest;
  updatedLabel: string;
}) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [showAllInCategory, setShowAllInCategory] = useState(false);
  const [sort, setSort] = useState<SortMode>("name-asc");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 150);
  const [load, setLoad] = useState<LoadState>({ status: "idle" });
  const [globalSkus, setGlobalSkus] = useState<SKU[] | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  const searching = debouncedSearch.trim().length > 0;
  const category =
    manifest.categories.find((c) => c.slug === categorySlug) ?? null;
  const viewingList = !searching && category !== null && (subCategory !== null || showAllInCategory);

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
    if (searching) triggerGlobalPreload();
  }, [searching, triggerGlobalPreload]);

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

  const handlePickCategory = useCallback((slug: string) => {
    setCategorySlug(slug);
    setSubCategory(null);
    setShowAllInCategory(false);
  }, []);

  const handlePickSub = useCallback((label: string) => {
    setSubCategory(label);
    setShowAllInCategory(false);
  }, []);

  const handleShowAll = useCallback(() => {
    setSubCategory(null);
    setShowAllInCategory(true);
  }, []);

  // One step back up the ladder, never further.
  const handleBack = useCallback(() => {
    if (subCategory !== null || showAllInCategory) {
      setSubCategory(null);
      setShowAllInCategory(false);
      return;
    }
    setCategorySlug(null);
  }, [subCategory, showAllInCategory]);

  const backToCategory = useCallback(() => {
    setSubCategory(null);
    setShowAllInCategory(false);
  }, []);

  const filtered = useMemo(() => {
    if (searching) {
      return applyFilters(globalSkus ?? [], {
        subCategory: null,
        query: debouncedSearch,
        sort,
      });
    }
    if (!viewingList) return [];
    const source = load.status === "ready" ? load.skus : [];
    return applyFilters(source, { subCategory, query: "", sort });
  }, [searching, globalSkus, viewingList, load, subCategory, debouncedSearch, sort]);

  const searchLoading = globalLoading && globalSkus === null;

  return (
    <div className="space-y-3">
      <SearchBar
        value={search}
        onChange={setSearch}
        onFocus={triggerGlobalPreload}
      />

      {searching ? (
        <>
          <p className="text-base text-slate-600">
            Searching all {manifest.totalSKUs.toLocaleString()} products
          </p>
          <ResultMeta
            shownCount={filtered.length}
            updatedLabel={updatedLabel}
            loading={searchLoading}
          />
          <SortBar sort={sort} onSortChange={setSort} />
          {searchLoading ? (
            <ListSkeleton withLocation />
          ) : (
            <SKUList skus={filtered} showLocation />
          )}
        </>
      ) : category === null ? (
        <CategoryPicker
          categories={manifest.categories}
          onPick={handlePickCategory}
        />
      ) : !viewingList ? (
        <>
          <Breadcrumb onBack={handleBack} />
          <SubCategoryPicker
            category={category}
            onPickSub={handlePickSub}
            onShowAll={handleShowAll}
          />
        </>
      ) : (
        <>
          <Breadcrumb
            trail={[category.label, subCategory ?? "Everything"]}
            onBack={handleBack}
            onTrailClick={backToCategory}
          />
          <ResultMeta
            shownCount={filtered.length}
            updatedLabel={updatedLabel}
            loading={load.status === "loading"}
          />
          <SortBar sort={sort} onSortChange={setSort} />
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

function ListSkeleton({ withLocation = false }: { withLocation?: boolean }) {
  const h = withLocation ? ROW_HEIGHT_WITH_LOCATION : ROW_HEIGHT;
  return (
    <ul
      role="status"
      aria-label="Loading prices"
      className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col justify-center gap-3 px-4"
          style={{ height: h }}
        >
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-12 w-24 rounded-full bg-slate-100" />
          </div>
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
      <p className="text-lg font-bold text-xyris-red">
        Couldn’t load these prices.
      </p>
      <p className="mt-1 text-base text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex h-12 items-center rounded-full bg-xyris-blue px-5 text-base font-bold text-white hover:bg-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-blue"
      >
        Try again
      </button>
    </div>
  );
}
