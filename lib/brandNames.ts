/**
 * The POS writes some brands as initials, and writes a few of them both ways:
 * 54 products start with KNR and another 21 with KNORR. Sorted A-Z those land
 * next to each other in two spellings, which reads as a fault. So the site
 * settles on one spelling per brand for display, and keeps whatever the POS
 * wrote searchable alongside it.
 *
 * Only the START of a product name is rewritten, and only on a whole-token
 * match. The same letters turn up mid-name meaning something else —
 * "TIDE POW.PREMIUM P-CLEAN PF 67GX216" is not a Pure Foods product, and
 * "CASINO FEMME ALC. W/ DM 500ML" is not Del Monte. Rewriting those would put
 * the wrong brand on the shelf.
 *
 * CDO and RDL are listed on purpose although they expand to themselves: the
 * short form IS the brand, and saying so here stops a wrong guess later.
 */
const BRANDS: Record<string, string> = {
  PF: "Pure Foods",
  DM: "Del Monte",
  JB: "Johnson's Baby",
  CDO: "CDO",
  GC: "Green Cross",
  BBFLO: "Babyflo",
  KNR: "Knorr",
  RDL: "RDL",
};

/**
 * Every spelling the POS might use, pointing at the one we show. Longest
 * first, so "GREEN CROSS" wins over any shorter prefix of it.
 */
const ALIASES: [alias: string, display: string][] = Object.entries(BRANDS)
  .flatMap(([abbr, full]) => {
    const upper = full.toUpperCase();
    return upper === abbr
      ? [[abbr, full] as [string, string]]
      : [
          [abbr, full] as [string, string],
          [upper, full] as [string, string],
        ];
  })
  .filter(([alias, display]) => alias !== display)
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Returns the name as a shopper should read it. Anything not matched at the
 * start is left exactly as the POS wrote it.
 */
export function expandBrand(name: string): string {
  for (const [alias, display] of ALIASES) {
    if (!name.startsWith(alias)) continue;
    const next = name.charAt(alias.length);
    // Must end the token: "GC COOL" and "KNR.ORIG" match, "GCX" does not.
    if (next !== "" && next !== " " && next !== ".") continue;
    const rest = name.slice(alias.length);
    // "KNR.ORIG" becomes "Knorr ORIG", not "Knorr.ORIG".
    return display + (rest.startsWith(".") ? " " + rest.slice(1) : rest);
  }
  return name;
}
