import { getRouteApi, useNavigate, Link } from '@tanstack/react-router'
import { loginInput, signupInput } from '../contracts/inputs'
import { sessionSchema } from '../contracts/models'
import { api } from '../lib/api'
import { replaceSession } from '../hooks/session'
import { Form, Field } from '../components/form'
import { Modal } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { useNotice } from '../components/feedback'

export function LoginPage() {
  const { returnTo } = getRouteApi('/login').useSearch(); const navigate = useNavigate(); const notice = useNotice()
  return <AuthFrame title="Entrar" onClose={() => void navigate({ to: '/' })}><p className="muted">Entre para gerenciar sua carteira, coleção e perfil.</p><Form schema={loginInput} label="Entrar" className="auth-form" submit={async (data) => {
    const result = await api('/login', sessionSchema, 'POST', data)
    if (result.ok) { await replaceSession(result.data); location.assign(safeReturn(returnTo)) }
    return result
  }}><Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="contato@email.com" /><Field label="Senha" name="password" type="password" autoComplete="current-password" /><Button variant="ghost" onClick={() => notice('Recuperação de senha por e-mail indisponível nesta versão.')}>Esqueceu a senha?</Button></Form><Social /><p>Novo na Kurio? <Link to="/cadastro" search={{ returnTo }}>Crie sua conta</Link></p></AuthFrame>
}
export function SignupPage() {
  const { returnTo } = getRouteApi('/cadastro').useSearch(); const navigate = useNavigate()
  return <AuthFrame title="Criar perfil de colecionador" onClose={() => void navigate({ to: '/' })}><Form schema={signupInput} label="Criar conta" className="auth-form" submit={async (data) => {
    const result = await api('/signup', sessionSchema, 'POST', data)
    if (result.ok) { await replaceSession(result.data); location.assign(safeReturn(returnTo)) }
    return result
  }}><Field label="Nome de usuário" name="username" autoComplete="username" /><Field label="E-mail" name="email" type="email" autoComplete="email" /><Field label="Senha" name="password" type="password" autoComplete="new-password" minLength={10} /><Field label="Confirmar senha" name="confirmPassword" type="password" autoComplete="new-password" /></Form><Social /><p>Já tem uma conta? <Link to="/login" search={{ returnTo }}>Entre</Link></p></AuthFrame>
}
function AuthFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="auth-background"><div><p>Bem-vindo à Kurio</p><h1>SEJA DONO DO FUTURO<br />DA ARTE DIGITAL</h1><p>Descubra arte digital e comece sua coleção.</p></div><img src="/art/emerald.webp" alt="" width="450" height="450" /><Modal title={title} description="Acesse sua conta KURIO para gerenciar sua coleção." open onOpenChange={(open) => { if (!open) onClose() }}>{children}</Modal></div>
}
function Social() {
  const notice = useNotice()
  return <div className="social-login"><span>Ou continue com</span><Button variant="outline" onClick={() => notice('Login com Google indisponível. Entre com e-mail e senha.')}>Continuar com Google</Button><Button variant="outline" onClick={() => notice('Login com Facebook indisponível. Entre com e-mail e senha.')}>Continuar com Facebook</Button></div>
}
function safeReturn(value: string) {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/login') && !value.startsWith('/cadastro') ? value : '/'
}
