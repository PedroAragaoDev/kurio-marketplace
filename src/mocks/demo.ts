import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { body } from './http'
import { db, reset, save, scenarioSchema } from './store'
import { publish, replay } from './events'
import { settleOrders } from './orders'
import type { Nft } from '../contracts/models'

function updateNft(nft: Nft, action: string) {
  if (action === 'price') nft.editions[0].price = '2.19'
  if (action === 'stock') nft.editions[0].stock = 0
  if (action === 'price' || action === 'stock') nft.version++
  save()
  const payload = publish('nft.updated', nft.id, action === 'old' ? 1 : nft.version)
  if (action === 'duplicate') replay('nft.updated', payload)
}

export const demoHandlers = [
  http.get('/api/demo', () => HttpResponse.json({ scenario: db.scenario })),
  http.post('/api/demo/reset', async () => { await reset(); return HttpResponse.json({ success: true }) }),
  http.put('/api/demo', async ({ request }) => {
    const parsed = await body(request, z.object({ scenario: scenarioSchema }))
    if (!parsed.ok) return parsed.response
    db.scenario = parsed.data.scenario; save(); return HttpResponse.json({ success: true })
  }),
  http.post('/api/demo/action', async ({ request }) => {
    const parsed = await body(request, z.object({ action: z.enum(['price', 'stock', 'duplicate', 'old', 'expire', 'settle']), nftId: z.string().default('nft-1') }))
    if (!parsed.ok) return parsed.response
    const { action, nftId } = parsed.data
    if (action === 'expire' && db.session) { db.session.expiresAt = 0; save(); return HttpResponse.json({ success: true }) }
    if (action === 'settle') { db.orders.forEach((order) => { order.settleAt = 0 }); db.scenario = 'standard'; settleOrders(); save(); return HttpResponse.json({ success: true }) }
    const nft = db.catalog.find((item) => item.id === nftId)
    if (!nft) return HttpResponse.json({ success: false }, { status: 404 })
    updateNft(nft, action)
    return HttpResponse.json({ success: true })
  }),
]
