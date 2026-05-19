import fs from "node:fs/promises";
import path from "node:path";
import type { Manifest } from "./types";

export async function readManifest(): Promise<Manifest> {
  const file = path.join(process.cwd(), "public", "data", "manifest.json");
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as Manifest;
}
