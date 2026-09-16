import {
  Baby,
  Boxes,
  Candy,
  CookingPot,
  CupSoda,
  HeartPulse,
  Milk,
  Package,
  ShoppingBasket,
  Soup,
  SprayCan,
  Wine,
  type LucideIcon,
} from "lucide-react";

/**
 * A picture to anchor each category. Shoppers who skim rather than read find
 * the aisle by its icon, so these stay stable — changing one moves the shelf.
 * Keyed by slug; unknown categories fall back to a generic basket.
 */
const ICONS: Record<string, LucideIcon> = {
  beverages: CupSoda,
  "liquor-tobacco": Wine,
  "dairy-bakery": Milk,
  "pantry-cooking": CookingPot,
  "canned-goods": Soup,
  "snacks-confectionery": Candy,
  "personal-care": SprayCan,
  "health-pharmacy": HeartPulse,
  household: Package,
  baby: Baby,
  misc: Boxes,
};

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? ShoppingBasket;
}
