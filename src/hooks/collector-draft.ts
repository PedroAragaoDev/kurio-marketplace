import { useEffect, useState } from 'react'
import { z } from 'zod'
import { checkoutCollectorInput, type CheckoutCollector } from '../contracts/inputs'
import type { Profile, Wallet } from '../contracts/models'

const draftSchema = checkoutCollectorInput.extend({
  displayName: z.string().max(80), username: z.string().max(40), email: z.string().max(254),
  walletAddress: z.string().max(100), walletId: z.string(),
}).partial()
type Draft = CheckoutCollector & { walletId: string }

function readSaved(key: string) {
  try { return draftSchema.safeParse(JSON.parse(sessionStorage.getItem(key) ?? 'null')).data ?? {} } catch { return {} }
}
function walletFields(wallet: Wallet | undefined) {
  return { walletId: wallet?.id ?? '', network: wallet?.network ?? 'Ethereum' as const, walletAddress: wallet?.address ?? '', walletProvider: wallet?.provider ?? 'MetaMask' as const }
}
function profileFields(user: Profile | null | undefined) {
  const empty = { displayName: '', username: '', email: '', ens: '' }
  if (!user) return empty
  return { displayName: user.displayName, username: user.username, email: user.email, ens: user.ens }
}
function selectedWallet(wallets: Wallet[], id: string | undefined) {
  return wallets.find((item) => item.id === id) ?? wallets.find((item) => item.primary) ?? wallets[0]
}
function initialDraft(key: string, user: Profile | null | undefined, wallets: Wallet[]): Draft {
  const saved = readSaved(key)
  const wallet = selectedWallet(wallets, saved.walletId)
  const defaults = {
    ...profileFields(user), profileName: wallet?.profileName ?? '', referral: '', notes: '', secondaryWallet: '',
    ...walletFields(wallet),
  }
  const data = { ...defaults, ...saved, walletId: defaults.walletId }
  if (saved.walletId && saved.walletId !== defaults.walletId) return { ...data, ...walletFields(wallet) }
  return data
}
export function useCollectorDraft(key: string, user: Profile | null | undefined, wallets: Wallet[]) {
  const [data, setData] = useState(() => initialDraft(key, user, wallets))
  useEffect(() => { sessionStorage.setItem(key, JSON.stringify(data)) }, [key, data])
  const update = (name: keyof CheckoutCollector, value: string) => setData((current) => ({ ...current, [name]: value }))
  const selectWallet = (wallet: Wallet) => setData((current) => ({ ...current, ...walletFields(wallet) }))
  return { data, update, selectWallet }
}
export type CollectorDraft = ReturnType<typeof useCollectorDraft>
