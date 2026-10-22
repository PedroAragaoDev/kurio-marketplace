import { lazy, Suspense } from 'react'
import { createRootRoute, createRoute, createRouter, redirect, Link, type SearchSchemaInput } from '@tanstack/react-router'
import { catalogSearchSchema, type CatalogSearch } from './contracts/models'
import { queryClient, sessionOptions } from './lib/query'
import { setSessionNonce } from './lib/api'
import { Shell } from './components/shell'
import { Skeleton, ErrorState } from './components/feedback'

const Catalog = lazy(() => import('./pages/catalog'))
const Detail = lazy(() => import('./pages/detail'))
const Cart = lazy(() => import('./pages/cart'))
const Checkout = lazy(() => import('./pages/checkout'))
const Profile = lazy(() => import('./pages/account'))
const Wallets = lazy(() => import('./pages/wallets'))
const Favorites = lazy(() => import('./pages/favorites'))
const Demo = lazy(() => import('./pages/demo'))
const Login = lazy(() => import('./pages/auth').then((module) => ({ default: module.LoginPage })))
const Signup = lazy(() => import('./pages/auth').then((module) => ({ default: module.SignupPage })))
const Orders = lazy(() => import('./pages/orders').then((module) => ({ default: module.OrdersPage })))
const Order = lazy(() => import('./pages/orders').then((module) => ({ default: module.OrderPage })))
const root = createRootRoute({ component: () => <Suspense fallback={<Skeleton kind="detail" />}><Shell /></Suspense>, notFoundComponent: () => <section className="page state-box"><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></section>, errorComponent: ({ error }) => <ErrorState error={error instanceof Error ? error : new Error('Não foi possível carregar esta página.')} /> })
const parent = () => root
const authSearch = (search: Record<string, unknown>) => ({ returnTo: typeof search.returnTo === 'string' ? search.returnTo : '/' })
async function protect({ location }: { location: { href: string } }) {
  const session = await queryClient.fetchQuery(sessionOptions)
  setSessionNonce(session.nonce)
  if (!session.user) throw redirect({ to: '/login', search: { returnTo: location.href } })
}
const catalog = createRoute({ getParentRoute: parent, path: '/', validateSearch: (search: SearchSchemaInput & Partial<CatalogSearch>) => catalogSearchSchema.parse(search), component: Catalog })
const detail = createRoute({ getParentRoute: parent, path: '/nft/$id', component: Detail })
const cart = createRoute({ getParentRoute: parent, path: '/carrinho', component: Cart })
const checkout = createRoute({ getParentRoute: parent, path: '/pagamento', beforeLoad: protect, component: Checkout })
const login = createRoute({ getParentRoute: parent, path: '/login', validateSearch: authSearch, component: Login })
const signup = createRoute({ getParentRoute: parent, path: '/cadastro', validateSearch: authSearch, component: Signup })
const profile = createRoute({ getParentRoute: parent, path: '/perfil', beforeLoad: protect, component: Profile })
const wallets = createRoute({ getParentRoute: parent, path: '/carteiras', beforeLoad: protect, component: Wallets })
const favorites = createRoute({ getParentRoute: parent, path: '/favoritos', beforeLoad: protect, component: Favorites })
const orders = createRoute({ getParentRoute: parent, path: '/pedidos', beforeLoad: protect, component: Orders })
const order = createRoute({ getParentRoute: parent, path: '/pedido/$id', beforeLoad: protect, component: Order })
const demo = createRoute({ getParentRoute: parent, path: '/demonstracao', component: Demo })
export const router = createRouter({ routeTree: root.addChildren([catalog, detail, cart, checkout, login, signup, profile, wallets, favorites, orders, order, demo]), defaultPreload: 'intent', scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
