import { Header } from "@/components/Header";
import { ViberBanner } from "@/components/ViberBanner";
import { Catalog } from "@/components/Catalog";
import { Footer } from "@/components/Footer";
import { OrderFAB } from "@/components/OrderFAB";
import { OrderProvider } from "@/components/OrderProvider";
import { readManifest } from "@/lib/manifest";
import { SITE_SETTINGS } from "@/lib/siteSettings";
import { relativeTime } from "@/lib/time";

export default async function HomePage() {
  const manifest = await readManifest();
  const updatedLabel = relativeTime(manifest.generatedAt);

  return (
    <OrderProvider settings={SITE_SETTINGS}>
      <Header />
      <ViberBanner />
      <main className="mx-auto max-w-6xl px-4 pt-3 pb-28 md:pb-12">
        <Catalog manifest={manifest} updatedLabel={updatedLabel} />
      </main>
      <Footer settings={SITE_SETTINGS} />
      <OrderFAB />
    </OrderProvider>
  );
}
