"use client";

import { ArrowRight, Megaphone } from "lucide-react";
import { useOrder } from "./OrderProvider";

export const VIBER_CARD_HEIGHT = 72;

export function ViberCard() {
  const { settings } = useOrder();
  return (
    <a
      href={settings.viberChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ height: VIBER_CARD_HEIGHT }}
      className="flex items-center gap-3 border-b border-slate-200 bg-xyris-yellow px-4 hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-xyris-blue"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-xyris-blue text-white">
        <Megaphone className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-xyris-blue">
          Stay updated on Viber
        </span>
        <span className="block text-xs text-xyris-charcoal/70">
          {settings.viberChannelLabel}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-xyris-blue">
        Join
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </a>
  );
}
