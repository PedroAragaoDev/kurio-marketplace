import { setupWorker } from 'msw/browser'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { catalogHandlers } from './catalog'
import { demoHandlers } from './demo'
import { orderHandlers } from './orders'
import { socketHandler } from './socket'
import { initialize } from './store'

export async function startMocks() {
  await initialize()
  const worker = setupWorker(...authHandlers, ...cartHandlers, ...catalogHandlers, ...orderHandlers, ...demoHandlers, socketHandler)
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}
