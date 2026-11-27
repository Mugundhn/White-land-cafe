export const INSTAGRAM_URL = 'https://www.instagram.com/white_land_/'
export const MENU_URL = '/menu/'
export const ORDER_URL = 'https://whiteland.beepit.com/ordering/?type=delivery'
export const CAFE = {
  name: 'White Land',
  address: ['1-15, Centrio, 1, Jalan Pantai Murni', 'Pantai Hillpark, 59200 Kuala Lumpur'],
  hours: [{ days: 'Wednesday to Sunday', time: '8.30am to 5pm' }, { days: 'Monday and Tuesday', time: 'Closed' }],
  phone: '03-2703 6053', phoneHref: 'tel:+60327036053',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=White+Land+Cafe+Centario+Pantai+Hillpark+Kuala+Lumpur',
}
export const IMAGES = {
  logo: { src: 'https://files.monstarx.app/5vlryeszub/public/uploads/chat/eovgla3r07/image.png', alt: 'White Land' },
  hero: { src: 'https://files.monstarx.app/5vlryeszub/public/uploads/chat/fnymla3an3/image.png', alt: 'White Land entrance with its sign, staircase and counter' },
  entrance: { src: 'https://files.monstarx.app/5vlryeszub/public/uploads/chat/5xkgzv8v3k/image.png', alt: 'White Land entrance with its sign, staircase and counter' },
  room: { src: 'https://files.monstarx.app/5vlryeszub/public/uploads/chat/6h5xc6nwjn/image.png', alt: 'Inside White Land, with a high white ceiling, wood counter and upstairs seating' },
}
export type CoffeeVessel = 'demitasse' | 'glass-mug' | 'cup' | 'tall-glass'
export type CoffeeLiquid = 'espresso' | 'water' | 'milk'
export interface CoffeeItem {
  id: string; name: string; subtitle?: string; description?: string; vessel: CoffeeVessel;
  layers: { type: CoffeeLiquid; amount: number }[]; crema?: boolean; foam?: number; art?: 'heart' | 'none'; blend?: number
}
export const DRINKS: CoffeeItem[] = [
  { id: 'espresso', name: 'Espresso', subtitle: 'Single origin, pulled short', description: 'a short, intense shot with golden crema', vessel: 'demitasse', layers: [{ type: 'espresso', amount: 0.72 }], crema: true },
  { id: 'long-black', name: 'Long black', subtitle: 'Double shot over hot water', description: 'two shots of espresso poured over hot water', vessel: 'glass-mug', layers: [{ type: 'water', amount: 0.54 }, { type: 'espresso', amount: 0.24 }], crema: true, blend: 0.9 },
  { id: 'flat-white', name: 'Flat white', subtitle: 'Thin microfoam, strong finish', description: 'espresso with a thin layer of silky steamed milk', vessel: 'cup', layers: [{ type: 'espresso', amount: 0.32 }, { type: 'milk', amount: 0.42 }], foam: 0.07, art: 'heart' },
  { id: 'latte', name: 'Latte', subtitle: 'Mellow, served in glass', description: 'espresso with lots of steamed milk and microfoam', vessel: 'tall-glass', layers: [{ type: 'espresso', amount: 0.25 }, { type: 'milk', amount: 0.51 }], foam: 0.11, blend: 0.15 },
]
export const GOOGLE = { rating: 4.7, count: 504, checked: '26 Nov 2026', url: 'https://www.google.com/maps/place/White+Land+Cafe+%7C+Specialty+Coffee/@3.1078814,101.6659719,17z' }
