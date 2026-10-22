import { cart, db, owner, save } from './store'
import { failure } from './http'
import { fromWei, lineTotal, toWei } from '../lib/money'
import type { Quote } from '../contracts/models'

export function calculateQuote(): { ok: true; quote: Quote } | { ok: false; response: Response } {
  const current = cart()
  if (!current.items.length) return { ok: false, response: failure(409, 'EMPTY_CART', 'Seu carrinho está vazio.') }
  const items: Quote['items'] = []
  const resources: Array<{ id: string; version: number; stock: number }> = []
  for (const line of current.items) {
    const nft = db.catalog.find((item) => item.id === line.nftId)
    const edition = nft?.editions.find((item) => item.id === line.editionId)
    if (!nft || !edition || edition.stock < line.quantity) return { ok: false, response: failure(409, 'STOCK_CONFLICT', 'A disponibilidade mudou. Ajuste os itens do carrinho.') }
    items.push({ ...line, name: nft.name, image: nft.image, edition: edition.label, price: edition.price, total: lineTotal(edition.price, line.quantity) })
    resources.push({ id: nft.id, version: nft.version, stock: edition.stock })
  }
  const subtotal = items.reduce((total, line) => total + toWei(line.total), 0n)
  const discount = current.coupon === 'KURIO10' ? subtotal / 10n : 0n
  const fee = toWei('0.0016')
  const fingerprint = JSON.stringify({ items, resources, coupon: current.coupon, version: current.version, fee: fromWei(fee) })
  return { ok: true, quote: { id: crypto.randomUUID(), ownerId: owner(), fingerprint, expiresAt: Date.now() + 300000, cartVersion: current.version, items, subtotal: fromWei(subtotal), discount: fromWei(discount), fee: fromWei(fee), total: fromWei(subtotal - discount + fee), coupon: current.coupon } }
}
export function quoteResponse() {
  const result = calculateQuote()
  if (!result.ok) return result.response
  db.quotes = Object.fromEntries(Object.entries(db.quotes).filter(([, quote]) => quote.expiresAt > Date.now()).slice(-30))
  db.quotes[result.quote.id] = result.quote; save()
  return Response.json(result.quote)
}
