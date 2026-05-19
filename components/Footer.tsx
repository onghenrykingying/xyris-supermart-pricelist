import { ArrowUpRight } from "lucide-react";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-8 bg-xyris-yellow-light">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
        <p className="font-semibold text-xyris-charcoal">{settings.brandName}</p>
        <p className="mt-1">{settings.footerAddress}</p>
        <p className="mt-1">{settings.footerNote}</p>
        <a
          href={settings.viberChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-xyris-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue rounded"
        >
          {settings.viberChannelLabel}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
