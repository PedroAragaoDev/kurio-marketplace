import { useQuery } from '@tanstack/react-query'
import { catalogSearchSchema } from '../contracts/models'
import { catalogOptions } from '../lib/query'
import { useNotice } from './feedback'
import { Button } from './ui/button'

export function Journal() {
  const query = useQuery(catalogOptions(catalogSearchSchema.parse({}))); const notice = useNotice()
  if (!query.data) return null
  return <section className="journal"><h2>Diário da Cunhagem</h2><p className="muted">Histórias, guias e inspirações para colecionar arte digital.</p><div className="journal-grid">{query.data.items.slice(0, 4).map((nft) => <article key={nft.id}><img src={nft.image} alt="" loading="lazy" width="250" height="180" /><div><span className="eyebrow">ARTE E CULTURA</span><h3>Um novo olhar para {nft.collection}</h3><p>Conheça as ideias que dão forma à cultura digital.</p><Button variant="ghost" onClick={() => notice('Este artigo ainda não está disponível.')}>Ler mais →</Button></div></article>)}</div></section>
}
