import { ArrowUpRight, Facebook, MessageCircle, Phone } from "lucide-react";
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

        <p className="mt-4 text-xs font-semibold text-xyris-charcoal">Contact Us</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {settings.phoneCall ? (
            <a
              href={`tel:${settings.phoneCall}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <Phone className="h-3.5 w-3.5 text-xyris-blue" aria-hidden="true" />
              {settings.phoneDisplay || settings.phoneCall}
            </a>
          ) : null}
          {settings.viberChat ? (
            <a
              href={settings.viberChat}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#7360F2]" aria-hidden="true" />
              Viber
            </a>
          ) : null}
          {settings.messengerUrl ? (
            <a
              href={settings.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              <Facebook className="h-3.5 w-3.5 text-[#0866FF]" aria-hidden="true" />
              Messenger
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
