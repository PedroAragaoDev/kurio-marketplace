import { useQuery } from '@tanstack/react-query'
import { catalogSearchSchema } from '../contracts/models'
import { catalogOptions } from '../lib/query'
import { NftCard } from './nft-card'
import { Skeleton } from './feedback'

export function Recommendations({ exclude, title = 'Colecionadores também viram' }: { exclude?: string; title?: string }) {
  const query = useQuery(catalogOptions(catalogSearchSchema.parse({})))
  if (query.isError) return null
  return <section className="recommendations"><h2>{title}</h2>{query.isPending ? <Skeleton count={3} /> : <div className="recommendation-grid">{query.data.items.filter((nft) => nft.id !== exclude).slice(0, 5).map((nft) => <NftCard key={nft.id} nft={nft} />)}</div>}</section>
}
