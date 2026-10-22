import { z } from 'zod'

export const decimal = z.string().regex(/^\d+(?:\.\d{1,18})?$/)
export const network = z.enum(['Ethereum', 'Polygon', 'Base'])
export const provider = z.enum(['MetaMask', 'WalletConnect', 'Coinbase Wallet'])
export const walletAddress = z.string().trim().regex(/^0x[a-fA-F0-9]{40}$/, 'Informe um endereço 0x com 40 caracteres hexadecimais')
export const editionSchema = z.object({ id: z.string(), label: z.string(), price: decimal, stock: z.number().int().nonnegative() })
export const nftSchema = z.object({
  id: z.string(), name: z.string(), image: z.string(), collection: z.string(), category: z.string(),
  network, description: z.string(), rarity: z.string(), version: z.number().int(),
  editions: z.array(editionSchema), featured: z.boolean(), popularity: z.number(), createdAt: z.string(), rating: z.string(), reviewCount: z.number().int(),
})
export const profileSchema = z.object({
  id: z.string(), email: z.email(), username: z.string(), displayName: z.string(),
  ens: z.string(), nickname: z.string(), avatar: z.string(),
})
export const walletSchema = z.object({
  id: z.string(), label: z.string(), address: z.string(), network, provider, primary: z.boolean(),
  profileName: z.string(), email: z.string(), ens: z.string(), referral: z.string(),
})
export const cartLineSchema = z.object({ lineId: z.string().uuid(), nftId: z.string(), editionId: z.string(), quantity: z.number().int().positive().max(100) })
export const cartSchema = z.object({ items: z.array(cartLineSchema), coupon: z.string(), version: z.number().int() })
export const quoteItemSchema = cartLineSchema.extend({ name: z.string(), image: z.string(), edition: z.string(), price: decimal, total: decimal })
export const quoteSchema = z.object({
  id: z.string(), ownerId: z.string(), fingerprint: z.string(), expiresAt: z.number(), cartVersion: z.number(),
  items: z.array(quoteItemSchema), subtotal: decimal, discount: decimal, fee: decimal, total: decimal, coupon: z.string(),
})
export const collectorSchema = z.object({
  displayName: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(40),
  email: z.email(), profileName: z.string().max(80), ens: z.string().max(100),
  referral: z.string().max(40), notes: z.string().max(500),
  network: network.optional(), walletAddress: walletAddress.optional(), walletProvider: provider.optional(),
  secondaryWallet: z.string().trim().max(100).optional(),
})
export const orderSchema = z.object({
  id: z.string(), userId: z.string(), version: z.number().int(), createdAt: z.string(), settleAt: z.number(),
  status: z.enum(['pending', 'confirmed', 'refused']), outcome: z.enum(['confirmed', 'refused']),
  quote: quoteSchema, wallet: walletSchema, collector: collectorSchema, transaction: z.string(),
})
export const sessionSchema = z.object({ user: profileSchema.nullable(), expiresAt: z.number().nullable(), nonce: z.string().nullable() })
export const catalogSearchSchema = z.object({
  q: z.string().max(100).catch(''), category: z.string().max(40).catch(''),
  network: z.enum(['', 'Ethereum', 'Polygon', 'Base']).catch(''),
  sort: z.enum(['recent', 'price-asc', 'price-desc', 'popular']).catch('recent'),
  tab: z.enum(['all', 'new', 'trending']).catch('all'),
  min: z.string().regex(/^(?:\d+(?:\.\d{1,18})?)?$/).catch(''), max: z.string().regex(/^(?:\d+(?:\.\d{1,18})?)?$/).catch(''),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
})
export const catalogSchema = z.object({ items: z.array(nftSchema), total: z.number(), pages: z.number(), categories: z.array(z.string()) })
export const eventSchema = z.object({
  id: z.string(), resourceId: z.string(), version: z.number().int().positive(), userId: z.string().nullable(),
})
export type Nft = z.infer<typeof nftSchema>
export type Profile = z.infer<typeof profileSchema>
export type Wallet = z.infer<typeof walletSchema>
export type Cart = z.infer<typeof cartSchema>
export type CartLine = z.infer<typeof cartLineSchema>
export type Quote = z.infer<typeof quoteSchema>
export type Order = z.infer<typeof orderSchema>
export type Collector = z.infer<typeof collectorSchema>
export type CatalogSearch = z.infer<typeof catalogSearchSchema>
