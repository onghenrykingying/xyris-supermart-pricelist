"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet } from "./Sheet";
import { useOrder } from "./OrderProvider";
import { formatPeso } from "@/lib/format";
import { MAX_QTY } from "@/lib/orderList";
import {
  buildOrderMessage,
  copyToClipboard,
  smsUrl,
  viberForwardUrl,
} from "@/lib/orderMessage";

export function OrderListSheet({ open }: { open: boolean }) {
  const {
    list,
    totalItems,
    totalPrice,
    settings,
    setQuantity,
    remove,
    clear,
    close,
    toast,
  } = useOrder();
  const [confirmClear, setConfirmClear] = useState(false);

  const empty = list.length === 0;
  const message = empty ? "" : buildOrderMessage(list, settings.brandName);

  const sendMessenger = async () => {
    const ok = await copyToClipboard(message);
    toast(ok ? "Order copied — paste it in Messenger" : "Open Messenger and paste your order");
    window.open(settings.messengerUrl, "_blank", "noopener,noreferrer");
  };
  const sendViber = async () => {
    const ok = await copyToClipboard(message);
    if (!ok) toast("Open Viber and paste your order");
    window.location.href = viberForwardUrl(message);
  };
  const sendSms = () => {
    window.location.href = smsUrl(settings.phoneCall, message);
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title={empty ? "Your order list" : `Your order (${totalItems})`}
    >
      {empty ? (
        <div className="py-6 text-center">
          <p className="font-semibold text-xyris-charcoal">
            Your order list is empty.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Tap the + on any product to add it.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-4 inline-flex items-center rounded-full bg-xyris-blue px-4 py-2 text-sm font-semibold text-white hover:bg-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-blue"
          >
            Browse products
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-200">
            {list.map((e) => {
              const line = e.price * e.quantity;
              return (
                <li key={e.code} className="py-3">
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-xyris-charcoal">
                      {e.name}
                    </p>
                    <p className="text-xs text-slate-500 tabular">
                      {formatPeso(e.price)} each
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button
                          type="button"
                          aria-label={`Decrease ${e.name}`}
                          onClick={() =>
                            setQuantity(e.code, e.quantity - 1)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-l-full text-xyris-blue hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={MAX_QTY}
                          value={e.quantity}
                          onChange={(ev) => {
                            const n = Number.parseInt(ev.target.value, 10);
                            if (!Number.isNaN(n)) setQuantity(e.code, n);
                          }}
                          aria-label={`${e.name} quantity`}
                          className="w-12 border-x border-slate-200 bg-white text-center text-sm font-semibold text-xyris-charcoal tabular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Increase ${e.name}`}
                          onClick={() =>
                            setQuantity(e.code, e.quantity + 1)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-r-full text-xyris-blue hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="font-bold text-xyris-blue tabular">
                        {formatPeso(line)}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(e.code)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-xyris-red hover:text-xyris-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-red rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-xl font-bold text-xyris-blue tabular">
              {formatPeso(totalPrice)}
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-xyris-charcoal">
            Send your order via:
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <SendButton onClick={sendMessenger}>Messenger</SendButton>
            <SendButton onClick={sendViber}>Viber</SendButton>
            <SendButton onClick={sendSms}>SMS</SendButton>
          </div>

          {confirmClear ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-xyris-charcoal">
                Clear all items?
              </p>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-xyris-charcoal hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setConfirmClear(false);
                  }}
                  className="rounded-md bg-xyris-red px-3 py-1.5 text-sm font-semibold text-white hover:bg-xyris-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-red"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xyris-blue"
            >
              Clear list
            </button>
          )}
        </>
      )}
    </Sheet>
  );
}

function SendButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-xyris-blue px-3 py-2 text-sm font-semibold text-white hover:bg-xyris-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-xyris-blue"
    >
      {children}
    </button>
  );
}
