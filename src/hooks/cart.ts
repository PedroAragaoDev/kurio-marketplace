import { useMutation, useQuery } from '@tanstack/react-query'
import { cartSchema, quoteSchema, type CartLine } from '../contracts/models'
import { api, RemoteError } from '../lib/api'
import { queryClient } from '../lib/query'
import { useSession } from './session'
import { useNotice } from '../components/feedback'

export function useCartMutation() {
  const { scope } = useSession(); const notice = useNotice()
  return useMutation({ mutationFn: async (line: CartLine) => {
    const result = await api('/cart', cartSchema, 'PUT', line)
    if (!result.ok) throw new RemoteError(result.error, result.status)
    return result.data
  }, onSuccess: (cart) => { queryClient.setQueryData(['cart', scope], cart); void queryClient.invalidateQueries({ queryKey: ['quote', scope] }) }, onError: (error) => notice(error.message) })
}
export function useQuote(version: number | undefined, enabled = true) {
  const { scope } = useSession()
  return useQuery({ queryKey: ['quote', scope, version], enabled: version !== undefined && enabled, staleTime: 0, retry: false,
    queryFn: async ({ signal }) => {
      const result = await api('/quote', quoteSchema, 'POST', {}, signal)
      if (!result.ok) throw new RemoteError(result.error, result.status)
      return result.data
    },
  })
}
