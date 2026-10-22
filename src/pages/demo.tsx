import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
import { RealtimeConnection } from '../hooks/realtime'
import { DemoPanel } from '../components/demo-panel'

export default function DemoPage() {
  const connected = useContext(RealtimeConnection)
  return <section className="page evaluation-page"><h1>Cenários de avaliação</h1><p>Controles técnicos dos mocks exigidos pelo desafio. As mudanças valem para esta aba e persistem ao navegar pelo marketplace.</p>
    {import.meta.env.VITE_ENABLE_MOCKS === 'false' ? <p>Ative VITE_ENABLE_MOCKS para utilizar os cenários.</p> : <DemoPanel connected={connected} />}
    <Link to="/">Voltar ao marketplace</Link>
  </section>
}
