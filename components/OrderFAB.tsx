"use client";

import { ShoppingCart } from "lucide-react";
import { useOrder } from "./OrderProvider";

export function OrderFAB() {
  const { totalItems, openOrder } = useOrder();
  const hasItems = totalItems > 0;
  return (
    <button
      type="button"
      onClick={openOrder}
      aria-label={
        hasItems
          ? `Order — ${totalItems} items in your list`
          : "Order na — choose Call, Messenger, Viber, or SMS"
      }
      className="md:hidden fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-xyris-red px-5 text-white font-semibold shadow-lg active:scale-95 transition-transform hover:bg-xyris-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-red"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      <span>{hasItems ? `Order (${totalItems})` : "Order na!"}</span>
    </button>
  );
}
