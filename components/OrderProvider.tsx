"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SKU, Settings } from "@/lib/types";
import {
  addEntry,
  readStored,
  removeFrom,
  setQuantityIn,
  STORAGE_KEY,
  totalItems,
  totalPrice,
  writeStored,
  type OrderList,
} from "@/lib/orderList";
import { Toast } from "./Toast";
import { OrderSheet } from "./OrderSheet";
import { OrderListSheet } from "./OrderListSheet";

type Sheet = "none" | "order" | "list";

interface ContextValue {
  list: OrderList;
  totalItems: number;
  totalPrice: number;
  settings: Settings;
  add: (sku: SKU) => void;
  remove: (code: string) => void;
  setQuantity: (code: string, qty: number) => void;
  clear: () => void;
  openOrder: () => void;
  openList: () => void;
  close: () => void;
  toast: (msg: string) => void;
}

const OrderContext = createContext<ContextValue | null>(null);

export function useOrder(): ContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

export function OrderProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  const [list, setList] = useState<OrderList>([]);
  const [hydrated, setHydrated] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("none");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setList(readStored());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setList(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(list);
  }, [list, hydrated]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const add = useCallback(
    (sku: SKU) => {
      setList((prev) => addEntry(prev, sku));
      toast("Added to order");
    },
    [toast],
  );

  const remove = useCallback((code: string) => {
    setList((prev) => removeFrom(prev, code));
  }, []);

  const setQuantity = useCallback((code: string, qty: number) => {
    setList((prev) => setQuantityIn(prev, code, qty));
  }, []);

  const clear = useCallback(() => {
    setList([]);
    toast("Order list cleared");
  }, [toast]);

  const openOrder = useCallback(() => setSheet("order"), []);
  const openList = useCallback(() => setSheet("list"), []);
  const close = useCallback(() => setSheet("none"), []);

  const value = useMemo<ContextValue>(
    () => ({
      list,
      totalItems: totalItems(list),
      totalPrice: totalPrice(list),
      settings,
      add,
      remove,
      setQuantity,
      clear,
      openOrder,
      openList,
      close,
      toast,
    }),
    [
      list,
      settings,
      add,
      remove,
      setQuantity,
      clear,
      openOrder,
      openList,
      close,
      toast,
    ],
  );

  return (
    <OrderContext.Provider value={value}>
      {children}
      <OrderSheet open={sheet === "order"} />
      <OrderListSheet open={sheet === "list"} />
      <Toast message={toastMsg} />
    </OrderContext.Provider>
  );
}
