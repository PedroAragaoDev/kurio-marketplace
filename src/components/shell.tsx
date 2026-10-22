import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart, House, LogIn, LogOut, Search, ShoppingCart, User, Wallet } from 'lucide-react'
import { z } from 'zod'
import { api } from '../lib/api'
import { cartOptions } from '../lib/query'
import { replaceSession, useSession } from '../hooks/session'
import { RealtimeConnection, useRealtime } from '../hooks/realtime'
import { useNotice } from './feedback'
import { Button } from './ui/button'
import { Footer } from './footer'

export function Shell() {
  const { session, scope } = useSession(); const navigate = useNavigate(); const notice = useNotice()
  const { data: cart } = useQuery(cartOptions(scope)); const connected = useRealtime()
  useEffect(() => {
    const expire = () => {
      const returnTo = location.pathname + location.search
      void replaceSession({ user: null, expiresAt: null, nonce: null }).then(() => {
        notice('Sua sessão expirou. Entre novamente para retomar.'); void navigate({ to: '/login', search: { returnTo } })
      })
    }
    window.addEventListener('kurio:session-expired', expire)
    return () => window.removeEventListener('kurio:session-expired', expire)
  }, [navigate, notice])
  const logout = async () => {
    const result = await api('/logout', z.object({ success: z.boolean() }), 'POST')
    if (!result.ok) { notice(result.error.message); return }
    await replaceSession({ user: null, expiresAt: null, nonce: null }); void navigate({ to: '/' })
  }
  return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><header className="site-header container">
    <Link to="/" className="brand" aria-label="KURIO início">KURIO</Link><nav aria-label="Navegação principal" className="desktop-nav"><Link to="/" activeOptions={{ exact: true, includeHash: true }}>Início</Link><Link to="/" hash="catalogo" activeOptions={{ exact: true, includeHash: true }}>Mercado</Link><button onClick={() => notice('Conteúdo de criadores ainda não disponível.')}>Criadores</button><button onClick={() => notice('Conteúdo editorial ainda não disponível.')}>Aprenda</button></nav>
    <div className="header-actions"><Link to="/" hash="catalogo" aria-label="Buscar NFTs" className="icon-link"><Search size={21} /></Link><Link to="/carrinho" aria-label={`Carrinho, ${cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0} itens`} className="cart-link"><ShoppingCart size={23} /><span>{cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0}</span></Link>
      {session?.user ? <><Link to="/perfil" className="account-link"><User size={18} /><span>{session.user.displayName}</span></Link><Button variant="ghost" aria-label="Sair" onClick={() => void logout()}><LogOut size={18} /></Button></> : <Button asChild><Link to="/login" search={{ returnTo: location.pathname + location.search }}><LogIn size={18} />Entrar</Link></Button>}
    </div></header><RealtimeConnection.Provider value={connected}><main id="conteudo" className="container" data-connection-state={connected ? 'connected' : 'disconnected'}><Outlet /></main></RealtimeConnection.Provider><Footer />
    <nav className="mobile-nav" aria-label="Navegação mobile"><Link to="/" aria-label="Início"><House /></Link><Link to="/favoritos" aria-label="Favoritos"><Heart /></Link><Link to="/carrinho" aria-label="Carrinho"><ShoppingCart /></Link><Link to="/carteiras" aria-label="Carteiras"><Wallet /></Link><Link to="/perfil" aria-label="Perfil"><User /></Link></nav>
  </>
}
