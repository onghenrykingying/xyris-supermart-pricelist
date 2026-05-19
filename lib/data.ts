"use client";

import type { CategoryFile } from "./types";

const cache = new Map<string, Promise<CategoryFile>>();

export function loadCategory(slug: string): Promise<CategoryFile> {
  let inflight = cache.get(slug);
  if (!inflight) {
    inflight = fetch(`/data/${slug}.json`, { cache: "force-cache" }).then(
      async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${slug}.json (${res.status})`);
        }
        return (await res.json()) as CategoryFile;
      },
    );
    inflight.catch(() => cache.delete(slug));
    cache.set(slug, inflight);
  }
  return inflight;
}
