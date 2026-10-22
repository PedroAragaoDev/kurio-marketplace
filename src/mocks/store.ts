import { z } from 'zod'
import { cartSchema, nftSchema, orderSchema, profileSchema, quoteSchema, walletSchema } from '../contracts/models'
import { makeCart, makeCatalog, makeProfile, makeWallet } from './fixtures'

const KEY = 'kurio.demo.v1'
export const scenarios = ['standard', 'slow', 'out-of-order', 'offline', 'server-error', 'session-expired', 'signup-conflict', 'favorite-error', 'payment-refused', 'order-timeout', 'pending'] as const
export const scenarioSchema = z.enum(scenarios)
const userSchema = z.object({ profile: profileSchema, salt: z.string(), hash: z.string(), favorites: z.array(z.string()), wallets: z.array(walletSchema) })
const stateSchema = z.object({
  users: z.array(userSchema), catalog: z.array(nftSchema), carts: z.record(z.string(), cartSchema),
  orders: z.array(orderSchema), quotes: z.record(z.string(), quoteSchema),
  attempts: z.record(z.string(), z.object({ orderId: z.string(), payload: z.string() })),
  session: z.object({ userId: z.string(), expiresAt: z.number(), nonce: z.string() }).nullable(), scenario: scenarioSchema,
})
export type Store = z.infer<typeof stateSchema>
export let db: Store
export const save = () => localStorage.setItem(KEY, JSON.stringify(db))
export const currentUser = () => db.session && db.session.expiresAt > Date.now() ? db.users.find((user) => user.profile.id === db.session?.userId) : undefined
export const owner = () => currentUser()?.profile.id ?? 'visitor'
export const cart = () => db.carts[owner()] ?? (db.carts[owner()] = makeCart())

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000 }, key, 256)
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
export async function reset(scenario: Store['scenario'] = 'standard') {
  const profiles = [makeProfile('user-ana', 'ana'), makeProfile('user-bruno', 'bruno')]
  const users = await Promise.all(profiles.map(async (profile) => {
    const salt = crypto.randomUUID()
    return { profile, salt, hash: await hashPassword('Colecionador!2026', salt), favorites: [], wallets: [makeWallet(profile.id)] }
  }))
  db = { users, catalog: makeCatalog(), carts: { visitor: makeCart() }, orders: [], quotes: {}, attempts: {}, session: null, scenario }
  save()
}
export async function initialize() {
  const stored = localStorage.getItem(KEY)
  if (!stored) return reset()
  try {
    const result = stateSchema.safeParse(JSON.parse(stored))
    if (result.success) { db = result.data; upgradeCatalog(); return }
  } catch { /* A corrupted persisted demo snapshot is replaced as a whole. */ }
  await reset()
}
function upgradeCatalog() {
  for (const nft of db.catalog) {
    nft.image = nft.image.replace(/^\/art\/(emerald|sage|neon|golden)\.png$/, '/art/$1.webp')
    nft.description = nft.description.replace(' Nesta demonstração, toda compra é simulada.', '')
  }
  save()
}
