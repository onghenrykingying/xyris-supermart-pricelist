"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useOrder } from "./OrderProvider";

const DISMISS_KEY = "viberBannerDismissed";

export function ViberBanner() {
  const { settings } = useOrder();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
      setShouldShow(!dismissed);
    } catch {
      setShouldShow(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setShouldShow(false);
  };

  if (!shouldShow) return null;

  return (
    <div className="bg-xyris-blue text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm md:text-base">
        <a
          href={settings.viberChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-2 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-xyris-blue rounded"
        >
          <span>{settings.viberChannelLabel}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
