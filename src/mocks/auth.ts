import { http, HttpResponse } from 'msw'
import { loginInput, passwordInput, profileInput, signupInput } from '../contracts/inputs'
import { makeCart, makeProfile, makeWallet } from './fixtures'
import { body, failure, guard } from './http'
import { currentUser, db, hashPassword, save } from './store'
import type { Cart } from '../contracts/models'

function mergeVisitorItems(target: Cart) {
  for (const item of db.carts.visitor?.items ?? []) {
    const available = db.catalog.find((nft) => nft.id === item.nftId)?.editions.find((edition) => edition.id === item.editionId)?.stock ?? 0
    const existing = target.items.find((line) => line.nftId === item.nftId && line.editionId === item.editionId)
    if (existing) existing.quantity = Math.min(available, existing.quantity + item.quantity)
    else if (available) target.items.push({ ...item, quantity: Math.min(available, item.quantity) })
  }
  target.items = target.items.filter((line) => line.quantity > 0)
  target.version++
}
function signIn(userId: string) {
  const target = db.carts[userId] ?? makeCart()
  mergeVisitorItems(target)
  db.carts[userId] = target
  db.carts.visitor = makeCart()
  db.session = { userId, expiresAt: Date.now() + 30 * 60 * 1000, nonce: crypto.randomUUID() }
  save()
  return HttpResponse.json({ user: currentUser()!.profile, expiresAt: db.session.expiresAt, nonce: db.session.nonce })
}
async function login(request: Request) {
  const parsed = await body(request, loginInput)
  if (!parsed.ok) return parsed.response
  const user = db.users.find((entry) => entry.profile.email.toLowerCase() === parsed.data.email.toLowerCase())
  if (!user || await hashPassword(parsed.data.password, user.salt) !== user.hash) return failure(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.')
  return signIn(user.profile.id)
}
async function signup(request: Request) {
  const parsed = await body(request, signupInput)
  if (!parsed.ok) return parsed.response
  const { email, username, password } = parsed.data
  const salt = crypto.randomUUID()
  const hash = await hashPassword(password, salt)
  const conflict = db.users.some((user) => user.profile.email.toLowerCase() === email.toLowerCase() || user.profile.username === username)
  if (conflict || db.scenario === 'signup-conflict') return failure(409, 'ACCOUNT_CONFLICT', 'Este e-mail ou nome de usuário já está cadastrado.', { email: 'Conta já cadastrada' })
  const profile = { ...makeProfile(crypto.randomUUID(), username), email, displayName: username }
  db.users.push({ profile, salt, hash, favorites: [], wallets: [makeWallet(profile.id)] })
  return signIn(profile.id)
}
async function updateProfile(request: Request) {
  const parsed = await body(request, profileInput)
  if (!parsed.ok) return parsed.response
  const user = currentUser()!
  if (db.users.some((other) => other !== user && (other.profile.email === parsed.data.email || other.profile.username === parsed.data.username))) return failure(409, 'ACCOUNT_CONFLICT', 'E-mail ou usuário já utilizado.')
  user.profile = { ...user.profile, ...parsed.data }; save()
  return HttpResponse.json(user.profile)
}
async function changePassword(request: Request) {
  const parsed = await body(request, passwordInput)
  if (!parsed.ok) return parsed.response
  const user = currentUser()!
  if (await hashPassword(parsed.data.currentPassword, user.salt) !== user.hash) return failure(422, 'VALIDATION', 'Senha atual incorreta.', { currentPassword: 'Senha atual incorreta' })
  const nonce = db.session!.nonce
  const hash = await hashPassword(parsed.data.password, user.salt)
  if (db.session?.nonce !== nonce) return failure(401, 'SESSION_EXPIRED', 'Entre novamente.')
  user.hash = hash; save()
  return HttpResponse.json({ success: true })
}
export const authHandlers = [
  http.get('/api/session', async () => {
    const blocked = await guard(); if (blocked) return blocked
    const user = db.scenario === 'session-expired' ? undefined : currentUser()
    return HttpResponse.json({ user: user?.profile ?? null, expiresAt: user ? db.session!.expiresAt : null, nonce: user ? db.session!.nonce : null })
  }),
  http.post('/api/login', async ({ request }) => (await guard()) ?? login(request)),
  http.post('/api/signup', async ({ request }) => (await guard()) ?? signup(request)),
  http.post('/api/logout', async ({ request }) => {
    const blocked = await guard(true, request); if (blocked) return blocked
    db.session = null; save(); return HttpResponse.json({ success: true })
  }),
  http.get('/api/profile', async ({ request }) => (await guard(true, request)) ?? HttpResponse.json(currentUser()!.profile)),
  http.put('/api/profile', async ({ request }) => (await guard(true, request)) ?? updateProfile(request)),
  http.put('/api/password', async ({ request }) => (await guard(true, request)) ?? changePassword(request)),
]
