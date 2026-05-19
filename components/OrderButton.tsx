"use client";

import { Phone, ChevronDown } from "lucide-react";
import { useOrder } from "./OrderProvider";

export function OrderButton() {
  const { totalItems, openOrder } = useOrder();
  const hasItems = totalItems > 0;
  return (
    <button
      type="button"
      onClick={openOrder}
      aria-label={
        hasItems
          ? `Order — ${totalItems} items in your list`
          : "Order — choose Call, Messenger, Viber, or SMS"
      }
      className="inline-flex items-center gap-1.5 rounded-full bg-xyris-blue px-3 py-2 md:px-4 text-white font-semibold text-sm md:text-base shadow-sm hover:bg-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-blue"
    >
      <Phone className="h-4 w-4" aria-hidden="true" />
      <span>{hasItems ? `Order (${totalItems})` : "Order"}</span>
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
