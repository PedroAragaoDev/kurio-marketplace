import { expect, type Page } from '@playwright/test'

export async function ready(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible()
  await expect(page.locator('.nft-card').first()).toBeVisible()
  await expect(page.getByRole('main')).toHaveAttribute('data-connection-state', 'connected')
}
export async function demo(page: Page, path: string, data: unknown, method = 'POST') {
  await expect(page.locator('main#conteudo')).toBeVisible()
  return page.evaluate(async ({ path, data, method }) => {
    const response = await fetch(`/api/demo${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    return response.json()
  }, { path, data, method })
}
export async function reset(page: Page) { await ready(page); await demo(page, '/reset', {}); await page.reload(); await expect(page.locator('.nft-card').first()).toBeVisible() }
export async function scenario(page: Page, value: string) { await demo(page, '', { scenario: value }, 'PUT') }
export async function login(page: Page, user = 'ana') {
  await page.goto('/login?returnTo=%2F')
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(`${user}@kurio.test`)
  await page.getByLabel('Senha', { exact: true }).fill('Colecionador!2026')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.account-link')).toBeVisible()
}
export async function addNft(page: Page, id = 'nft-1') {
  await page.goto(`/nft/${id}`)
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible()
}
export async function review(page: Page) {
  await page.goto('/pagamento')
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Revise sua compra' })).toBeVisible()
}
