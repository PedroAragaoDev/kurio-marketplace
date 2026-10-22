import type { z } from 'zod'
import type { eventSchema } from '../contracts/models'

type Payload = z.infer<typeof eventSchema>
type Listener = (name: 'nft.updated' | 'order.updated', payload: Payload) => void
const listeners = new Set<Listener>()
export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export function publish(name: Parameters<Listener>[0], resourceId: string, version: number, userId: string | null = null) {
  const payload = { id: crypto.randomUUID(), resourceId, version, userId }
  listeners.forEach((listener) => listener(name, payload))
  return payload
}
export function replay(name: Parameters<Listener>[0], payload: Payload) {
  listeners.forEach((listener) => listener(name, payload))
}
