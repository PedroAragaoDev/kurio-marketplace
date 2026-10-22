import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { cartSchema, type CartLine } from '../contracts/models'
import { api } from '../lib/api'
import { eth, lineTotal } from '../lib/money'
import { cartOptions, nftOptions, queryClient } from '../lib/query'
import { useSession } from '../hooks/session'
import { useCartMutation, useQuote } from '../hooks/cart'
import { Empty, ErrorState, Skeleton, useNotice } from '../components/feedback'
import { Quantity } from '../components/quantity'
import { Totals } from '../components/summary'
import { Recommendations } from '../components/recommendations'
import { Button } from '../components/ui/button'

export default function CartPage() {
  const { scope } = useSession(); const query = useQuery(cartOptions(scope)); const quote = useQuote(query.data?.version, !!query.data?.items.length)
  if (query.isPending) return <Skeleton kind="detail" />
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />
  return <section className="page"><p className="breadcrumb">Início / Mercado / Carrinho</p><h1>Carrinho de NFTs</h1>{!query.data.items.length ? <Empty title="Seu carrinho está vazio"><p>Encontre uma obra que combine com a sua coleção.</p><Button asChild><Link to="/" hash="catalogo">Explorar NFTs</Link></Button></Empty> : <div className="cart-layout"><div><div className="cart-table-head"><span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span></div><div className="cart-items">{query.data.items.map((line) => <CartItem key={`${line.nftId}:${line.editionId}`} line={line} />)}</div></div><aside className="cart-summary"><h2>Resumo da carteira</h2><Coupon current={query.data.coupon} />{quote.isPending ? <Skeleton kind="summary" /> : quote.isError ? <ErrorState error={quote.error} retry={() => void quote.refetch()} /> : <><Totals quote={quote.data} /><Button asChild className="wide"><Link to="/pagamento">Conectar e finalizar</Link></Button></>}<Link to="/" hash="catalogo" className="continue-link">Continuar explorando</Link></aside></div>}<Recommendations /></section>
}
function CartItem({ line }: { line: CartLine }) {
  const query = useQuery(nftOptions(line.nftId)); const mutation = useCartMutation()
  if (!query.data) return query.isError ? <ErrorState error={query.error} /> : <Skeleton kind="summary" />
  const nft = query.data; const edition = nft.editions.find((item) => item.id === line.editionId)!
  return <article className="cart-item"><Link to="/nft/$id" params={{ id: nft.id }} className="cart-art"><img src={nft.image} alt="" width="80" height="80" /><span>{nft.name}<small>Edição: {edition.label}</small></span></Link><span className="unit-price">{eth(edition.price)}</span><Quantity value={line.quantity} max={edition.stock} label={nft.name} disabled={mutation.isPending} onChange={(quantity) => mutation.mutate({ ...line, quantity })} /><strong className="price">{eth(lineTotal(edition.price, line.quantity))}</strong><Button variant="ghost" aria-label={`Remover ${nft.name}`} disabled={mutation.isPending} onClick={() => mutation.mutate({ ...line, quantity: 0 })}><Trash2 size={16} /></Button>{edition.stock < line.quantity && <p className="error-text">Estoque insuficiente. Remova ou ajuste este item.</p>}</article>
}
function Coupon({ current }: { current: string }) {
  const [code, setCode] = useState(current); const [pending, setPending] = useState(false); const notice = useNotice(); const { scope } = useSession()
  const apply = async (value: string) => {
    setPending(true); const result = await api('/cart/coupon', cartSchema, 'PUT', { code: value }); setPending(false)
    if (!result.ok) { notice(result.error.message); return }
    setCode(result.data.coupon); queryClient.setQueryData(['cart', scope], result.data)
    notice(result.data.coupon ? 'Cupom aplicado.' : 'Cupom removido.')
  }
  return <form className="coupon" onSubmit={(event) => { event.preventDefault(); void apply(code) }}><label htmlFor="coupon">Código promocional</label><div><input id="coupon" value={code} maxLength={40} placeholder="Digite o código promocional…" onChange={(event) => setCode(event.target.value)} /><Button type="submit" disabled={pending}>Aplicar</Button></div>{current && <Button variant="ghost" disabled={pending} onClick={() => void apply('')}>Remover cupom {current}</Button>}</form>
}
