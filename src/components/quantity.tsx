import { Minus, Plus } from 'lucide-react'
import { Button } from './ui/button'

export function Quantity({ value, max, label, onChange, disabled }: { value: number; max: number; label: string; onChange: (value: number) => void; disabled?: boolean }) {
  return <div className="quantity"><Button variant="outline" aria-label={`Diminuir ${label}`} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}><Minus size={12} /></Button><input aria-label={`Quantidade de ${label}`} type="number" min="1" max={max} step="1" value={value} disabled={disabled} onChange={(event) => { const next = event.target.valueAsNumber; if (Number.isSafeInteger(next)) onChange(next) }} /><Button variant="outline" aria-label={`Aumentar ${label}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}><Plus size={12} /></Button></div>
}
