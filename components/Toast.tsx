"use client";

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8"
    >
      {message ? (
        <div
          role="status"
          className="pointer-events-auto rounded-full bg-xyris-charcoal/95 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
