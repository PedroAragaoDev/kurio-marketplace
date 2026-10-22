import { useState, type ChangeEvent } from 'react'
import { checkoutCollectorInput, type CheckoutCollector } from '../contracts/inputs'
import { network, provider, type Wallet } from '../contracts/models'
import type { CollectorDraft } from '../hooks/collector-draft'
import { Field, Form, Select, TextArea } from './form'

export const collectorFormId = 'checkout-collector'
export const checkoutConfirmId = 'checkout-confirm'
export function CheckoutCollectorForm({ draft, wallet, onUpdate, onReview }: {
  draft: CollectorDraft; wallet?: Wallet;
  onUpdate: (name: keyof CheckoutCollector, value: string) => void; onReview: (data: CheckoutCollector) => void
}) {
  const [otherWallet, setOtherWallet] = useState(draft.data.walletAddress !== wallet?.address)
  const bind = (name: keyof CheckoutCollector) => ({ name, value: draft.data[name], onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onUpdate(name, event.target.value) })
  return <section className="collector-profile" aria-labelledby="collector-title"><h2 id="collector-title">Perfil do colecionador</h2>
    <Form id={collectorFormId} schema={checkoutCollectorInput} hideSubmit submit={async (data) => {
      if (!wallet) return { ok: false, status: 422, error: { code: 'WALLET_REQUIRED', message: 'Selecione uma carteira cadastrada antes de revisar.' } }
      onReview(data); return { ok: true, data: null }
    }}>
      <Field label="Nome de exibição *" {...bind('displayName')} autoComplete="name" maxLength={80} />
      <Field label="Nome de usuário *" {...bind('username')} autoComplete="username" maxLength={40} />
      <Select label="Rede *" {...bind('network')}>{network.options.map((value) => <option key={value}>{value}</option>)}</Select>
      <Field label="Nome do perfil" {...bind('profileName')} maxLength={80} />
      <Field label="Endereço da carteira *" {...bind('walletAddress')} readOnly={!otherWallet} spellCheck={false} maxLength={100} />
      <Field label="ENS ou carteira secundária (opcional)" {...bind('secondaryWallet')} placeholder="ENS ou carteira secundária (opcional)" maxLength={100} />
      <Select label="Tipo de carteira *" {...bind('walletProvider')}>{provider.options.map((value) => <option key={value}>{value}</option>)}</Select>
      <Field label="Código de indicação (opcional)" {...bind('referral')} maxLength={40} />
      <Field label="E-mail *" {...bind('email')} type="email" autoComplete="email" maxLength={254} />
      <Field label="Nome ENS (opcional)" {...bind('ens')} placeholder="seunome.eth" maxLength={100} />
      <label className="other-wallet"><input type="checkbox" checked={otherWallet} onChange={(event) => {
        setOtherWallet(event.target.checked)
        if (!event.target.checked) onUpdate('walletAddress', wallet?.address ?? '')
      }} />Usar outra carteira?</label>
      <TextArea label="Observação do colecionador (opcional)" {...bind('notes')} rows={5} maxLength={500} />
    </Form>
  </section>
}
