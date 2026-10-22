import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { z } from 'zod'
import type { Nft } from '../contracts/models'
import { api, RemoteError } from '../lib/api'
import { eth } from '../lib/money'
import { favoritesOptions, queryClient } from '../lib/query'
import { useSession } from '../hooks/session'
import { useNotice } from './feedback'
import { Button } from './ui/button'

export function Favorite({ id }: { id: string }) {
  const { scope, session } = useSession(); const notice = useNotice(); const navigate = useNavigate()
  const { data = [] } = useQuery(favoritesOptions(scope))
  const active = data.includes(id)
  const mutation = useMutation({
    mutationFn: async (add: boolean) => {
      const result = await api(`/favorites/${id}`, z.array(z.string()), add ? 'PUT' : 'DELETE')
      if (!result.ok) throw new RemoteError(result.error, result.status)
      return result.data
    },
    onMutate: async (add: boolean) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', scope] })
      const previous = queryClient.getQueryData<string[]>(['favorites', scope]) ?? []
      queryClient.setQueryData(['favorites', scope], add ? [...previous, id] : previous.filter((item) => item !== id))
      return previous
    },
    onError: (error, _, previous) => { queryClient.setQueryData(['favorites', scope], previous); notice(error.message) },
    onSuccess: (favorites) => { queryClient.setQueryData(['favorites', scope], favorites); notice('Favoritos atualizados.') },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: ['favorites', scope] }) },
  })
  return <Button variant="ghost" className="favorite" aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-pressed={active} disabled={mutation.isPending} onClick={() => {
    if (!session?.user) { void navigate({ to: '/login', search: { returnTo: location.pathname + location.search } }); return }
    mutation.mutate(!active)
  }}><Heart size={18} fill={active ? 'currentColor' : 'none'} /></Button>
}
export function NftCard({ nft, priority = false }: { nft: Nft; priority?: boolean }) {
  return <article className="nft-card"><div className="art-wrap"><Link to="/nft/$id" params={{ id: nft.id }} aria-label={`Ver ${nft.name}`}>
    <img src={nft.image} alt={nft.name} width="450" height="450" loading={priority ? 'eager' : 'lazy'} />
  </Link><Favorite id={nft.id} />{nft.rarity === 'Raro' && <span className="rarity">RARO</span>}</div>
    <Link to="/nft/$id" params={{ id: nft.id }} className="nft-name">{nft.name}</Link>
    <strong className="price">{eth(nft.editions[0].price)}</strong><span className="card-network">{nft.network}</span>
  </article>
}
