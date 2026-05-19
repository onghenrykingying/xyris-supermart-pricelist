import type { OrderList } from "./orderList";
import type { Settings } from "./types";
import { formatPeso } from "./format";

export function buildOrderMessage(
  list: OrderList,
  brandName: string,
): string {
  if (list.length === 0) return "";
  const lines = list.map(
    (e) =>
      `• ${e.name} × ${e.quantity} — ${formatPeso(
        e.quantity * e.price,
      )}`,
  );
  const total = list.reduce((s, e) => s + e.quantity * e.price, 0);
  return [
    `Hi ${brandName}! I'd like to order:`,
    "",
    ...lines,
    "",
    `Total: ${formatPeso(total)}`,
    "",
    "Thank you!",
  ].join("\n");
}

export function viberForwardUrl(message: string): string {
  return `viber://forward?text=${encodeURIComponent(message)}`;
}

export function smsUrl(phoneE164: string, message: string): string {
  return `sms:${phoneE164}?body=${encodeURIComponent(message)}`;
}

export function callUrl(phoneE164: string): string {
  return `tel:${phoneE164}`;
}

export function messengerUrl(settings: Settings): string {
  return settings.messengerUrl;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
