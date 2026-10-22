import { http, HttpResponse } from 'msw'
import type { Collector, Order, Quote, Wallet } from '../contracts/models'
import { orderInput } from '../contracts/inputs'
import { makeCart } from './fixtures'
import { body, failure, guard } from './http'
import { calculateQuote } from './quote'
import { currentUser, db, owner, save } from './store'
import { publish } from './events'

function settle(order: Order) {
  if (order.status !== 'pending' || order.settleAt > Date.now() || db.scenario === 'pending') return
  order.status = order.outcome; order.version++
  if (order.status === 'confirmed') {
    const cart = db.carts[order.userId] ?? makeCart()
    cart.items = cart.items.map((line) => {
      const bought = order.quote.items.find((item) => item.lineId === line.lineId)
      return { ...line, quantity: Math.max(0, line.quantity - (bought?.quantity ?? 0)) }
    }).filter((line) => line.quantity > 0)
    cart.version++; db.carts[order.userId] = cart
  } else adjustStock(order, 1)
  save(); publish('order.updated', order.id, order.version, order.userId)
}
export function settleOrders() { db.orders.forEach(settle) }
function adjustStock(order: Order, direction: -1 | 1) {
  for (const line of order.quote.items) {
    const nft = db.catalog.find((item) => item.id === line.nftId)!
    const edition = nft.editions.find((item) => item.id === line.editionId)!
    edition.stock += direction * line.quantity; nft.version++
    publish('nft.updated', nft.id, nft.version)
  }
}
function quoteIsCurrent(quote: Quote | undefined): quote is Quote {
  if (!quote || quote.ownerId !== owner() || quote.expiresAt <= Date.now()) return false
  const latest = calculateQuote()
  return latest.ok && quote.fingerprint === latest.quote.fingerprint
}
function attemptResponse(key: string, payload: string) {
  const attempt = db.attempts[key]
  if (!attempt) return null
  if (attempt.payload !== payload) return failure(409, 'IDEMPOTENCY_CONFLICT', 'Chave já utilizada com outro conteúdo.')
  return HttpResponse.json(db.orders.find((order) => order.id === attempt.orderId))
}
function paymentWallet(wallet: Wallet, collector: Collector): Wallet {
  return { ...structuredClone(wallet), address: collector.walletAddress ?? wallet.address, network: collector.network ?? wallet.network, provider: collector.walletProvider ?? wallet.provider }
}
async function create(request: Request) {
  const parsed = await body(request, orderInput)
  if (!parsed.ok) return parsed.response
  const key = request.headers.get('Idempotency-Key')
  if (!key || key.length > 100) return failure(422, 'IDEMPOTENCY_REQUIRED', 'Chave de idempotência obrigatória.')
  const attemptKey = `${owner()}:${key}`
  const payload = JSON.stringify(parsed.data)
  const previous = attemptResponse(attemptKey, payload)
  if (previous) return previous
  const quote = db.quotes[parsed.data.quoteId]
  if (!quoteIsCurrent(quote)) return failure(409, 'QUOTE_CHANGED', 'Preço ou disponibilidade mudou. Revise a nova cotação e confirme novamente.')
  const wallet = currentUser()!.wallets.find((item) => item.id === parsed.data.walletId)
  if (!wallet) return failure(422, 'WALLET_REQUIRED', 'Selecione uma carteira cadastrada.')
  const order: Order = { id: crypto.randomUUID(), userId: owner(), version: 1, createdAt: new Date().toISOString(), settleAt: Date.now() + 1800, status: 'pending', outcome: db.scenario === 'payment-refused' ? 'refused' : 'confirmed', quote: structuredClone(quote), wallet: paymentWallet(wallet, parsed.data.collector), collector: parsed.data.collector, transaction: `demo-${crypto.randomUUID()}` }
  db.orders.push(order); db.attempts[attemptKey] = { orderId: order.id, payload }
  adjustStock(order, -1); save(); setTimeout(settleOrders, 1900)
  if (db.scenario === 'order-timeout') return failure(504, 'ORDER_TIMEOUT', 'A resposta demorou. Consulte a mesma tentativa sem enviar outra compra.')
  return HttpResponse.json(order, { status: 201 })
}
export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => (await guard(true, request)) ?? create(request)),
  http.get('/api/orders', async ({ request }) => {
    const blocked = await guard(true, request); if (blocked) return blocked
    settleOrders(); return HttpResponse.json(db.orders.filter((order) => order.userId === owner()))
  }),
  http.get('/api/orders/:id', async ({ params, request }) => {
    const blocked = await guard(true, request); if (blocked) return blocked
    settleOrders(); const order = db.orders.find((item) => item.id === params.id && item.userId === owner())
    return order ? HttpResponse.json(order) : failure(404, 'NOT_FOUND', 'Pedido não encontrado.')
  }),
]
