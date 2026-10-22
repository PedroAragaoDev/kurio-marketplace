import { createContext, useContext, useId, useState, type ComponentProps, type ReactNode } from 'react'
import type { z } from 'zod'
import type { Result } from '../contracts/inputs'
import { Button } from './ui/button'

const FieldErrors = createContext<Record<string, string>>({})
export function Form<T>({ schema, submit, children, label = 'Salvar', className, id, hideSubmit = false }: {
  schema: z.ZodType<T>; submit: (data: T) => Promise<Result<unknown>>; children: ReactNode; label?: string; className?: string; id?: string; hideSubmit?: boolean
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  return <FieldErrors.Provider value={errors}><form id={id} noValidate className={className ?? 'form-grid'} onSubmit={async (event) => {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)))
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message])))
      setMessage('Confira os campos indicados.'); form.querySelector<HTMLInputElement>(`[name="${String(parsed.error.issues[0].path[0])}"]`)?.focus(); return
    }
    setErrors({}); setMessage(''); setPending(true)
    try {
      const result = await submit(parsed.data)
      if (!result.ok) { setErrors(result.error.fields ?? {}); setMessage(result.error.message) }
    } finally { setPending(false) }
  }}>
    {children}<div className="form-actions">{message && <p role="alert" className="error-text">{message}</p>}
      {!hideSubmit && <Button type="submit" disabled={pending}>{pending ? 'Enviando…' : label}</Button>}
    </div>
  </form></FieldErrors.Provider>
}
export function Field({ label, name, type = 'text', ...props }: ComponentProps<'input'> & { label: string; name: string }) {
  const id = useId(); const errors = useContext(FieldErrors)
  const [visible, setVisible] = useState(false)
  return <div className="field"><label htmlFor={id}>{label}</label><div className="input-wrap">
    <input {...props} id={id} name={name} type={type === 'password' && visible ? 'text' : type} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-error` : undefined} />
    {type === 'password' && <button type="button" className="password-toggle" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisible(!visible)}>{visible ? 'Ocultar' : 'Ver'}</button>}
  </div>{errors[name] && <span id={`${id}-error`} className="error-text">{errors[name]}</span>}</div>
}
export function Select({ label, name, children, ...props }: ComponentProps<'select'> & { label: string; name: string }) {
  const id = useId(); const errors = useContext(FieldErrors)
  return <div className="field"><label htmlFor={id}>{label}</label><select {...props} name={name} id={id} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-error` : undefined}>{children}</select>{errors[name] && <span id={`${id}-error`} className="error-text">{errors[name]}</span>}</div>
}
export function TextArea({ label, name, ...props }: ComponentProps<'textarea'> & { label: string; name: string }) {
  const id = useId(); const errors = useContext(FieldErrors)
  return <div className="field collector-notes"><label htmlFor={id}>{label}</label><textarea {...props} name={name} id={id} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-error` : undefined} />{errors[name] && <span id={`${id}-error`} className="error-text">{errors[name]}</span>}</div>
}
