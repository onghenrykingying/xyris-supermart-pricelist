export interface SKU {
  code: string;
  /** Display name — brand abbreviations expanded. See `lib/brandNames.ts`. */
  name: string;
  /** As the POS wrote it, present only when `name` differs. Kept searchable. */
  posName?: string;
  price: number;
  category: string;
  subCategory: string;
}

export interface SubCategoryMeta {
  label: string;
  skuCount: number;
}

export interface CategoryMeta {
  slug: string;
  label: string;
  skuCount: number;
  subCategories: SubCategoryMeta[];
}

/** One Viber line the store answers on. */
export interface ViberContact {
  /** E.164, e.g. "+639159076392" — used to build the viber:// link. */
  number: string;
  /** What a person reads, e.g. "0915 907 6392". */
  display: string;
}

export interface Settings {
  brandName: string;
  brandTagline: string;
  phoneCall: string;
  phoneDisplay: string;
  messengerUrl: string;
  /** Order/enquiry lines. Distinct from viberChannelUrl, which is the promo group. */
  viberContacts: ViberContact[];
  viberChannelUrl: string;
  viberChannelLabel: string;
  footerAddress: string;
  footerNote: string;
}

/**
 * Note: the publisher also writes a `settings` object into manifest.json,
 * deliberately not declared here. Contact details live in
 * `lib/siteSettings.ts` — see the note there.
 */
export interface Manifest {
  generatedAt: string;
  totalSKUs: number;
  categories: CategoryMeta[];
}

export interface CategoryFile {
  category: string;
  generatedAt: string;
  skus: SKU[];
}
