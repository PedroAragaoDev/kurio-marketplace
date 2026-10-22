import { describe, expect, it } from 'vitest'
import { fromWei, lineTotal, toWei } from '../../src/lib/money'
import { cartLineSchema, catalogSearchSchema } from '../../src/contracts/models'
import { signupInput, walletInput } from '../../src/contracts/inputs'

describe('Precisão financeira e validação de fronteiras', () => {
  it('preserva 18 casas e a menor unidade sem conversão para Number', () => {
    const value = '123456789.123456789123456789'
    expect(fromWei(toWei(value))).toBe(value)
    expect(toWei('0.000000000000000001')).toBe(1n)
  })
  it('multiplica quantidades sem erros binários', () => {
    expect(lineTotal('0.1', 3)).toBe('0.3')
    expect(fromWei(toWei('1.19') * 2n + toWei('0.0016'))).toBe('2.3816')
  })
  it.each(['-1', '1e3', '0.1234567891234567891', 'NaN', '1,5'])('rejeita valor monetário malformado: %s', (value) => {
    expect(() => toWei(value)).toThrow()
  })
  it('rejeita quantidades fracionárias e negativas na fronteira', () => {
    const factory = (quantity: number) => ({ lineId: crypto.randomUUID(), nftId: 'nft-1', editionId: 'limited', quantity })
    expect(cartLineSchema.safeParse(factory(1)).success).toBe(true)
    expect(cartLineSchema.safeParse(factory(1.5)).success).toBe(false)
    expect(cartLineSchema.safeParse(factory(-1)).success).toBe(false)
  })
  it('normaliza parâmetros não suportados sem aceitar páginas negativas', () => {
    const search = catalogSearchSchema.parse({ page: '-5', sort: 'injection', q: 'Emerald' })
    expect(search).toMatchObject({ page: 1, sort: 'recent', q: 'Emerald' })
  })
  it('valida confirmação de senha e endereço de carteira', () => {
    const account = { username: 'teste', email: 'teste@kurio.test', password: 'Colecionador!2026', confirmPassword: 'OutraSenha!2026' }
    expect(signupInput.safeParse(account).success).toBe(false)
    expect(walletInput.shape.address.safeParse('javascript:alert(1)').success).toBe(false)
  })
})
