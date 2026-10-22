import { useState } from 'react'
import { decimal, type CatalogSearch } from '../contracts/models'
import { toWei } from '../lib/money'
import { Button } from './ui/button'

function validateRange(min: string, max: string) {
  if ([min, max].filter(Boolean).some((value) => !decimal.safeParse(value).success)) return 'Informe valores decimais não negativos com até 18 casas.'
  if (min && max && toWei(min) > toWei(max)) return 'O preço mínimo não pode superar o máximo.'
  return ''
}
export function PriceRange({ search, update }: { search: CatalogSearch; update: (patch: Partial<CatalogSearch>) => void }) {
  const [error, setError] = useState('')
  return <form key={`${search.min}:${search.max}`} className="price-range" onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const min = String(data.get('min') ?? '').replace(',', '.'); const max = String(data.get('max') ?? '').replace(',', '.')
    const problem = validateRange(min, max)
    if (problem) { setError(problem); return }
    setError(''); update({ min, max })
  }}><h2>Faixa de preço</h2><label>Preço mínimo (ETH)<input name="min" inputMode="decimal" defaultValue={search.min} placeholder="0" /></label><label>Preço máximo (ETH)<input name="max" inputMode="decimal" defaultValue={search.max} placeholder="Sem limite" /></label>{error && <p role="alert" className="error-text">{error}</p>}<Button type="submit">Aplicar preço</Button></form>
}
