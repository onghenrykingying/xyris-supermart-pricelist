export interface SKU {
  code: string;
  name: string;
  price: number;
  category: string;
  subCategory: string;
  brand: string;
}

export interface SubCategoryMeta {
  label: string;
  skuCount: number;
  brands: string[];
}

export interface CategoryMeta {
  slug: string;
  label: string;
  skuCount: number;
  subCategories: SubCategoryMeta[];
  brands: string[];
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

export interface Manifest {
  generatedAt: string;
  totalSKUs: number;
  categories: CategoryMeta[];
  settings: Settings;
}

export interface CategoryFile {
  category: string;
  generatedAt: string;
  skus: SKU[];
}
