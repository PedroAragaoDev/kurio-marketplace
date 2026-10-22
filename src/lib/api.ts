import axios from 'axios'
import type { z } from 'zod'
import { errorSchema, type ApiError, type Result } from '../contracts/inputs'

let sessionNonce: string | null = null
export const setSessionNonce = (nonce: string | null) => { sessionNonce = nonce }
const client = axios.create({ baseURL: '/api', timeout: 8000, headers: { Accept: 'application/json' } })

export async function api<T>(path: string, schema: z.ZodType<T>, method = 'GET', data?: unknown, signal?: AbortSignal, headers?: Record<string, string>): Promise<Result<T>> {
  const requestNonce = sessionNonce
  try {
    const response = await client.request({ url: path, method, data, signal, headers: { ...headers, 'X-Session': requestNonce ?? 'visitor' } })
    const parsed = schema.safeParse(response.data)
    if (!parsed.success) return { ok: false, status: 502, error: { code: 'INVALID_RESPONSE', message: 'O serviço enviou dados inválidos.' } }
    return { ok: true, data: parsed.data }
  } catch (error) {
    return decodeFailure(error, requestNonce)
  }
}
function decodeFailure(error: unknown, requestNonce: string | null): Result<never> {
  if (axios.isCancel(error)) throw error
  const response = axios.isAxiosError(error) ? error.response : undefined
  const parsed = errorSchema.safeParse(response?.data)
  const problem: ApiError = parsed.success ? parsed.data : { code: 'NETWORK', message: 'Não foi possível conectar. Confira sua conexão e tente novamente.' }
  expireSession(problem, requestNonce)
  return { ok: false, status: response?.status ?? 0, error: problem }
}
function expireSession(problem: ApiError, requestNonce: string | null) {
  if (problem.code !== 'SESSION_EXPIRED' || requestNonce === null || requestNonce !== sessionNonce) return
  sessionNonce = null
  window.dispatchEvent(new Event('kurio:session-expired'))
}
export class RemoteError extends Error {
  constructor(public readonly problem: ApiError, public readonly status: number) { super(problem.message) }
}
// TanStack Query exposes failures through thrown query errors; keep that adapter here.
export async function read<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const result = await api(path, schema, 'GET', undefined, signal)
  if (!result.ok) throw new RemoteError(result.error, result.status)
  return result.data
}
