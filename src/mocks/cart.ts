import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { cartLineSchema } from '../contracts/models'
import { walletInput } from '../contracts/inputs'
import { body, failure, guard } from './http'
import { cart, currentUser, db, save } from './store'
import { quoteResponse } from './quote'

async function updateCart(request: Request) {
  const parsed = await body(request, cartLineSchema.omit({ lineId: true }).extend({ quantity: z.number().int().min(0).max(100) }))
  if (!parsed.ok) return parsed.response
  const { nftId, editionId, quantity } = parsed.data
  const nft = db.catalog.find((item) => item.id === nftId)
  const edition = nft?.editions.find((item) => item.id === editionId)
  if (!nft || !edition) return failure(404, 'NOT_FOUND', 'NFT ou edição não encontrado.')
  if (quantity > edition.stock) return failure(409, 'STOCK_CONFLICT', `Disponível: ${edition.stock} unidade(s).`)
  const current = cart()
  const previous = current.items.find((item) => item.nftId === nftId && item.editionId === editionId)
  current.items = current.items.filter((item) => item.nftId !== nftId || item.editionId !== editionId)
  if (quantity) current.items.push({ lineId: previous?.lineId ?? crypto.randomUUID(), nftId, editionId, quantity })
  current.version++; save()
  return HttpResponse.json(current)
}
async function coupon(request: Request) {
  const parsed = await body(request, z.object({ code: z.string().max(40) }))
  if (!parsed.ok) return parsed.response
  const code = parsed.data.code.trim().toUpperCase()
  if (code === 'EXPIRED') return failure(422, 'COUPON_EXPIRED', 'Este cupom expirou.')
  if (code && code !== 'KURIO10') return failure(422, 'INVALID_COUPON', 'Cupom inválido. Confira o código.')
  const current = cart(); current.coupon = code; current.version++; save()
  return HttpResponse.json(current)
}
async function wallet(request: Request, id?: string) {
  const parsed = await body(request, walletInput)
  if (!parsed.ok) return parsed.response
  const user = currentUser()!
  if (id && !user.wallets.some((entry) => entry.id === id)) return failure(404, 'NOT_FOUND', 'Carteira não encontrada.')
  if (!id && user.wallets.length >= 2) return failure(409, 'WALLET_LIMIT', 'Você pode manter até duas carteiras.')
  const entry = { ...parsed.data, id: id ?? crypto.randomUUID() }
  if (entry.primary) user.wallets.forEach((item) => { item.primary = false })
  user.wallets = [...user.wallets.filter((item) => item.id !== entry.id), entry]
  if (!user.wallets.some((item) => item.primary)) user.wallets[0].primary = true
  save(); return HttpResponse.json(user.wallets)
}
export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => (await guard(false, request)) ?? HttpResponse.json(cart())),
  http.put('/api/cart', async ({ request }) => (await guard(false, request)) ?? updateCart(request)),
  http.put('/api/cart/coupon', async ({ request }) => (await guard(false, request)) ?? coupon(request)),
  http.post('/api/quote', async ({ request }) => (await guard(false, request)) ?? quoteResponse()),
  http.get('/api/wallets', async ({ request }) => (await guard(true, request)) ?? HttpResponse.json(currentUser()!.wallets)),
  http.post('/api/wallets', async ({ request }) => (await guard(true, request)) ?? wallet(request)),
  http.put('/api/wallets/:id', async ({ request, params }) => (await guard(true, request)) ?? wallet(request, String(params.id))),
]
