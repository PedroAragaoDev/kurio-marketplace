const WEI = 10n ** 18n
const DECIMAL = /^\d+(?:\.\d{1,18})?$/

export function toWei(value: string): bigint {
  if (!DECIMAL.test(value)) throw new Error('Valor decimal ETH inválido')
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * WEI + BigInt(fraction.padEnd(18, '0'))
}

export function fromWei(value: bigint): string {
  if (value < 0n) throw new Error('Valor ETH negativo')
  const fraction = (value % WEI).toString().padStart(18, '0').replace(/0+$/, '')
  return `${value / WEI}${fraction ? `.${fraction}` : ''}`
}

export function eth(value: string): string {
  return `${value.replace('.', ',')} ETH`
}

export function lineTotal(price: string, quantity: number): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Quantidade inválida')
  return fromWei(toWei(price) * BigInt(quantity))
}
