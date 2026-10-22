import { useState } from 'react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star } from 'lucide-react'
import { cartSchema, type Nft } from '../contracts/models'
import { cartOptions, nftOptions, queryClient } from '../lib/query'
import { api } from '../lib/api'
import { eth } from '../lib/money'
import { useSession } from '../hooks/session'
import { Empty, ErrorState, Skeleton, useNotice } from '../components/feedback'
import { Favorite } from '../components/nft-card'
import { Quantity } from '../components/quantity'
import { Recommendations } from '../components/recommendations'
import { Button } from '../components/ui/button'

export default function DetailPage() {
  const { id } = getRouteApi('/nft/$id').useParams(); const query = useQuery(nftOptions(id))
  if (query.isPending) return <Skeleton kind="detail" />
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />
  return <Detail key={id} nft={query.data} />
}
function Detail({ nft }: { nft: Nft }) {
  const [editionId, setEdition] = useState(nft.editions[0].id); const [quantity, setQuantity] = useState(1); const [pending, setPending] = useState(false)
  const [tab, setTab] = useState('details'); const notice = useNotice(); const navigate = useNavigate(); const { scope } = useSession()
  const { data: cart } = useQuery(cartOptions(scope)); const edition = nft.editions.find((item) => item.id === editionId)!
  const buy = async () => {
    if (pending) return
    setPending(true)
    const previous = cart?.items.find((item) => item.nftId === nft.id && item.editionId === editionId)?.quantity ?? 0
    const result = await api('/cart', cartSchema, 'PUT', { nftId: nft.id, editionId, quantity: previous + quantity })
    setPending(false)
    if (!result.ok) { notice(result.error.message); return }
    queryClient.setQueryData(['cart', scope], result.data); notice('NFT adicionado ao carrinho.'); void navigate({ to: '/carrinho' })
  }
  return <section className="page detail-page"><Link to="/" className="breadcrumb"><ArrowLeft size={14} />Início / Mercado / {nft.name}</Link><div className="detail-grid"><div className="gallery"><div className="thumbnails">{nft.editions.map((item) => <button key={item.id} aria-label={`Ver edição ${item.label}`} aria-pressed={editionId === item.id} onClick={() => setEdition(item.id)}><img src={nft.image} alt="" width="80" height="80" /></button>)}</div><img className="detail-art" src={nft.image} alt={nft.name} width="450" height="450" fetchPriority="high" /></div>
    <div className="detail-info"><h1>{nft.name}</h1><div className="detail-price"><strong className="price">{eth(edition.price)}</strong><span className="rating"><Star size={14} fill="currentColor" />{nft.rating} <span className="muted">({nft.reviewCount} avaliações)</span></span></div><h2>Sobre este NFT:</h2><p className="muted">{nft.description}</p><fieldset><legend>Edição:</legend><div className="edition-options">{nft.editions.map((item) => <Button key={item.id} variant={item.id === editionId ? 'default' : 'outline'} aria-pressed={item.id === editionId} disabled={item.stock === 0} onClick={() => { setEdition(item.id); setQuantity(1) }}>{item.label}{item.stock === 0 ? ' · Esgotada' : ''}</Button>)}</div></fieldset><p className="muted">{edition.stock} unidades disponíveis · {nft.network}</p><div className="purchase-actions"><Quantity value={quantity} max={edition.stock} label={nft.name} onChange={setQuantity} /><Button disabled={pending || quantity < 1 || quantity > edition.stock} onClick={() => void buy()}>{pending ? 'Adicionando…' : 'Comprar NFT'}</Button><Favorite id={nft.id} /></div><dl className="metadata"><dt>ID do token</dt><dd>{nft.id}</dd><dt>Coleção</dt><dd>{nft.collection}</dd><dt>Atributos</dt><dd>{nft.rarity}</dd></dl></div></div>
    <div className="detail-tabs"><button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>Detalhes do NFT</button><button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>Avaliações de colecionadores</button></div>{tab === 'details' ? <div className="nft-description"><p>{nft.description}</p><h3>Rede</h3><p>{nft.network}</p><h3>Direitos autorais</h3><p>A compra do NFT não transfere direitos autorais sobre a arte.</p></div> : <Empty title="Avaliações de colecionadores"><p>As avaliações ainda não estão disponíveis.</p></Empty>}
    <Recommendations exclude={nft.id} title="Mais desta coleção" />
  </section>
}
