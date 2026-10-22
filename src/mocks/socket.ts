import { ws } from 'msw'
import { currentUser, db } from './store'
import { subscribe } from './events'
import { settleOrders } from './orders'

// Minimal Engine.IO v4 / Socket.IO v5 text protocol, default namespace only.
// It is a network handler, not a replacement for socket.io-client in the app.
// MSW normalizes the Socket.IO transport prefix to the namespace root.
const endpoint = ws.link(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/`)
export const socketHandler = endpoint.addEventListener('connection', ({ client, server }) => {
  const url = new URL(client.url)
  if (url.searchParams.get('EIO') !== '4') { server.connect(); return }
  const userId = url.searchParams.get('userId')
  const sessionNonce = url.searchParams.get('session')
  const validSession = () => !userId || (currentUser()?.profile.id === userId && db.session?.nonce === sessionNonce)
  let joined = false
  queueMicrotask(() => client.send(`0${JSON.stringify({ sid: crypto.randomUUID(), upgrades: [], pingInterval: 25000, pingTimeout: 20000, maxPayload: 1000000 })}`))
  client.addEventListener('message', (event) => {
    const packet = String(event.data)
    if (packet.startsWith('40')) {
      if (!validSession()) { client.send('44{"message":"Session expired"}'); return }
      joined = true; client.send(`40${JSON.stringify({ sid: crypto.randomUUID() })}`)
      settleOrders()
    }
  })
  const unsubscribe = subscribe((name, payload) => {
    if (!joined || !validSession() || (payload.userId && payload.userId !== userId)) return
    client.send(`42${JSON.stringify([name, payload])}`)
  })
  const heartbeat = setInterval(() => {
    if (!validSession()) { client.close(1000, 'Session expired'); return }
    client.send('2'); settleOrders()
  }, 20000)
  client.addEventListener('close', () => { unsubscribe(); clearInterval(heartbeat) })
})
