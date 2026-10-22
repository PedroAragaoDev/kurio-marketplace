import { delay, http, HttpResponse } from 'msw'
import { catalogSearchSchema, type CatalogSearch, type Nft } from '../contracts/models'
import { toWei } from '../lib/money'
import { categories } from './fixtures'
import { failure, guard } from './http'
import { currentUser, db, save } from './store'

function list(request: Request) {
  const search = catalogSearchSchema.parse(Object.fromEntries(new URL(request.url).searchParams))
  let items = db.catalog.filter((nft) => matches(nft, search))
  items = items.sort((a, b) => {
    if (search.sort === 'popular') return b.popularity - a.popularity
    if (search.sort === 'recent') return b.createdAt.localeCompare(a.createdAt)
    const difference = toWei(a.editions[0].price) - toWei(b.editions[0].price)
    return (difference < 0n ? -1 : difference > 0n ? 1 : 0) * (search.sort === 'price-desc' ? -1 : 1)
  })
  return HttpResponse.json({ items: items.slice((search.page - 1) * 9, search.page * 9), total: items.length, pages: Math.max(1, Math.ceil(items.length / 9)), categories })
}
function matches(nft: Nft, search: CatalogSearch) {
  if (!nft.name.toLowerCase().includes(search.q.toLowerCase())) return false
  if (search.category && nft.category !== search.category) return false
  if (search.network && nft.network !== search.network) return false
  return tabMatches(nft, search.tab) && priceMatches(nft.editions[0].price, search)
}
function tabMatches(nft: Nft, tab: CatalogSearch['tab']) {
  if (tab === 'trending') return nft.popularity > 85
  if (tab === 'new') return nft.createdAt >= '2026-10-10'
  return true
}
function priceMatches(value: string, search: CatalogSearch) {
  const price = toWei(value)
  if (search.min && price < toWei(search.min)) return false
  if (search.max && price > toWei(search.max)) return false
  return true
}
export const catalogHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const blocked = await guard(); if (blocked) return blocked
    if (db.scenario === 'out-of-order') await delay(new URL(request.url).searchParams.get('q')?.length === 1 ? 1600 : 50)
    return list(request)
  }),
  http.get('/api/nfts/:id', async ({ params }) => {
    const blocked = await guard(); if (blocked) return blocked
    const nft = db.catalog.find((item) => item.id === params.id)
    return nft ? HttpResponse.json(nft) : failure(404, 'NOT_FOUND', 'Este NFT não foi encontrado.')
  }),
  http.get('/api/favorites', async ({ request }) => (await guard(true, request)) ?? HttpResponse.json(currentUser()!.favorites)),
  http.put('/api/favorites/:id', async ({ params, request }) => {
    const blocked = await guard(true, request); if (blocked) return blocked
    if (db.scenario === 'favorite-error') return failure(503, 'UNAVAILABLE', 'Não foi possível atualizar o favorito.')
    if (!db.catalog.some((nft) => nft.id === params.id)) return failure(404, 'NOT_FOUND', 'NFT inexistente.')
    const user = currentUser()!; user.favorites = [...new Set([...user.favorites, String(params.id)])]; save()
    return HttpResponse.json(user.favorites)
  }),
  http.delete('/api/favorites/:id', async ({ params, request }) => {
    const blocked = await guard(true, request); if (blocked) return blocked
    if (db.scenario === 'favorite-error') return failure(503, 'UNAVAILABLE', 'Não foi possível atualizar o favorito.')
    const user = currentUser()!; user.favorites = user.favorites.filter((id) => id !== params.id); save()
    return HttpResponse.json(user.favorites)
  }),
]
