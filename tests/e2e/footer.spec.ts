import { test, expect } from '@playwright/test'
import { login, ready } from './helpers'

test('rodapé segue a referência, navega nas telas e filtra as coleções', async ({ page }, testInfo) => {
  await ready(page)
  const footer = page.getByRole('contentinfo')
  await expect(page.locator('.demo-panel')).toHaveCount(0)
  await expect(footer.getByRole('heading', { name: 'Central de ajuda', exact: true })).toBeVisible()
  await expect(footer.locator('.footer-static-list a, .footer-static-list button, .footer-socials a, .footer-socials button')).toHaveCount(0)
  await expect(footer.locator('.footer-socials [role="img"]')).toHaveCount(5)
  await footer.screenshot({ path: testInfo.outputPath('rodape.png'), style: '.skip-link, .mobile-nav { visibility: hidden !important; }' })
  await login(page)
  const account = footer.getByRole('navigation', { name: 'Meu perfil no rodapé' })
  for (const [label, path] of [['Meu perfil', '/perfil'], ['Carteiras', '/carteiras'], ['Meus pedidos', '/pedidos'], ['Lista de interesse', '/favoritos']]) {
    await account.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL((url) => url.pathname === path)
    await expect(page.locator('.skeleton')).toHaveCount(0)
  }
  await page.goto('/?q=Emerald&category=&network=Ethereum&sort=popular&tab=all&min=&max=&page=2')
  const categories = footer.getByRole('navigation', { name: 'Coleções no rodapé' })
  for (const category of ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade']) {
    await categories.getByRole('link', { name: category, exact: true }).click()
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.searchParams.get('category') === category && url.searchParams.get('page') === '1' && url.searchParams.get('q') === '' && url.searchParams.get('network') === '' && url.hash === '#catalogo')
    await expect(page.locator('.nft-card').first()).toBeVisible()
  }
  await footer.getByLabel('E-mail para novidades').fill('leitor@kurio.test')
  await footer.getByRole('button', { name: 'Enviar', exact: true }).click()
  await expect(footer.getByRole('status')).toContainText('não está disponível')
})

test('cenários continuam configuráveis na página de avaliação e o reset funciona', async ({ page }) => {
  await ready(page); await login(page)
  await page.goto('/demonstracao')
  await expect(page.getByRole('heading', { name: 'Cenários de avaliação' })).toBeVisible()
  await expect(page.locator('.demo-panel')).toBeVisible()
  await expect(page.getByRole('contentinfo').locator('.demo-panel')).toHaveCount(0)
  const scenario = page.getByLabel('Cenário de rede e pagamento', { exact: true })
  await scenario.selectOption('slow')
  await expect.poll(() => page.evaluate(async () => (await (await fetch('/api/demo')).json()).scenario)).toBe('slow')
  await scenario.selectOption('standard')
  await expect.poll(() => page.evaluate(async () => (await (await fetch('/api/demo')).json()).scenario)).toBe('standard')
  await page.getByRole('button', { name: 'Desconectar', exact: true }).click()
  await expect(page.getByRole('main')).toHaveAttribute('data-connection-state', 'disconnected')
  await page.getByRole('button', { name: 'Reconectar', exact: true }).click()
  await expect(page.getByRole('main')).toHaveAttribute('data-connection-state', 'connected')
  await page.getByRole('button', { name: 'Restaurar demonstração', exact: true }).click()
  await expect(page).toHaveURL((url) => url.pathname === '/')
  await expect(page.locator('.nft-card').first()).toBeVisible()
  await expect(page.locator('.demo-panel')).toHaveCount(0)
  await expect(page.locator('.account-link')).toHaveCount(0)
})
