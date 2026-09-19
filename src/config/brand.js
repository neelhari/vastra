// Central brand config — edit here, not in components.
// Source: client requirement form + WhatsApp message, 2026-08-14.

export const BRAND = {
  name: "Aalaya Vastra",
  tagline: "Tradition for Every Generation",
  subTagline: "Timeless. Tradition. Modern You.",
  motto: "Wear the tradition. Own the style. Celebrate YOU.",

  ownerName: "Harini",
  ownerFullName: "Jupudi Harini",

  phone: "6301646462",
  // wa.me requires country code, no + or spaces
  whatsappNumber: "916301646462",
  email: "aalayavastra2026@gmail.com",
  adminEmail: "aalayavastra2026@gmail.com",

  address: {
    line1: "Main Bazaar Road",
    line2: "Near Temple",
    city: "Rajahmundry",
    state: "Andhra Pradesh",
    pincode: "533101",
    full: "Main Bazaar Road, Rajahmundry, Andhra Pradesh - 533101",
  },

  gstin: "37AAAAA0000A1Z5",

  // TODO: client hasn't shared social handles yet — replace when available
  instagramHandle: "@aalayavastra",

  about: `Aalaya Vastra is a destination for women's fashion where timeless tradition meets modern elegance. From graceful sarees and beautiful ethnic wear to stylish contemporary outfits, our collection is thoughtfully chosen to suit every generation and every occasion.

Whether it's a festival, wedding, celebration, or an everyday look, Aalaya Vastra brings you style, quality, comfort, and elegance — all under one roof.`,

  // From the client's "Our Collection" graphic
  collectionHighlights: [
    "Handloom Sarees",
    "Handpicked Collection",
    "Premium Cotton Sarees",
    "Two Cut Piece Sarees",
    "Blouse Pieces",
    "Dress Collections",
    "Petticoats",
    "Towels",
  ],

  freeShippingThreshold: 2000,
};

export function waLink(message, customNumber = null) {
  const rawNum = customNumber || BRAND.whatsappNumber || BRAND.phone || '';
  const clean = rawNum.replace(/\D/g, '');
  const formatted = clean.startsWith('91') && clean.length === 12 ? clean : `91${clean.replace(/^0+/, '')}`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}
