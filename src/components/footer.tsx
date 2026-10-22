import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { catalogSearchSchema } from '../contracts/models'
import { Button } from './ui/button'

const features = [
  { icon: 'W', title: 'Segurança de carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { icon: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { icon: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
]
const helpTopics = ['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item']
const collections = [
  { label: 'Arte digital', category: 'Arte digital' }, { label: 'Fotografia', category: 'Fotografia' },
  { label: 'Música', category: 'Música' }, { label: 'Arte 3D', category: 'Arte 3D' }, { label: 'Utilidade', category: 'Utilidade' },
]
const socialPaths = {
  Facebook: 'M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1h-3c-4 0-5 2.4-5 6v2H7v4h3v8z',
  Instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm5.5-2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  Twitter: 'M22 5.9c-.7.3-1.4.5-2.2.6a3.8 3.8 0 0 0 1.7-2.1 7.8 7.8 0 0 1-2.4.9 3.8 3.8 0 0 0-6.5 3.5A10.8 10.8 0 0 1 2.8 4.9a3.8 3.8 0 0 0 1.2 5.1c-.6 0-1.2-.2-1.7-.5a3.8 3.8 0 0 0 3 3.8c-.6.2-1.2.2-1.7.1a3.8 3.8 0 0 0 3.5 2.6A7.7 7.7 0 0 1 2 17.6a10.8 10.8 0 0 0 16.6-9.1v-.5c.8-.6 1.4-1.3 2-2.1z',
  LinkedIn: 'M3 8h4v13H3zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5 6h4v2c.7-1.3 2-2.3 4-2.3 4 0 4 3 4 6V21h-4v-6.5c0-1.6 0-3-1.8-3-1.9 0-2.2 1.5-2.2 3V21h-4z',
  YouTube: 'M21.6 7.1a2.8 2.8 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.4 4.9a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.9.4-4.9s0-3.2-.4-4.9zM10 15.2V8.8l5.5 3.2z',
}

export function Footer() {
  return <footer className="container site-footer"><div className="footer-features">
    {features.map((feature) => <div className="footer-feature" key={feature.icon}><span className="feature-icon" aria-hidden="true">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}
    <Newsletter />
  </div><div className="footer-contact"><Link to="/" className="brand" aria-label="KURIO início">KURIO</Link><p>Feito para colecionadores,<br />criadores e cultura</p><span>contato@email.com</span><span>+55 11 4002 8922</span></div>
    <div className="footer-links"><nav aria-label="Meu perfil no rodapé"><h3>Meu perfil</h3><Link to="/perfil">Meu perfil</Link><Link to="/carteiras">Carteiras</Link><Link to="/pedidos">Meus pedidos</Link><Link to="/favoritos">Lista de interesse</Link></nav>
      <section aria-labelledby="footer-help"><h3 id="footer-help">Central de ajuda</h3><ul className="footer-static-list">{helpTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section>
      <nav aria-label="Coleções no rodapé"><h3>Coleções</h3>{collections.map(({ label, category }) => <Link key={category} to="/" search={catalogSearchSchema.parse({ category })} hash="catalogo">{label}</Link>)}</nav>
      <section className="footer-social-wallets"><h3>Redes sociais</h3><ul className="footer-socials" aria-label="Redes sociais">{Object.entries(socialPaths).map(([name, path]) => <li key={name}><span className="social-icon" role="img" aria-label={name}><svg viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d={path} /></svg></span></li>)}</ul>
        <h3>Carteiras compatíveis</h3><p className="footer-wallet-providers"><span>MetaMask</span><span>WalletConnect</span><span>Coinbase</span></p>
      </section></div><p className="copyright">© 2026 Kurio. Propriedade digital para todos.</p>
  </footer>
}
function Newsletter() {
  const [message, setMessage] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('O cadastro na newsletter não está disponível nesta versão.')
  }
  return <section className="footer-newsletter" aria-labelledby="newsletter-title"><h3 id="newsletter-title">Antecipe-se ao próximo lançamento</h3>
    <form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">E-mail para novidades</label><div><input id="newsletter-email" type="email" required maxLength={254} autoComplete="email" placeholder="digite seu e-mail..." /><Button type="submit">Enviar</Button></div><p role="status">{message}</p></form>
    <p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
  </section>
}
