import Image from "next/image";
import { OrderButton } from "./OrderButton";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-xyris-yellow border-b border-black/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/logo.png"
            alt="Xyris Supermart"
            width={56}
            height={56}
            priority
            className="h-12 w-12 md:h-14 md:w-14 rounded-md object-contain"
          />
          <div className="min-w-0">
            <p className="font-bold text-xyris-blue leading-tight text-base md:text-lg">
              Xyris Supermart
            </p>
            <p className="text-xs md:text-sm text-xyris-red font-semibold leading-tight">
              Save More Live Bright
            </p>
          </div>
        </div>
        <OrderButton />
      </div>
    </header>
  );
}
