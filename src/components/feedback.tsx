import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from './ui/button'

const Notices = createContext<(message: string) => void>(() => {})
export const useNotice = () => useContext(Notices)
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 6000)
    return () => clearTimeout(timeout)
  }, [message])
  return <Notices.Provider value={setMessage}>{children}
    <div aria-live="polite" aria-atomic="true" className={message ? 'toast' : 'sr-only'}>
      {message && <><CheckCircle2 size={20} /><span>{message}</span><Button variant="ghost" aria-label="Dispensar aviso" onClick={() => setMessage('')}><X size={16} /></Button></>}
    </div>
  </Notices.Provider>
}
export function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return <div className="state-box" role="alert"><AlertCircle /><h2>Algo precisa de atenção</h2><p>{error.message}</p>{retry && <Button onClick={retry}>Tentar novamente</Button>}</div>
}
export function Skeleton({ count = 1, kind = 'card' }: { count?: number; kind?: string }) {
  return <div aria-label="Carregando conteúdo" role="status" className={kind === 'card' ? 'nft-grid' : ''}>
    {Array.from({ length: count }, (_, index) => <div key={index} className={`skeleton skeleton-${kind}`} />)}<span className="sr-only">Carregando…</span>
  </div>
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="state-box"><h2>{title}</h2>{children}</div>
}
