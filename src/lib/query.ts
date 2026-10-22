import { QueryClient, queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { cartSchema, catalogSchema, nftSchema, orderSchema, profileSchema, sessionSchema, walletSchema, type CatalogSearch } from '../contracts/models'
import { read, RemoteError, setSessionNonce } from './api'

export const queryClient = new QueryClient({ defaultOptions: { queries: {
  staleTime: 30000, gcTime: 300000, refetchOnWindowFocus: true,
  retry: (count, error) => count < 1 && (!(error instanceof RemoteError) || error.status >= 500 || error.status === 0),
}, mutations: { retry: false } } })
export const sessionOptions = queryOptions({ queryKey: ['session'], queryFn: async ({ signal }) => {
  const session = await read('/session', sessionSchema, signal)
  setSessionNonce(session.nonce)
  return session
}, staleTime: 15000 })
export const catalogOptions = (search: CatalogSearch) => queryOptions({
  queryKey: ['catalog', search], queryFn: ({ signal }) => read(`/nfts?${new URLSearchParams(Object.entries(search).map(([key, value]) => [key, String(value)]))}`, catalogSchema, signal),
})
export const nftOptions = (id: string) => queryOptions({ queryKey: ['nft', id], queryFn: ({ signal }) => read(`/nfts/${encodeURIComponent(id)}`, nftSchema, signal) })
export const cartOptions = (scope: string) => queryOptions({ queryKey: ['cart', scope], queryFn: ({ signal }) => read('/cart', cartSchema, signal), staleTime: 0 })
export const favoritesOptions = (scope: string) => queryOptions({ queryKey: ['favorites', scope], queryFn: ({ signal }) => read('/favorites', z.array(z.string()), signal), enabled: scope !== 'visitor' })
export const walletsOptions = (scope: string) => queryOptions({ queryKey: ['wallets', scope], queryFn: ({ signal }) => read('/wallets', z.array(walletSchema), signal), enabled: scope !== 'visitor' })
export const profileOptions = (scope: string) => queryOptions({ queryKey: ['profile', scope], queryFn: ({ signal }) => read('/profile', profileSchema, signal), enabled: scope !== 'visitor' })
export const ordersOptions = (scope: string) => queryOptions({ queryKey: ['orders', scope], queryFn: ({ signal }) => read('/orders', z.array(orderSchema), signal), enabled: scope !== 'visitor' })
export const orderOptions = (id: string, scope: string) => queryOptions({
  queryKey: ['order', scope, id], queryFn: ({ signal }) => read(`/orders/${encodeURIComponent(id)}`, orderSchema, signal),
  enabled: scope !== 'visitor', refetchInterval: (query) => query.state.data?.status === 'pending' ? 3000 : false,
})
