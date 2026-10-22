import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { z } from 'zod'
import pt from 'zod/v4/locales/pt.js'
import './styles.css'

async function bootstrap() {
  z.config(pt())
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const { startMocks } = await import('./mocks/browser')
    await startMocks()
  }
  // Import Socket.IO consumers only after MSW has installed WebSocket interception.
  const [{ RouterProvider }, { QueryClientProvider }, { router }, { queryClient, sessionOptions }, { setSessionNonce }, { SessionProvider }, { NoticeProvider }] = await Promise.all([
    import('@tanstack/react-router'), import('@tanstack/react-query'), import('./router'), import('./lib/query'), import('./lib/api'), import('./hooks/session'), import('./components/feedback'),
  ])
  const session = await queryClient.fetchQuery(sessionOptions)
  setSessionNonce(session.nonce)
  createRoot(document.getElementById('root')!).render(<StrictMode><QueryClientProvider client={queryClient}><NoticeProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></NoticeProvider></QueryClientProvider></StrictMode>)
}
void bootstrap().catch(() => {
  const root = document.getElementById('root')!
  root.textContent = 'Não foi possível iniciar a aplicação. Recarregue a página para tentar novamente.'
  const button = document.createElement('button'); button.textContent = 'Tentar novamente'; button.onclick = () => location.reload(); root.append(button)
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const resetButton = document.createElement('button'); resetButton.textContent = 'Restaurar demonstração'
    resetButton.onclick = async () => {
      const { api } = await import('./lib/api')
      const result = await api('/demo/reset', z.object({ success: z.boolean() }), 'POST')
      if (result.ok) { sessionStorage.clear(); location.assign('/') }
    }
    root.append(resetButton)
  }
})
