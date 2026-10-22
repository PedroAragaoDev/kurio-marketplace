# Contratos REST e eventos

Contratos executáveis: `src/contracts/models.ts` e `src/contracts/inputs.ts`. Toda chamada REST utiliza Axios, com validação Zod na entrada dos handlers e na saída do cliente. Prefixo `/api`. Erros: `{ code, message, fields? }`, com mensagens por nome de campo quando aplicável.

## Recursos

| Método | Endpoint | Entrada e resposta |
| --- | --- | --- |
| GET | /session | `{ user: Profile ou null, expiresAt, nonce }` |
| POST | /signup | username, email, password, confirmPassword; retorna sessão |
| POST | /login | email, password; retorna sessão |
| POST | /logout | encerra sessão |
| GET | /nfts | q, category, network, sort, tab, min, max, page; retorna items, total, pages, categories |
| GET | /nfts/:id | NFT com versões, edições, preço decimal e estoque inteiro |
| GET | /favorites | IDs do usuário |
| PUT / DELETE | /favorites/:id | inclui/remove e retorna IDs |
| GET | /cart | items, coupon, version |
| PUT | /cart | nftId, editionId, quantity; quantidade zero remove |
| PUT | /cart/coupon | code; vazio remove; retorna carrinho |
| POST | /quote | retorna snapshot, ownerId, fingerprint, validade, itens e valores |
| POST | /orders | quoteId, walletId, collector; header Idempotency-Key; retorna pedido |
| GET | /orders | pedidos da conta autenticada |
| GET | /orders/:id | estado/snapshot autorizado do pedido |
| GET / PUT | /profile | consulta/atualiza perfil e avatar |
| PUT | /password | currentPassword, password, confirmPassword |
| GET / POST | /wallets | consulta/cadastra carteiras |
| PUT | /wallets/:id | atualiza carteira própria |

O cliente envia `X-Session` com nonce da sessão simulada, ou `visitor` antes do login. A API rejeita nonce vencido ou de sessão anterior. Uma requisição de visitante que termina depois do login recebe 409 e não altera o carrinho autenticado. Respostas antigas não encerram uma sessão nova. O controle não é uma barreira real de segurança contra alguém que controla seu próprio navegador.

## Regras de contrato

- ETH é string decimal não negativa, com até 18 casas; cálculos usam bigint em wei, sem Number ou arredondamento binário.
- Catálogo: nove itens por página; ordenações recent, price-asc, price-desc e popular; tabs all, new e trending. Combina busca, coleção, rede e limites de preço.
- Quantidades: inteiros entre 1 e 100, limitados pelo estoque da edição. Zero no PUT de carrinho remove a linha.
- Cada linha recebe `lineId` UUID gerado pela API. Alterar quantidade preserva o identificador; remover e adicionar novamente gera outro. A confirmação desconta apenas linhas da tentativa original, preservando itens adicionados depois.
- Edições: limited (1/50), unique (1/1) e open (aberta); cada uma tem preço e estoque próprios na simulação.
- Cotação: válida por cinco minutos, vinculada ao proprietário; fingerprint inclui carrinho, versões/estoque dos recursos, preços, cupom e taxa.
- Cupom KURIO10: desconto de 10%, truncado à unidade mínima de wei. Taxa simulada fixa de 0.0016 ETH. O total é subtotal menos desconto mais taxa.
- Pedido: criação reserva estoque. Confirmação remove apenas quantidades compradas; recusa devolve estoque. Recibo copia a cotação, carteira e dados do colecionador.
- Checkout: `collector` inclui `network`, `walletAddress`, `walletProvider` e `secondaryWallet`. O formulário exige os três primeiros; endereço EVM, rede e provider são validados também na API. Esses dados compõem o snapshot da carteira do pedido, sem editar a carteira cadastrada. Pedidos e tentativas anteriores sem os campos adicionais continuam válidos e usam os dados da carteira selecionada.
- Idempotência é isolada por usuário e chave: mesmo payload retorna mesmo pedido; payload diferente retorna 409. A verificação ocorre antes de revalidar a cotação já consumida.
- Nome de usuário: 3–40 letras, números, ponto, underscore ou hífen. Senha: 10–128 caracteres, confirmação igual.
- Avatar: PNG/JPEG/WebP, até 250 KB no upload; conteúdo validado como data URL no handler.
- Redes demonstradas: Ethereum, Polygon e Base. Carteiras: MetaMask, WalletConnect e Coinbase Wallet; endereço EVM com 40 caracteres hexadecimais após 0x.
- ENS, indicação e observações são opcionais. Carteiras: no máximo duas, com uma principal.

## Erros

400 para JSON inválido; 401 para credenciais/sessão; 404 para recurso ausente ou pedido não pertencente à conta; 409 para conflito de cadastro, estoque, cotação ou idempotência; 422 para validação/cupom; 503 para indisponibilidade; 504 para o cenário de pedido criado sem resposta de sucesso. O cenário offline utiliza erro de rede MSW.

## Eventos

Canal Socket.IO no namespace padrão `/`, path `/socket.io/`, transporte WebSocket. Envelope: `{ id, resourceId, version, userId }`.

| Evento | Recurso | Ação no cliente |
| --- | --- | --- |
| nft.updated | NFT público, userId null | Invalidar catálogo, detalhe, carrinho e cotação ativos; avisar mudança |
| order.updated | Pedido privado, userId obrigatório | Reconsultar pedido autorizado e atualizar estado |

O cliente registra a maior versão por tipo/recurso e ignora duplicatas/antigos. Reconexão revalida os recursos ativos por REST; fim do ciclo de vida desconecta e remove listeners. Sessão e nonce delimitam a conexão.

## Controle de demonstração

Somente os handlers de mocks implementam GET/PUT `/demo`, POST `/demo/reset` e POST `/demo/action`. Ações: price, stock, duplicate, old, expire e settle. `nftId` é opcional e usa nft-1 como cenário padrão. Esses endpoints não são parte de uma API de produção.
