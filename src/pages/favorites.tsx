import { useQueries, useQuery } from '@tanstack/react-query'
import { favoritesOptions, nftOptions } from '../lib/query'
import { useSession } from '../hooks/session'
import { AccountLayout } from './account'
import { Empty, ErrorState, Skeleton } from '../components/feedback'
import { NftCard } from '../components/nft-card'

export default function FavoritesPage() {
  const { scope } = useSession(); const query = useQuery(favoritesOptions(scope))
  const nfts = useQueries({ queries: (query.data ?? []).map(nftOptions) })
  return <AccountLayout title="Lista de interesse">{query.isPending ? <Skeleton count={3} /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !query.data.length ? <Empty title="Sua coleção de favoritos começa aqui"><p>Toque no coração de um NFT para salvá-lo.</p></Empty> : <div className="nft-grid">{nfts.map((item, index) => item.data ? <NftCard key={item.data.id} nft={item.data} /> : item.isError ? <ErrorState key={index} error={item.error} /> : <Skeleton key={index} />)}</div>}</AccountLayout>
}
