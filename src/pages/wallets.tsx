import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { walletInput } from '../contracts/inputs'
import { walletSchema, type Wallet } from '../contracts/models'
import { api } from '../lib/api'
import { walletsOptions, queryClient } from '../lib/query'
import { useSession } from '../hooks/session'
import { AccountLayout } from './account'
import { Form, Field, Select } from '../components/form'
import { ErrorState, Skeleton, useNotice } from '../components/feedback'
import { Button } from '../components/ui/button'

export default function WalletsPage() {
  const { scope } = useSession(); const query = useQuery(walletsOptions(scope)); const [adding, setAdding] = useState(false)
  return <AccountLayout title="Carteiras">{query.isPending ? <Skeleton kind="detail" /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <><p className="muted">Gerencie as carteiras disponíveis no pagamento.</p>{query.data.map((wallet) => <WalletForm key={wallet.id} wallet={wallet} primary={wallet.primary} />)}{query.data.length < 2 && (adding ? <WalletForm primary={query.data.length === 0} onSaved={() => setAdding(false)} /> : <Button variant="outline" onClick={() => setAdding(true)}>Adicionar carteira secundária</Button>)}</>}</AccountLayout>
}
const formSchema = walletInput.omit({ primary: true })
function walletDefaults(wallet: Wallet | undefined, email: string): z.infer<typeof formSchema> {
  return wallet ?? { label: '', profileName: '', network: 'Ethereum', provider: 'MetaMask', address: '', email, ens: '', referral: '' }
}
function WalletForm({ wallet, primary, onSaved }: { wallet?: Wallet; primary: boolean; onSaved?: () => void }) {
  const { scope, session } = useSession(); const notice = useNotice()
  const defaults = walletDefaults(wallet, session?.user?.email ?? '')
  return <section className="wallet-form"><h2>{primary ? 'Carteira principal' : 'Carteira secundária'}</h2><Form schema={formSchema} label="Salvar carteira" submit={async (data) => {
    const result = await api(wallet ? `/wallets/${wallet.id}` : '/wallets', z.array(walletSchema), wallet ? 'PUT' : 'POST', { ...data, primary })
    if (result.ok) { queryClient.setQueryData(['wallets', scope], result.data); notice('Carteira salva.'); onSaved?.() }
    return result
  }}><Field label="Nome de exibição *" name="label" defaultValue={defaults.label} /><Field label="Apelido do perfil" name="profileName" defaultValue={defaults.profileName} /><Select label="Rede *" name="network" defaultValue={defaults.network}>{['Ethereum', 'Polygon', 'Base'].map((item) => <option key={item}>{item}</option>)}</Select><Select label="Tipo de carteira *" name="provider" defaultValue={defaults.provider}>{['MetaMask', 'WalletConnect', 'Coinbase Wallet'].map((item) => <option key={item}>{item}</option>)}</Select><Field label="Endereço da carteira *" name="address" defaultValue={defaults.address} placeholder="0x…" /><Field label="E-mail *" name="email" type="email" defaultValue={defaults.email} /><Field label="Nome ENS (opcional)" name="ens" defaultValue={defaults.ens} /><Field label="Código de indicação (opcional)" name="referral" defaultValue={defaults.referral} /></Form></section>
}
