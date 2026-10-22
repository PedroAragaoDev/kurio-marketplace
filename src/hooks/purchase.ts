import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { orderSchema, quoteSchema, type Collector, type Quote } from '../contracts/models'
import { orderInput } from '../contracts/inputs'
import { api } from '../lib/api'
import { useSession } from './session'

const attemptSchema = z.object({ key: z.string(), payload: orderInput })
function readAttempt(key: string) {
  try { return attemptSchema.safeParse(JSON.parse(sessionStorage.getItem(key) ?? 'null')).data ?? null } catch { return null }
}
export function usePurchase() {
  const { session } = useSession(); const navigate = useNavigate(); const storageKey = `kurio.attempt.${session?.user?.id}`
  const [attempt, setAttempt] = useState(() => readAttempt(storageKey)); const [error, setError] = useState('')
  const [pending, setPending] = useState(false); const lock = useRef(false)
  const send = async (entry: z.infer<typeof attemptSchema>) => {
    const result = await api('/orders', orderSchema, 'POST', entry.payload, undefined, { 'Idempotency-Key': entry.key })
    if (result.ok) { sessionStorage.removeItem(storageKey); setAttempt(null); void navigate({ to: '/pedido/$id', params: { id: result.data.id } }) }
    else {
      setError(result.error.message)
      if (['QUOTE_CHANGED', 'VALIDATION', 'WALLET_REQUIRED', 'IDEMPOTENCY_CONFLICT'].includes(result.error.code)) { sessionStorage.removeItem(storageKey); setAttempt(null) }
    }
  }
  const confirm = async (review: { collector: Collector; walletId: string; quote: Quote }) => {
    if (lock.current) return
    lock.current = true; setPending(true); setError('')
    try {
      const latest = await api('/quote', quoteSchema, 'POST', {})
      if (!latest.ok) { setError(latest.error.message); return }
      if (latest.data.fingerprint !== review.quote.fingerprint) { setError('A cotação mudou. Volte aos dados e revise os novos valores antes de confirmar.'); return }
      const entry = { key: crypto.randomUUID(), payload: { quoteId: latest.data.id, collector: review.collector, walletId: review.walletId } }
      sessionStorage.setItem(storageKey, JSON.stringify(entry)); setAttempt(entry); await send(entry)
    } finally { lock.current = false; setPending(false) }
  }
  const recover = async () => {
    if (!attempt || lock.current) return
    lock.current = true; setPending(true)
    try { await send(attempt) } finally { lock.current = false; setPending(false) }
  }
  return { confirm, recover, attempt, pending, error }
}
