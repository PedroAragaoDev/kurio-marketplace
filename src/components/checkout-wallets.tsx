import { Link } from '@tanstack/react-router'
import type { Wallet } from '../contracts/models'

export function CheckoutWallets({ wallets, selected, onSelect }: {
  wallets: Wallet[]; selected: string; onSelect: (wallet: Wallet) => void
}) {
  return <section className="wallet-selection" aria-labelledby="payment-wallets-title"><h2 id="payment-wallets-title">Carteira e rede</h2>
    <fieldset><legend className="sr-only">Selecione uma carteira cadastrada</legend>{wallets.map((wallet) => <label key={wallet.id} className={`wallet-option ${selected === wallet.id ? 'selected' : ''}`}>
      <input type="radio" name="wallet" value={wallet.id} checked={selected === wallet.id} onChange={() => onSelect(wallet)} />
      <span>{wallet.label}<small>{wallet.provider} · {wallet.network}</small><small>{wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}</small></span>
    </label>)}</fieldset>
    {!wallets.length && <p className="muted">Cadastre uma carteira para continuar.</p>}
    <Link className="manage-wallets" to="/carteiras">Cadastrar ou editar carteiras</Link>
  </section>
}
