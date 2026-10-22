import { test, expect, type Page } from '@playwright/test'
import { addNft, demo, login, ready, scenario } from './helpers'

async function request(page: Page, path: string, method = 'GET', data?: unknown, extraHeaders: Record<string, string> = {}) {
  return page.evaluate(async ({ path, method, data, extraHeaders }) => {
    const session = await (await fetch('/api/session')).json()
    const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Session': session.nonce ?? 'visitor', ...extraHeaders }, body: data === undefined ? undefined : JSON.stringify(data) })
    return { status: response.status, data: await response.json() }
  }, { path, method, data, extraHeaders })
}
const line = (quantity: number) => ({ nftId: 'nft-1', editionId: 'limited', quantity })
const collector = () => ({ displayName: 'Ana', username: 'ana', email: 'ana@kurio.test', profileName: '', ens: '', referral: '', notes: '' })

test('idempotência rejeita outro payload e confirmação preserva item adicionado depois', async ({ page }) => {
  await ready(page); await login(page); await addNft(page); await scenario(page, 'pending')
  const quote = await request(page, '/quote', 'POST')
  const wallets = await request(page, '/wallets')
  const payload = { quoteId: quote.data.id, walletId: wallets.data[0].id, collector: collector() }
  const headers = { 'Idempotency-Key': 'contract-attempt' }
  const created = await request(page, '/orders', 'POST', payload, headers)
  expect(created.status).toBe(201)
  const repeated = await request(page, '/orders', 'POST', payload, headers)
  expect(repeated.data.id).toBe(created.data.id)
  const conflicting = await request(page, '/orders', 'POST', { ...payload, collector: { ...collector(), notes: 'Alterado' } }, headers)
  expect(conflicting.status).toBe(409)
  await request(page, '/cart', 'PUT', line(0)); await request(page, '/cart', 'PUT', line(2))
  await demo(page, '/action', { action: 'settle' })
  const cart = await request(page, '/cart')
  expect(cart.data.items).toMatchObject([{ quantity: 2 }])
  const order = await request(page, `/orders/${created.data.id}`)
  expect(order.data.status).toBe('confirmed')
  expect(order.data.quote.items[0].quantity).toBe(1)
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await login(page, 'bruno')
  expect((await request(page, `/orders/${created.data.id}`)).status).toBe(404)
})

test('requisição de visitante não altera carrinho de uma sessão autenticada', async ({ page }) => {
  await ready(page); await login(page)
  const result = await request(page, '/cart', 'PUT', line(1), { 'X-Session': 'visitor' })
  expect(result.status).toBe(409)
  expect((await request(page, '/cart')).data.items).toHaveLength(0)
  expect((await request(page, '/session')).data.user.username).toBe('ana')
})
