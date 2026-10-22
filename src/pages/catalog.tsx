import { useState } from 'react'
import { useNavigate, getRouteApi, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import type { CatalogSearch } from '../contracts/models'
import { catalogOptions } from '../lib/query'
import { NftCard } from '../components/nft-card'
import { Empty, ErrorState, Skeleton } from '../components/feedback'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/dialog'
import { PriceRange } from '../components/price-range'
import { Journal } from '../components/journal'

const route = getRouteApi('/')
export default function CatalogPage() {
  const search = route.useSearch(); const navigate = useNavigate({ from: '/' })
  const query = useQuery(catalogOptions(search))
  const update = (patch: Partial<CatalogSearch>) => { void navigate({ search: { ...search, ...patch, page: patch.page ?? 1 }, resetScroll: false }) }
  const filters = <Filters search={search} update={update} categories={query.data?.categories ?? []} />
  return <><Hero /><section id="catalogo" className="catalog-layout" aria-label="Catálogo de NFTs">
    <aside className="desktop-filters">{filters}<div className="featured-box"><h3>NFT EM DESTAQUE</h3><p>OFERTA LIMITADA</p><Link to="/nft/$id" params={{ id: 'nft-2' }}><img src="/art/sage.webp" alt="Sage Nomad em destaque" width="250" height="250" loading="lazy" /></Link></div></aside>
    <div className="catalog-main"><div className="catalog-search"><label className="search-input"><Search size={18} /><span className="sr-only">Buscar NFTs</span><input type="search" placeholder="Explorar coleções" value={search.q} onChange={(event) => update({ q: event.target.value })} /></label><FilterDrawer>{filters}</FilterDrawer></div>
      <div className="catalog-toolbar"><div className="catalog-tabs" aria-label="Exibição do catálogo">{([['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']] as const).map(([value, label]) => <button key={value} className={search.tab === value ? 'active' : ''} aria-pressed={search.tab === value} onClick={() => update({ tab: value })}>{label}</button>)}</div><label className="sort-label">Ordenar por:<select aria-label="Ordenar por" value={search.sort} onChange={(event) => update({ sort: event.target.value as CatalogSearch['sort'] })}><option value="recent">Listados recentemente</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="popular">Mais populares</option></select></label></div>
      {query.isPending ? <Skeleton count={9} /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <>
        <p className="results-count" role="status">{query.data.total} NFTs encontrados{query.isFetching ? ' · Atualizando…' : ''}</p>
        {query.data.items.length ? <div className="nft-grid">{query.data.items.map((nft, index) => <NftCard key={nft.id} nft={nft} priority={index < 3} />)}</div> : <Empty title="Nenhum NFT encontrado"><p>Tente outra busca ou remova alguns filtros.</p><Button onClick={() => update({ q: '', category: '', network: '', min: '', max: '', tab: 'all' })}>Limpar filtros</Button></Empty>}
        <nav className="pagination" aria-label="Paginação"><Button variant="outline" aria-label="Página anterior" disabled={search.page === 1} onClick={() => update({ page: search.page - 1 })}><ChevronLeft size={16} /></Button>{Array.from({ length: query.data.pages }, (_, i) => <Button variant={search.page === i + 1 ? 'default' : 'outline'} key={i} aria-current={search.page === i + 1 ? 'page' : undefined} onClick={() => update({ page: i + 1 })}>{i + 1}</Button>)}<Button variant="outline" aria-label="Próxima página" disabled={search.page >= query.data.pages} onClick={() => update({ page: search.page + 1 })}><ChevronRight size={16} /></Button></nav>
      </>}
    </div></section><Promos /><Journal /></>
}
function Hero() {
  return <section className="hero"><div className="hero-copy"><p className="eyebrow">Bem-vindo à Kurio</p><h1>SEJA DONO DO FUTURO<br />DA ARTE DIGITAL</h1><p className="muted">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p><Button asChild><a href="#catalogo">EXPLORAR</a></Button><span className="hero-dots" aria-hidden="true">● ● ●</span></div><img className="hero-art" src="/art/emerald.webp" alt="Emerald Ape, primata de óculos e jaqueta verde da coleção Kurio" width="450" height="450" fetchPriority="high" /></section>
}
function FilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <Modal title="Filtrar NFTs" description="Combine coleções, rede e preço. As escolhas são preservadas na URL." open={open} onOpenChange={setOpen} drawer trigger={<Button variant="outline" className="mobile-filter-trigger" aria-label="Abrir filtros"><SlidersHorizontal size={18} /></Button>}>{children}<Button onClick={() => setOpen(false)}>Ver resultados</Button></Modal>
}
function Filters({ search, update, categories }: { search: CatalogSearch; update: (patch: Partial<CatalogSearch>) => void; categories: string[] }) {
  return <div className="filters"><h2>Coleções</h2><button className={!search.category ? 'active' : ''} onClick={() => update({ category: '' })}>Todas as coleções</button>{categories.map((category) => <button key={category} className={search.category === category ? 'active' : ''} aria-pressed={search.category === category} onClick={() => update({ category: search.category === category ? '' : category })}>{category}<ChevronRight size={13} /></button>)}<PriceRange search={search} update={update} /><h2>Rede</h2><select aria-label="Filtrar por rede" value={search.network} onChange={(event) => update({ network: event.target.value as CatalogSearch['network'] })}><option value="">Todas as redes</option>{['Ethereum', 'Polygon', 'Base'].map((name) => <option key={name}>{name}</option>)}</select></div>
}
function Promos() {
  return <section className="promos" aria-label="Descubra coleções"><article><img src="/art/emerald.webp" alt="" width="300" height="300" loading="lazy" /><div><h2>Lançamentos gênesis de edição limitada</h2><p>Colecione edições escassas e descubra novos olhares.</p><Button asChild><Link to="/" hash="catalogo">Explorar <ArrowRight size={16} /></Link></Button></div></article><article><img src="/art/neon.webp" alt="" width="300" height="300" loading="lazy" /><div><h2>Arte digital selecionada e muito mais</h2><p>Explore artistas e obras que definem o agora.</p><Button asChild><Link to="/" hash="catalogo">Explorar <ArrowRight size={16} /></Link></Button></div></article></section>
}
