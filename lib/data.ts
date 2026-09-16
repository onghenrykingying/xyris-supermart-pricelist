"use client";

import type { CategoryFile, Manifest, SKU } from "./types";
import { expandBrand } from "./brandNames";

const cache = new Map<string, Promise<CategoryFile>>();

function withDisplayName(sku: SKU): SKU {
  const name = expandBrand(sku.name);
  return name === sku.name ? sku : { ...sku, name, posName: sku.name };
}

export function loadCategory(slug: string): Promise<CategoryFile> {
  let inflight = cache.get(slug);
  if (!inflight) {
    inflight = fetch(`/data/${slug}.json`, { cache: "force-cache" }).then(
      async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${slug}.json (${res.status})`);
        }
        const file = (await res.json()) as CategoryFile;
        // Expand once, here, so every screen and the order list agree on the
        // name a shopper was shown.
        return { ...file, skus: file.skus.map(withDisplayName) };
      },
    );
    inflight.catch(() => cache.delete(slug));
    cache.set(slug, inflight);
  }
  return inflight;
}

let allInflight: Promise<SKU[]> | null = null;

export function loadAllCategories(manifest: Manifest): Promise<SKU[]> {
  if (allInflight) return allInflight;
  allInflight = Promise.all(
    manifest.categories.map((c) => loadCategory(c.slug)),
  ).then((files) => files.flatMap((f) => f.skus));
  allInflight.catch(() => {
    allInflight = null;
  });
  return allInflight;
}
