"use client";

import { Phone, MessageCircle, Send } from "lucide-react";
import { Sheet } from "./Sheet";
import { useOrder } from "./OrderProvider";
import { formatPeso } from "@/lib/format";
import {
  buildOrderMessage,
  callUrl,
  copyToClipboard,
  smsUrl,
  viberForwardUrl,
} from "@/lib/orderMessage";

export function OrderSheet({ open }: { open: boolean }) {
  const {
    list,
    totalItems,
    totalPrice,
    settings,
    close,
    openList,
    toast,
  } = useOrder();

  const hasItems = list.length > 0;
  const message = hasItems
    ? buildOrderMessage(list, settings.brandName)
    : "";

  const onMessenger = async () => {
    if (hasItems) {
      const ok = await copyToClipboard(message);
      toast(ok ? "Order copied — paste it in Messenger" : "Open Messenger and paste your order");
    }
    window.open(settings.messengerUrl, "_blank", "noopener,noreferrer");
    close();
  };

  const onViber = async () => {
    if (hasItems) {
      const ok = await copyToClipboard(message);
      if (!ok) toast("Open Viber and paste your order");
    }
    const url = hasItems ? viberForwardUrl(message) : settings.viberChat;
    window.location.href = url;
    close();
  };

  const onCall = () => {
    window.location.href = callUrl(settings.phoneCall);
    close();
  };

  const onSms = () => {
    if (!hasItems) {
      window.location.href = `sms:${settings.phoneCall}`;
    } else {
      window.location.href = smsUrl(settings.phoneCall, message);
    }
    close();
  };

  return (
    <Sheet open={open} onClose={close} title="How would you like to order?">
      {hasItems ? (
        <div className="mb-3 rounded-lg bg-xyris-yellow-light p-3">
          <p className="text-sm">
            <span className="font-semibold">Your order:</span>{" "}
            <span className="tabular">{totalItems}</span> items,{" "}
            <span className="tabular font-semibold">
              {formatPeso(totalPrice)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => openList()}
            className="mt-1 text-sm font-semibold text-xyris-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue rounded"
          >
            View list
          </button>
        </div>
      ) : null}
      <ul className="flex flex-col gap-2">
        <li>
          <Option
            icon={<Phone className="h-5 w-5" aria-hidden="true" />}
            label="Call us"
            sublabel={settings.phoneDisplay}
            onClick={onCall}
          />
        </li>
        <li>
          <Option
            icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
            label="Message on Messenger"
            sublabel={hasItems ? "Order will be copied to clipboard" : undefined}
            onClick={onMessenger}
          />
        </li>
        <li>
          <Option
            icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
            label="Chat on Viber"
            sublabel={hasItems ? "Pre-filled with your order" : undefined}
            onClick={onViber}
          />
        </li>
        <li>
          <Option
            icon={<Send className="h-5 w-5" aria-hidden="true" />}
            label="Send via SMS"
            sublabel={hasItems ? "Pre-filled with your order" : undefined}
            onClick={onSms}
          />
        </li>
      </ul>
      <button
        type="button"
        onClick={close}
        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
      >
        Cancel
      </button>
    </Sheet>
  );
}

function Option({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-xyris-yellow-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-xyris-yellow text-xyris-blue">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-xyris-charcoal">{label}</span>
        {sublabel ? (
          <span className="block text-xs text-slate-500">{sublabel}</span>
        ) : null}
      </span>
    </button>
  );
}
