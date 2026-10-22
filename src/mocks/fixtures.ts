import type { Cart, Nft, Profile, Wallet } from '../contracts/models'

const artworks = [
  ['Emerald Ape #042', 'emerald', '1.19'], ['Sage Nomad #009', 'sage', '1.69'],
  ['Neon Vessel #552', 'neon', '1.99'], ['Cosmic Bloom #118', 'sage', '1.29'],
  ['Violet Nomad #314', 'sage', '1.39'], ['Ivory Baron #088', 'neon', '1.79'],
  ['Golden Beat #207', 'golden', '0.99'], ['Golden Signal #160', 'golden', '0.89'],
] as const
export const categories = ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Colecionáveis', 'Generativa', 'Jogos', 'Assinaturas', 'Utilidade']
export function makeCatalog(): Nft[] {
  return Array.from({ length: 27 }, (_, index) => {
    const [title, image, price] = artworks[index % artworks.length]
    return {
      id: `nft-${index + 1}`, name: index < 8 ? title : `${title.split(' #')[0]} #${300 + index}`,
      image: `/art/${image}.webp`, collection: 'Kurio Editions', category: categories[index % categories.length],
      network: (['Ethereum', 'Polygon', 'Base'] as const)[index % 3],
      description: 'Um colecionável digital 1/50 da coleção Kurio Editions. Arte, identidade e novos olhares para a cultura da internet.',
      rarity: index % 4 === 0 ? 'Raro' : 'Edição limitada', version: 1, featured: index < 3, popularity: 100 - index, rating: '4,8', reviewCount: 19,
      createdAt: new Date(Date.UTC(2026, 9, 21 - index)).toISOString(),
      editions: [
        { id: 'limited', label: '1/50', price, stock: 20 },
        { id: 'unique', label: '1/1', price: `${3 + index}.5`, stock: 1 },
        { id: 'open', label: 'Aberta', price: '0.25', stock: index === 0 ? 0 : 50 },
      ],
    }
  })
}
export function makeProfile(id: string, username: string): Profile {
  return { id, username, email: `${username}@kurio.test`, displayName: username === 'ana' ? 'Ana Silva' : 'Bruno Costa', ens: '', nickname: 'Minha coleção', avatar: '' }
}
export function makeWallet(userId: string): Wallet {
  return { id: `wallet-${userId}`, label: 'Principal', address: `0x${(userId === 'user-ana' ? 'a' : 'b').repeat(40)}`, network: 'Ethereum', provider: 'MetaMask', primary: true, profileName: 'Colecionador', email: `${userId.slice(5)}@kurio.test`, ens: '', referral: '' }
}
export const makeCart = (): Cart => ({ items: [], coupon: '', version: 1 })
