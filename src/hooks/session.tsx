import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { z } from 'zod'
import { sessionSchema } from '../contracts/models'
import { queryClient, sessionOptions } from '../lib/query'
import { setSessionNonce } from '../lib/api'

type Session = z.infer<typeof sessionSchema>
const SessionContext = createContext<{ session: Session | undefined; scope: string }>({ session: undefined, scope: 'visitor' })
export const useSession = () => useContext(SessionContext)
export async function replaceSession(session: Session) {
  await queryClient.cancelQueries()
  queryClient.clear()
  setSessionNonce(session.nonce)
  queryClient.setQueryData(['session'], session)
}
export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session } = useQuery(sessionOptions)
  useEffect(() => { setSessionNonce(session?.nonce ?? null) }, [session])
  return <SessionContext.Provider value={{ session, scope: session?.user ? `${session.user.id}:${session.nonce}` : 'visitor' }}>{children}</SessionContext.Provider>
}
