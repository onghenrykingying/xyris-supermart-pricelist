import type { SKU } from "./types";

export interface OrderListEntry {
  code: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderList = OrderListEntry[];

export const STORAGE_KEY = "xyris-order-list";
export const MAX_QTY = 999;

export function readStored(): OrderList {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is OrderListEntry =>
        e !== null &&
        typeof e === "object" &&
        typeof (e as OrderListEntry).code === "string" &&
        typeof (e as OrderListEntry).name === "string" &&
        typeof (e as OrderListEntry).price === "number" &&
        typeof (e as OrderListEntry).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function writeStored(list: OrderList): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // quota exceeded or storage disabled — silently drop
  }
}

export function addEntry(list: OrderList, sku: SKU): OrderList {
  const idx = list.findIndex((e) => e.code === sku.code);
  if (idx === -1) {
    return [
      ...list,
      { code: sku.code, name: sku.name, price: sku.price, quantity: 1 },
    ];
  }
  return list.map((e, i) =>
    i === idx ? { ...e, quantity: Math.min(MAX_QTY, e.quantity + 1) } : e,
  );
}

export function setQuantityIn(
  list: OrderList,
  code: string,
  qty: number,
): OrderList {
  const clamped = Math.max(0, Math.min(MAX_QTY, Math.round(qty)));
  if (clamped === 0) return list.filter((e) => e.code !== code);
  return list.map((e) => (e.code === code ? { ...e, quantity: clamped } : e));
}

export function removeFrom(list: OrderList, code: string): OrderList {
  return list.filter((e) => e.code !== code);
}

export function totalItems(list: OrderList): number {
  return list.reduce((s, e) => s + e.quantity, 0);
}

export function totalPrice(list: OrderList): number {
  return list.reduce((s, e) => s + e.quantity * e.price, 0);
}
