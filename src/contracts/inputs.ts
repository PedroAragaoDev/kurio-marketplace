import { z } from 'zod'
import { collectorSchema, network, provider, walletAddress } from './models'

const password = z.string().min(10, 'Use ao menos 10 caracteres').max(128)
export const loginInput = z.object({ email: z.email(), password: z.string().min(1).max(128) })
export const signupInput = loginInput.extend({ username: z.string().trim().regex(/^[\w.-]{3,40}$/, 'Use de 3 a 40 letras, números, ponto ou hífen'), password, confirmPassword: password })
  .refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'As senhas devem ser iguais' })
export const profileInput = z.object({
  displayName: z.string().trim().min(2).max(80), username: z.string().regex(/^[\w.-]{3,40}$/),
  email: z.email(), ens: z.string().max(100), nickname: z.string().max(80),
  avatar: z.string().max(400000).refine((value) => !value || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value), 'Avatar inválido'),
})
export const passwordInput = z.object({ currentPassword: z.string().max(128), password, confirmPassword: password })
  .refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'As senhas devem ser iguais' })
export const walletInput = z.object({
  label: z.string().trim().min(2).max(60), address: walletAddress,
  network, provider, primary: z.boolean(), profileName: z.string().max(80), email: z.email(),
  ens: z.string().max(100), referral: z.string().max(40),
})
export const checkoutCollectorInput = collectorSchema.extend({ network, walletAddress, walletProvider: provider, secondaryWallet: z.string().trim().max(100) })
export type CheckoutCollector = z.infer<typeof checkoutCollectorInput>
export const orderInput = z.object({ quoteId: z.string(), walletId: z.string(), collector: collectorSchema })
export const errorSchema = z.object({ code: z.string(), message: z.string(), fields: z.record(z.string(), z.string()).optional() })
export type ApiError = z.infer<typeof errorSchema>
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError; status: number }
