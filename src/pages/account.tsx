import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { passwordInput, profileInput } from '../contracts/inputs'
import { profileSchema, type Profile } from '../contracts/models'
import { api } from '../lib/api'
import { profileOptions, queryClient } from '../lib/query'
import { useSession } from '../hooks/session'
import { Form, Field } from '../components/form'
import { ErrorState, Skeleton, useNotice } from '../components/feedback'
import { Button } from '../components/ui/button'

export function AccountLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="page account-layout"><aside className="account-menu"><h2>Meu perfil</h2><nav aria-label="Minha conta"><Link to="/perfil">Dados do perfil</Link><Link to="/carteiras">Carteiras</Link><Link to="/favoritos">Lista de interesse</Link><Link to="/pedidos">Meus pedidos</Link></nav></aside><div className="account-content"><h1>{title}</h1>{children}</div></section>
}
export default function ProfilePage() {
  const { scope } = useSession(); const query = useQuery(profileOptions(scope))
  return <AccountLayout title="Perfil do colecionador">{query.isPending ? <Skeleton kind="detail" /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <ProfileForm key={query.data.id} profile={query.data} />}</AccountLayout>
}
function ProfileForm({ profile }: { profile: Profile }) {
  const [avatar, setAvatar] = useState(profile.avatar); const notice = useNotice(); const { scope } = useSession()
  const upload = (file: File | undefined) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 250000) { notice('Escolha uma imagem PNG, JPEG ou WebP de até 250 KB.'); return }
    const reader = new FileReader(); reader.onload = () => setAvatar(String(reader.result)); reader.readAsDataURL(file)
  }
  return <><Form schema={profileInput} label="Salvar perfil" submit={async (data) => {
    const result = await api('/profile', profileSchema, 'PUT', data)
    if (result.ok) { queryClient.setQueryData(['profile', scope], result.data); await queryClient.invalidateQueries({ queryKey: ['session'] }); notice('Perfil atualizado.') }
    return result
  }}><Field label="Nome de exibição *" name="displayName" defaultValue={profile.displayName} /><Field label="Nome de usuário *" name="username" defaultValue={profile.username} /><Field label="E-mail *" name="email" type="email" defaultValue={profile.email} /><Field label="Nome ENS (opcional)" name="ens" defaultValue={profile.ens} /><Field label="Apelido da carteira" name="nickname" defaultValue={profile.nickname} /><div className="field"><label htmlFor="avatar">Avatar (até 250 KB)</label><div className="avatar-control">{avatar && <img src={avatar} alt="Seu avatar" width="52" height="52" />}<input id="avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => upload(event.target.files?.[0])} /><Button variant="ghost" onClick={() => setAvatar('')}>Remover avatar</Button></div><input type="hidden" name="avatar" value={avatar} /></div></Form><h2 className="section-title">Alterar senha</h2><Form schema={passwordInput} label="Salvar nova senha" className="password-form" submit={async (data) => {
    const result = await api('/password', z.object({ success: z.boolean() }), 'PUT', data)
    if (result.ok) notice('Senha alterada. Use a nova senha no próximo login.')
    return result
  }}><Field label="Senha atual" name="currentPassword" type="password" autoComplete="current-password" /><Field label="Nova senha" name="password" type="password" autoComplete="new-password" /><Field label="Confirmar nova senha" name="confirmPassword" type="password" autoComplete="new-password" /></Form></>
}
