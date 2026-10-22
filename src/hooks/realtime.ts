import { createContext, useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { eventSchema } from '../contracts/models'
import { queryClient } from '../lib/query'
import { useNotice } from '../components/feedback'
import { useSession } from './session'

let activeSocket: Socket | null = null
export const RealtimeConnection = createContext(false)
export const disconnectSocket = () => activeSocket?.disconnect()
export const reconnectSocket = () => activeSocket?.connect()
export function useRealtime() {
  const { session, scope } = useSession()
  const notice = useNotice()
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (!session) return
    let alive = true
    const versions = new Map<string, number>()
    const socket = io(location.origin, { transports: ['websocket'], forceNew: true, query: { userId: session.user?.id ?? '', session: session.nonce ?? '' }, reconnectionDelay: 500, autoConnect: false })
    activeSocket = socket
    const reconcile = () => {
      if (!alive) return
      setConnected(true)
      void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'session' })
    }
    const receive = (name: string, raw: unknown) => {
      const event = eventSchema.safeParse(raw)
      if (!alive || !event.success || (event.data.userId && event.data.userId !== session.user?.id)) return
      const key = `${name}:${event.data.resourceId}`
      if ((versions.get(key) ?? 0) >= event.data.version) return
      versions.set(key, event.data.version)
      void queryClient.invalidateQueries({ predicate: (query) => ['catalog', 'nft', 'cart', 'quote', 'order', 'orders'].includes(String(query.queryKey[0])) })
      if (name === 'nft.updated') notice('Preço ou disponibilidade atualizado. Revise os valores antes de comprar.')
    }
    socket.on('connect', reconcile)
    socket.on('disconnect', () => { if (alive) setConnected(false) })
    socket.on('nft.updated', (data: unknown) => receive('nft.updated', data))
    socket.on('order.updated', (data: unknown) => receive('order.updated', data))
    socket.connect()
    return () => { alive = false; socket.removeAllListeners(); socket.disconnect(); if (activeSocket === socket) activeSocket = null }
  }, [scope, session, notice])
  return connected
}
