import { ArrowUpRight, Facebook, MessageCircle, Phone } from "lucide-react";
import type { Settings } from "@/lib/types";
import { viberChatUrl } from "@/lib/orderMessage";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-8 bg-xyris-yellow-light">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
        <p className="text-base font-bold text-xyris-charcoal">
          {settings.brandName}
        </p>
        <p className="mt-1">{settings.footerAddress}</p>
        <p className="mt-1">{settings.footerNote}</p>
        <a
          href={settings.viberChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-xyris-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue rounded"
        >
          {settings.viberChannelLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>

        <p className="mt-3 text-base font-bold text-xyris-charcoal">Contact Us</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {settings.phoneCall ? (
            <Chip href={`tel:${settings.phoneCall}`}>
              <Phone className="h-4 w-4 text-xyris-blue" aria-hidden="true" />
              {settings.phoneDisplay || settings.phoneCall}
            </Chip>
          ) : null}

          {settings.viberContacts.map((c) => (
            <Chip key={c.number} href={viberChatUrl(c.number)}>
              <MessageCircle
                className="h-4 w-4 text-[#7360F2]"
                aria-hidden="true"
              />
              Viber {c.display}
            </Chip>
          ))}

          {settings.messengerUrl ? (
            <Chip href={settings.messengerUrl} external>
              <Facebook className="h-4 w-4 text-[#0866FF]" aria-hidden="true" />
              Messenger
            </Chip>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function Chip({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
    >
      {children}
    </a>
  );
}
