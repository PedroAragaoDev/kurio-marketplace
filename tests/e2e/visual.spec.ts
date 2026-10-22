import { test, expect } from '@playwright/test'
import { addNft, login, ready } from './helpers'

test('visual início', async ({ page }) => {
  await ready(page); await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
})
test('visual detalhe', async ({ page }) => {
  await page.goto('/nft/nft-1'); await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible()
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
})
test('visual carrinho', async ({ page }) => {
  await addNft(page); await expect(page.locator('.total')).toBeVisible()
  await page.getByRole('button', { name: 'Dispensar aviso' }).click()
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
})
test('visual pagamento', async ({ page }) => {
  await ready(page); await login(page); await addNft(page); await page.goto('/pagamento')
  await expect(page.getByRole('button', { name: 'Confirmar compra', exact: true })).toBeVisible()
  if (await page.getByRole('button', { name: 'Dispensar aviso' }).isVisible()) await page.getByRole('button', { name: 'Dispensar aviso' }).click()
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
})
