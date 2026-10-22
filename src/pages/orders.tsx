import { useEffect } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { orderOptions, ordersOptions, queryClient } from '../lib/query'
import { useSession } from '../hooks/session'
import { eth } from '../lib/money'
import { ErrorState, Skeleton, Empty } from '../components/feedback'
import { Totals } from '../components/summary'
import { Button } from '../components/ui/button'
import { AccountLayout } from './account'

export function OrdersPage() {
  const { scope } = useSession(); const query = useQuery(ordersOptions(scope))
  return <AccountLayout title="Meus pedidos">{query.isPending ? <Skeleton kind="detail" /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !query.data.length ? <Empty title="Você ainda não tem pedidos" /> : <div className="orders-list">{query.data.map((order) => <Link key={order.id} to="/pedido/$id" params={{ id: order.id }}><span>Pedido {order.id.slice(0, 8)}</span><span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span><span>{statusLabel(order.status)}</span><strong>{eth(order.quote.total)}</strong></Link>)}</div>}</AccountLayout>
}
export function OrderPage() {
  const { id } = getRouteApi('/pedido/$id').useParams(); const { scope } = useSession(); const query = useQuery(orderOptions(id, scope))
  useEffect(() => { if (query.data?.status === 'confirmed') void queryClient.invalidateQueries({ queryKey: ['cart', scope] }) }, [query.data?.status, scope])
  if (query.isPending) return <Skeleton kind="detail" />
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />
  const order = query.data
  if (order.status === 'pending') return <section className="page state-box" role="status"><Clock3 size={40} /><h1>Pedido pendente</h1><p>Aguardando a confirmação do pagamento. Você pode recarregar esta página com segurança.</p><p>Pedido {order.id}</p><Button onClick={() => void query.refetch()}>Consultar estado</Button><Link to="/pedidos">Meus pedidos</Link></section>
  if (order.status === 'refused') return <section className="page state-box" role="alert"><XCircle size={40} /><h1>Pagamento recusado</h1><p>Não foi possível concluir o pagamento. Seus itens continuam no carrinho.</p><Button asChild><Link to="/carrinho">Voltar ao carrinho</Link></Button></section>
  return <section className="page receipt"><CheckCircle2 className="receipt-icon" size={45} /><h1>Compra confirmada</h1><p>Seus NFTs agora fazem parte da sua coleção.</p><div className="receipt-meta"><div>ID da transação<strong>{order.transaction}</strong></div><div>Data<strong>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</strong></div><div>Carteira<strong>{order.wallet.provider}</strong></div></div><h2>Detalhes da transação</h2>{order.quote.items.map((item) => <div className="checkout-item" key={`${item.nftId}:${item.editionId}`}><img src={item.image} alt="" width="60" height="60" /><span>{item.name}<small>Edição {item.edition} × {item.quantity}</small></span><strong>{eth(item.total)}</strong></div>)}<Totals quote={order.quote} /><Button asChild><Link to="/">Continuar explorando</Link></Button></section>
}
function statusLabel(status: string) { return status === 'confirmed' ? 'Confirmado' : status === 'refused' ? 'Recusado' : 'Pendente' }
