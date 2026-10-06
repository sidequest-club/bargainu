// The fixed lists a deal is filed under. No imports here: the React app reads these too.
export const STORES = ['Yodobashi', 'Rakuten', 'Amazon'] as const
export const CHANNELS = ['online', 'in-store'] as const
export const CATEGORIES = [
  'Shoes',
  'Clothing',
  'Audio',
  'Cameras',
  'Computers',
  'Watches',
  'Appliances',
  'Beauty',
  'Bags',
  'Kitchen',
  'Gaming',
  'Furniture',
] as const

export type Store = (typeof STORES)[number]
export type Channel = (typeof CHANNELS)[number]
export type Category = (typeof CATEGORIES)[number]
