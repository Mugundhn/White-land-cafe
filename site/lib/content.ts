import type { CoffeeItem } from "@/components/ui/coffee-pour-menu";

/**
 * Everything the café may want to edit lives here.
 * Hours and phone come from public write-ups of White Land; confirm them
 * with the café before launch.
 */
export const INSTAGRAM_URL = "https://www.instagram.com/white_land_/";

/** The White Land flip-book ordering menu, served by this site at /menu/ (checkout continues on Beep). */
export const MENU_URL = "/menu/";

/** Beep delivery and takeaway: direct link. */
export const ORDER_URL = "https://whiteland.beepit.com/ordering/?type=delivery";

export const CAFE = {
  name: "White Land",
  address: ["1-15, Centrio, 1, Jalan Pantai Murni", "Pantai Hillpark, 59200 Kuala Lumpur"],
  hours: [
    { days: "Wednesday to Sunday", time: "8.30am to 5pm" },
    { days: "Monday and Tuesday", time: "Closed" },
  ],
  phone: "03-2703 6053",
  phoneHref: "tel:+60327036053",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=White+Land+Cafe+Centario+Pantai+Hillpark+Kuala+Lumpur",
};

/**
 * Unsplash placeholders. Swap these for the café's own photos
 * (drop files in /public and use "/your-photo.jpg").
 */
const u = (id: string, w = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: { src: "/hero-entrance.jpg", alt: "The White Land entrance: a white wall with the black White Land sign, a staircase and the counter seen through the glass" },
  room: { src: "/room-interior.jpg", alt: "Inside White Land: a high white ceiling, a wooden counter with green stools, and tables in the light" },
  sandwich: { src: u("photo-1528735602780-2552fd46c7af"), alt: "A pressed sandwich cut in half" },
  coffee: { src: u("photo-1495474472287-4d71bcdd2085", 1200), alt: "A cup of coffee on a pale table" },
};

/** Drinks for the pour menu. Vessels and layers drive the animation. */
export const DRINKS: CoffeeItem[] = [
  {
    id: "espresso",
    name: "Espresso",
    subtitle: "Single origin, pulled short",
    description: "a short, intense shot with golden crema",
    vessel: "demitasse",
    layers: [{ type: "espresso", amount: 0.72 }],
    crema: true,
  },
  {
    id: "long-black",
    name: "Long black",
    subtitle: "Double shot over hot water",
    description: "two shots of espresso poured over hot water",
    vessel: "glass-mug",
    layers: [
      { type: "water", amount: 0.54 },
      { type: "espresso", amount: 0.24 },
    ],
    crema: true,
    blend: 0.9,
  },
  {
    id: "flat-white",
    name: "Flat white",
    subtitle: "Thin microfoam, strong finish",
    description: "espresso with a thin layer of silky steamed milk",
    vessel: "cup",
    layers: [
      { type: "espresso", amount: 0.32 },
      { type: "milk", amount: 0.42 },
    ],
    foam: 0.07,
    art: "heart",
  },
  {
    id: "latte",
    name: "Latte",
    subtitle: "Mellow, served in glass",
    description: "espresso with lots of steamed milk and microfoam",
    vessel: "tall-glass",
    layers: [
      { type: "espresso", amount: 0.25 },
      { type: "milk", amount: 0.51 },
    ],
    foam: 0.11,
    blend: 0.15,
  },
];

/**
 * Google rating, read from the public Google Maps listing on 26 Nov 2026 (signed-out view).
 * Update these when you refresh, or replace with the Places API later.
 */
export const GOOGLE = {
  rating: 4.7,
  count: 504,
  checked: "26 Nov 2026",
  url: "https://www.google.com/maps/place/White+Land+Cafe+%7C+Specialty+Coffee/@3.1078814,101.6659719,17z",
};

/**
 * Individual Google reviews to feature. Left empty on purpose: add only reviews you are happy to show,
 * copied exactly, with the reviewer's name as shown on Google, e.g.
 * { name: "Aisyah R.", rating: 5, text: "Quiet, bright and the long black is excellent.", when: "a month ago" }
 */
export type GoogleReview = { name: string; rating: number; text: string; when?: string };
export const REVIEWS: GoogleReview[] = [];
