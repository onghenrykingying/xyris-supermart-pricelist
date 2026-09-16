export interface SKU {
  code: string;
  name: string;
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

export interface Settings {
  brandName: string;
  brandTagline: string;
  phoneCall: string;
  phoneDisplay: string;
  messengerUrl: string;
  viberChat: string;
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
