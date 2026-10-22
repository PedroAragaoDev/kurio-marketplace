import { test, expect } from '@playwright/test'
import { addNft, login, ready, review } from './helpers'

test('nove telas em 390, 768 e 1440 px, com reflow equivalente a zoom de 200%', async ({ page, isMobile }) => {
  test.skip(isMobile, 'A matriz já percorre os três tamanhos no projeto desktop.')
  test.setTimeout(120000)
  await ready(page); await login(page); await addNft(page); await review(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  const receipt = new URL(page.url()).pathname
  await addNft(page, 'nft-2')
  const paths = ['/', '/nft/nft-1', '/carrinho', '/pagamento', receipt, '/login', '/cadastro', '/perfil', '/carteiras']
  for (const width of [390, 768, 1440, 720]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const path of paths) {
      await page.goto(path)
      const content = path === '/login' || path === '/cadastro' ? page.getByRole('dialog') : page.getByRole('main')
      await expect(content.getByRole('heading').first()).toBeVisible()
      await expect(page.locator('.skeleton')).toHaveCount(0)
      const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }))
      expect(dimensions.content, `${path} em ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  }
})

test('expiração com relógio controlado preserva dados do checkout para retomar', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00Z') })
  await ready(page); await login(page); await addNft(page)
  await page.goto('/pagamento'); await page.getByLabel('Nome de exibição *', { exact: true }).fill('Ana no checkout')
  await review(page)
  await page.clock.fastForward('31:00')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fpagamento/)
  await page.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Colecionador!2026')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/pagamento$/)
  await expect(page.getByLabel('Nome de exibição *', { exact: true })).toHaveValue('Ana no checkout')
  await expect(page.locator('.checkout-item')).toHaveCount(1)
})

test('diálogo mantém o foco ao navegar por teclado e fecha com Escape', async ({ page }) => {
  await ready(page); await page.goto('/login')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  for (let index = 0; index < 16; index++) {
    await page.keyboard.press(index < 12 ? 'Tab' : 'Shift+Tab')
    await expect(dialog.locator(':focus')).toHaveCount(1)
  }
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL((url) => url.pathname === '/')
})
