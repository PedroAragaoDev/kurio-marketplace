import { test, expect } from '@playwright/test'
import { addNft, demo, login, ready, scenario } from './helpers'

test('busca, filtros combinados, ordenação, paginação e histórico', async ({ page, isMobile }) => {
  await ready(page)
  await page.getByRole('button', { name: 'Próxima página' }).click()
  await expect(page).toHaveURL(/page=2/)
  await page.reload(); await expect(page.getByRole('button', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('searchbox', { name: 'Buscar NFTs' }).fill('Emerald')
  await expect(page).toHaveURL(/page=1/)
  if (isMobile) await page.getByRole('button', { name: 'Abrir filtros' }).click()
  const filters = isMobile ? page.getByRole('dialog') : page.locator('.desktop-filters')
  await filters.getByRole('button', { name: 'Arte digital', exact: true }).click()
  await filters.getByLabel('Filtrar por rede').selectOption('Ethereum')
  if (isMobile) await page.getByRole('button', { name: 'Ver resultados' }).click()
  await page.getByLabel('Ordenar por', { exact: true }).selectOption('price-asc')
  await expect(page.locator('.nft-card')).toHaveCount(1)
  await page.goBack(); await expect(page).not.toHaveURL(/sort=price-asc/)
})
test('detalhe direto, limite e inexistente', async ({ page }) => {
  await page.goto('/nft/nft-1')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Aberta.*Esgotada/ })).toBeDisabled()
  await page.getByRole('spinbutton').fill('99')
  await expect(page.getByRole('button', { name: 'Comprar NFT' })).toBeDisabled()
  await page.goto('/nft/inexistente'); await expect(page.getByRole('alert')).toContainText('não foi encontrado')
})
test('respostas antigas, vazio, skeleton e recuperação de erro', async ({ page }) => {
  await ready(page); await scenario(page, 'out-of-order')
  const search = page.getByRole('searchbox', { name: 'Buscar NFTs' })
  await search.fill('E'); await search.fill('Sage')
  await expect(page.locator('.nft-card').first()).toContainText('Sage')
  await search.fill('inexistente-xyz'); await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
  await scenario(page, 'slow'); await search.fill('Emerald'); await expect(page.getByRole('status', { name: 'Carregando conteúdo' })).toBeVisible()
  await expect(page.locator('.nft-card').first()).toBeVisible()
  await scenario(page, 'server-error'); await search.fill('Golden'); await expect(page.getByRole('alert')).toBeVisible()
  await scenario(page, 'standard'); await page.getByRole('button', { name: 'Tentar novamente' }).click(); await expect(page.locator('.nft-card').first()).toBeVisible()
  await demo(page, '/action', { action: 'duplicate' })
})

const legacyDescription = () => 'Uma obra da coleção. Nesta demonstração, toda compra é simulada.'

test('descrição antiga é atualizada após refresh sem apagar sessão ou carrinho', async ({ page }) => {
  await ready(page); await login(page); await addNft(page)
  await page.evaluate((description) => {
    const snapshot = JSON.parse(localStorage.getItem('kurio.demo.v1')!)
    snapshot.catalog.find((nft: { id: string }) => nft.id === 'nft-1').description = description
    localStorage.setItem('kurio.demo.v1', JSON.stringify(snapshot))
  }, legacyDescription())
  await page.reload()
  await expect(page.locator('.account-link')).toContainText('Ana Silva')
  await expect(page.getByRole('spinbutton')).toHaveValue('1')
  await page.goto('/nft/nft-1')
  await expect(page.locator('.detail-info')).toContainText('Uma obra da coleção.')
  await expect(page.getByRole('main')).not.toContainText(/simula|demonstra|fict[íi]ci/i)
  await page.getByRole('button', { name: 'Avaliações de colecionadores' }).click()
  await expect(page.getByRole('main')).toContainText('As avaliações ainda não estão disponíveis.')
})
