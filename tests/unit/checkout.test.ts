import { describe, expect, it } from 'vitest'
import { checkoutCollectorInput, orderInput } from '../../src/contracts/inputs'
import { collectorSchema } from '../../src/contracts/models'

const legacyCollector = () => ({ displayName: 'Ana Silva', username: 'ana', email: 'ana@kurio.test', profileName: '', ens: '', referral: '', notes: '' })
const paymentCollector = () => ({ ...legacyCollector(), network: 'Ethereum', walletAddress: `0x${'a'.repeat(40)}`, walletProvider: 'MetaMask', secondaryWallet: '' })

describe('Dados de carteira no checkout', () => {
  it('exige os novos campos no formulário sem invalidar pedidos antigos', () => {
    const collector = legacyCollector()
    expect(checkoutCollectorInput.safeParse(collector).success).toBe(false)
    expect(collectorSchema.parse(collector)).toEqual(collector)
    expect(orderInput.safeParse({ quoteId: 'old-quote', walletId: 'old-wallet', collector }).success).toBe(true)
  })
  it.each([
    { walletAddress: '0x123' }, { walletAddress: 'javascript:alert(1)' },
    { network: 'Unsupported' }, { walletProvider: 'Unknown' }, { secondaryWallet: 'x'.repeat(101) },
  ])('rejeita dados de pagamento inválidos na UI e na API: %j', (override) => {
    const collector = { ...paymentCollector(), ...override }
    expect(checkoutCollectorInput.safeParse(collector).success).toBe(false)
    expect(orderInput.safeParse({ quoteId: 'quote', walletId: 'wallet', collector }).success).toBe(false)
  })
  it('preserva endereço, rede, provider e ENS secundário no payload validado', () => {
    const collector = { ...paymentCollector(), network: 'Base', walletProvider: 'Coinbase Wallet', secondaryWallet: 'ana.eth' }
    expect(checkoutCollectorInput.parse(collector)).toEqual(collector)
    expect(orderInput.parse({ quoteId: 'quote', walletId: 'wallet', collector }).collector).toEqual(collector)
  })
})
