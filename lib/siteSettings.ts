import type { Settings } from "./types";

/**
 * Contact details and site copy.
 *
 * These used to live in the Google Sheet's Settings tab, on the reasoning
 * that the site could then be updated without a redeploy. That reasoning
 * did not hold: publishing commits to GitHub, which rebuilds on Vercel, so
 * a Sheet edit costs a deploy either way. What it did cost was correctness —
 * `viber_channel_url` sat in production pointing at the one-to-one chat
 * instead of the group invite, identical to the one-to-one chat line below it, and
 * nothing surfaced it. Here the two sit side by side in every diff.
 *
 * Changing any of this means a code change and a push, so it is no longer
 * self-service from the spreadsheet. These values move about once a year.
 *
 * The publisher still writes a `settings` object into manifest.json. The
 * site ignores it, and `Manifest` no longer declares it, so TypeScript will
 * stop anyone reaching for it by accident.
 */
export const SITE_SETTINGS: Settings = {
  brandName: "Xyris Supermart",
  brandTagline: "Save More Live Bright",

  // E.164 for tel: and sms: links.
  phoneCall: "+639281849118",
  // What a person reads.
  phoneDisplay: "0928 184 9118",

  messengerUrl: "https://m.me/xyrissupermartph",

  // The lines the store answers on. Order matters: the first is the default
  // when there is no order to carry. The phone number above stays as it was —
  // it is for calls and SMS, and is no longer a Viber contact.
  viberContacts: [
    { number: "+639159076392", display: "0915 907 6392" },
    { number: "+639703875708", display: "0970 387 5708" },
  ],

  // The public group. %2B and %2F are part of the invite token — decoding
  // them to + and / breaks the link, which is exactly the sort of damage a
  // spreadsheet paste can do silently.
  viberChannelUrl:
    "https://invite.viber.com/?g2=AQBAATi%2BW6VmWFaRDybqVijvqIARN3uqWl%2FvkIiD04qKC7o0eSi6d1LbiKvbyWeO",
  viberChannelLabel: "Join us on Viber for promos",

  footerAddress: "Block 42 Lot 6 Xyris Street, Taguig, Metro Manila",
  footerNote: "Prices subject to change without notice.",
};
