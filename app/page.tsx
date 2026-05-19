import { Header } from "@/components/Header";
import { ViberBanner } from "@/components/ViberBanner";
import { Catalog } from "@/components/Catalog";
import { Footer } from "@/components/Footer";
import { OrderFAB } from "@/components/OrderFAB";
import { OrderProvider } from "@/components/OrderProvider";
import { readManifest } from "@/lib/manifest";
import { relativeTime } from "@/lib/time";

export default async function HomePage() {
  const manifest = await readManifest();
  const updatedLabel = relativeTime(manifest.generatedAt);

  return (
    <OrderProvider settings={manifest.settings}>
      <Header />
      <ViberBanner />
      <main className="mx-auto max-w-6xl px-4 pt-3 pb-12">
        <Catalog manifest={manifest} updatedLabel={updatedLabel} />
      </main>
      <Footer settings={manifest.settings} />
      <OrderFAB />
    </OrderProvider>
  );
}
