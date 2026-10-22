import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { Cart, Collector, Quote, Wallet } from '../contracts/models'
import { cartOptions, walletsOptions } from '../lib/query'
import { useSession } from '../hooks/session'
import { useQuote } from '../hooks/cart'
import { usePurchase } from '../hooks/purchase'
import { useCollectorDraft } from '../hooks/collector-draft'
import { CheckoutCollectorForm, checkoutConfirmId, collectorFormId } from '../components/checkout-collector'
import { CheckoutWallets } from '../components/checkout-wallets'
import { Empty, ErrorState, Skeleton } from '../components/feedback'
import { Totals } from '../components/summary'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/dialog'

type Review = { collector: Collector; walletId: string; quote: Quote }
type Purchase = ReturnType<typeof usePurchase>
type CheckoutData = { cart: Cart; wallets: Wallet[] }

export default function CheckoutPage() {
  const { scope } = useSession(); const cart = useQuery(cartOptions(scope)); const wallets = useQuery(walletsOptions(scope))
  if (cart.isPending || wallets.isPending) return <Skeleton kind="detail" />
  if (cart.isError || wallets.isError) return <ErrorState error={(cart.error || wallets.error)!} retry={() => { void cart.refetch(); void wallets.refetch() }} />
  return <Checkout cart={cart.data} wallets={wallets.data} />
}
function Checkout({ cart, wallets }: CheckoutData) {
  const purchase = usePurchase()
  return <section className="page checkout-page"><p className="breadcrumb">Início / Mercado / Pagamento</p><h1 className="sr-only">Pagamento com carteira</h1>
    <PurchaseFeedback purchase={purchase} /><CheckoutContent cart={cart} wallets={wallets} purchase={purchase} />
  </section>
}
function PurchaseFeedback({ purchase }: { purchase: Purchase }) {
  return <>{purchase.attempt && <div className="notice-box"><h2>Há uma tentativa de compra para recuperar</h2><p>Consulte a mesma tentativa, sem criar outro pedido.</p><Button disabled={purchase.pending} onClick={() => void purchase.recover()}>Recuperar tentativa</Button></div>}{purchase.error && <p className="error-text notice-box" role="alert">{purchase.error}</p>}</>
}
function CheckoutContent({ cart, wallets, purchase }: CheckoutData & { purchase: Purchase }) {
  const { session } = useSession()
  const quote = useQuote(cart.version, !!cart.items.length)
  const draft = useCollectorDraft('kurio.collector.' + session?.user?.id, session?.user, wallets)
  const [review, setReview] = useState<Review | null>(null)
  const wallet = wallets.find((item) => item.id === draft.data.walletId)
  if (!cart.items.length) return <Empty title="Não há itens para pagar"><Button asChild><Link to="/pedidos">Consultar pedidos</Link></Button></Empty>
  if (quote.isPending) return <Skeleton kind="detail" />
  if (quote.isError) return <ErrorState error={quote.error} retry={() => void quote.refetch()} />
  return <div className="checkout-layout">
    <CheckoutCollectorForm key={draft.data.walletId} draft={draft} wallet={wallet} onUpdate={draft.update} onReview={(collector) => setReview({ collector, walletId: draft.data.walletId, quote: structuredClone(quote.data) })} />
    <aside className="checkout-summary"><CheckoutSummary quote={quote.data} />
      <CheckoutWallets wallets={wallets} selected={draft.data.walletId} onSelect={draft.selectWallet} />
      <CheckoutConfirm wallet={wallet} purchase={purchase} />
    </aside>
    {review && <ReviewStep review={review} quote={quote.data} wallets={wallets} purchase={purchase} onBack={() => setReview(null)} />}
  </div>
}
function CheckoutConfirm({ wallet, purchase }: { wallet?: Wallet; purchase: Purchase }) {
  return <Button id={checkoutConfirmId} className="wide checkout-confirm" type="submit" form={collectorFormId} disabled={!wallet || purchase.pending || !!purchase.attempt}>Confirmar compra</Button>
}
function ReviewStep({ review, quote, wallets, purchase, onBack }: {
  review: Review; quote: Quote; wallets: Wallet[]; purchase: Purchase; onBack: () => void
}) {
  const changed = quote.fingerprint !== review.quote.fingerprint
  const wallet = wallets.find((item) => item.id === review.walletId)
  return <Modal title="Revise sua compra" description="Confira os dados, os itens e o total antes de enviar o pedido." open onOpenChange={(open) => { if (!open) onBack() }} onCloseAutoFocus={(event) => { event.preventDefault(); document.getElementById(checkoutConfirmId)?.focus() }}>
    <div className="review"><p>{review.collector.displayName} · {review.collector.email}</p><p>Carteira: {wallet?.label}<small>{review.collector.walletProvider} · {review.collector.network}</small><small className="review-address">{review.collector.walletAddress}</small></p>
      <PurchaseFeedback purchase={purchase} />
      <Totals quote={review.quote} />{changed && <p className="error-text" role="alert">A cotação mudou. Revise os valores atualizados antes de confirmar.</p>}
      <Button variant="outline" onClick={onBack}>Voltar aos dados</Button><Button disabled={purchase.pending || !!purchase.attempt || !wallet || changed} onClick={() => void purchase.confirm(review)}>{purchase.pending ? 'Enviando pedido…' : 'Confirmar compra'}</Button>
    </div>
  </Modal>
}
function CheckoutSummary({ quote }: { quote: Quote }) {
  return <><h2>Seus NFTs</h2><div className="checkout-table-head"><span>NFTs</span><span>Subtotal</span></div>{quote.items.map((item) => <div className="checkout-item" key={item.lineId}><img src={item.image} alt="" width="60" height="60" /><div>{item.name}<small>Edição {item.edition} × {item.quantity}</small></div><strong>{item.total} ETH</strong></div>)}<Link className="checkout-coupon" to="/carrinho">Tem um código promocional? Aplique aqui</Link><Totals quote={quote} /></>
}
