import { delay, HttpResponse } from 'msw'
import { z } from 'zod'
import { currentUser, db } from './store'

export const failure = (status: number, code: string, message: string, fields?: Record<string, string>) => HttpResponse.json({ code, message, fields }, { status })
export async function body<T>(request: Request, schema: z.ZodType<T>) {
  let value: unknown
  try { value = await request.json() } catch { return { ok: false as const, response: failure(400, 'INVALID_JSON', 'Corpo JSON inválido') } }
  const parsed = schema.safeParse(value)
  if (parsed.success) return { ok: true as const, data: parsed.data }
  const fields = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
  return { ok: false as const, response: failure(422, 'VALIDATION', 'Confira os campos indicados.', fields) }
}
export async function guard(privateRoute = false, request?: Request) {
  const nonce = request?.headers.get('X-Session')
  await delay(db.scenario === 'slow' ? 1800 : 100)
  if (db.scenario === 'offline') return HttpResponse.error()
  if (db.scenario === 'server-error') return failure(503, 'UNAVAILABLE', 'Serviço temporariamente indisponível. Tente novamente.')
  return validateSession(privateRoute, nonce)
}
function validateSession(privateRoute: boolean, nonce: string | null | undefined) {
  if (!privateRoute && !nonce) return null
  if (nonce === 'visitor' && !privateRoute) return currentUser() ? failure(409, 'SESSION_CHANGED', 'A sessão mudou. Atualize os dados e tente novamente.') : null
  return validSessionNonce(nonce) ? null : failure(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre para continuar.')
}
function validSessionNonce(nonce: string | null | undefined) {
  return db.scenario !== 'session-expired' && currentUser() && nonce === db.session?.nonce
}
