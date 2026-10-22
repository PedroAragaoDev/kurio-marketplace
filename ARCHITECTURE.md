# Arquitetura KURIO

## Organização

`src/contracts` define schemas e tipos; `src/lib` concentra HTTP, cache e dinheiro; `src/mocks` contém fixtures, persistência e regras da API simulada; `src/hooks` coordena sessão, eventos, carrinho e compra; `src/components` concentra UI reutilizável; `src/pages` implementa os fluxos. As rotas carregam páginas por import dinâmico. Não existe backend remoto necessário à demonstração.

TanStack Router controla URLs, valida parâmetros e protege fluxos privados. TanStack Query coordena consultas, mutations e invalidação. Axios é o único cliente REST. MSW intercepta a rede; dados fictícios e decisões de negócio da simulação não ficam nos componentes.

## Sessão e isolamento

Sessões simuladas duram 30 minutos e possuem nonce aleatório. O bootstrap consulta a sessão antes de montar consumidores privados. O cache privado inclui escopo de usuário e nonce. Logout e nova autenticação cancelam consultas, limpam o cache e substituem a sessão. Requisições preservam o nonce capturado no envio, inclusive a identidade de visitante; respostas antigas não encerram uma sessão nova. Eventos de sessão anterior são bloqueados tanto no handler quanto no consumidor; listeners são removidos no cleanup.

Os dados da simulação persistem em `localStorage` sob `kurio.demo.v1`; drafts e tentativas de checkout usam `sessionStorage` por usuário. Senhas recebem salt individual e PBKDF2/SHA-256 com 100 mil iterações. Nenhuma senha é persistida em claro, nem há logs de credenciais. Toda a simulação continua inspecionável por quem controla o navegador: não usar dados pessoais ou segredos reais.

Uma infraestrutura de produção precisaria de autenticação no servidor, cookies protegidos, autorização persistente e rate limiting. O desafio não expõe endpoints de login reais; o rate limiting de um serviço público fica fora da simulação entregue.

## Carrinho e dinheiro

Carrinho visitante e carrinhos de usuários são separados. Login mescla por NFT/edição, soma quantidades e limita ao estoque. Valores trafegam como strings; o módulo monetário converte a wei/bigint, sem ponto flutuante. A cotação da API é a referência para finalizar.

Pedidos reservam estoque e são terminais após confirmação/recusa. Mesma chave/payload recupera o pedido; conteúdo diferente com a mesma chave falha. A UI persiste a tentativa antes da chamada, bloqueia envios simultâneos e oferece recuperação após timeout. Linhas de carrinho possuem identidade própria: a confirmação preserva itens removidos e adicionados novamente durante uma compra pendente. O recibo é snapshot, não uma projeção do catálogo atual.

## Cache e recuperação

- staleTime padrão 30 segundos e gcTime de cinco minutos; sessão 15 segundos; carrinho/cotação sempre revalidados.
- Chaves públicas incluem identificador ou parâmetros; privadas incluem usuário/nonce.
- Consultas usam AbortSignal; mudar busca/filtros cancela ou isola respostas anteriores.
- Retry de consulta: no máximo uma repetição em erro de rede ou 5xx; 4xx não repetem. Mutations não têm retry automático.
- Favoritos fazem update otimista, cancelamento da consulta anterior e rollback em erro.
- Cart/cupom atualizam cache após confirmação. Eventos invalidam consultas relevantes. Pedido pendente também usa polling REST de três segundos como recuperação complementar.
- Erros esperados de transporte usam Result. O adaptador `read` converte falhas para o mecanismo de erro exigido pelo TanStack Query.

## MSW e Socket.IO

MSW é iniciado antes de importar os consumidores de Socket.IO, evitando que o cliente capture um WebSocket nativo anterior à interceptação. O cliente real usa `socket.io-client`, transporte WebSocket e reconexão.

O handler MSW implementa o subconjunto textual de Engine.IO v4 e Socket.IO v5: handshake, namespace padrão, eventos JSON e heartbeat. Não usa setters da UI para simular eventos. Referência: [protocolo oficial Socket.IO](https://socket.io/docs/v4/socket-io-protocol/).

O binding sugerido no enunciado não é obrigatório; sua versão publicada consultada estava sem release recente. Preferiu-se um handler pequeno com o protocolo necessário, validado pelos E2E. Limitações: sem polling/upgrades, namespaces adicionais, eventos binários, ACKs ou rooms. Estado compartilhado apenas no contexto deste navegador; não simula um servidor multiusuário distribuído ou sincronização entre abas.

As fixtures e os cenários são determinísticos; latência é fixa no cenário lento e explicitamente diferente no cenário fora de ordem. O painel técnico fica em `/demonstracao`, fora do rodapé do marketplace, e altera o estado da API simulada e publica seus eventos. Reset substitui o cenário inteiro. O Shell mantém uma única conexão; um contexto compartilha seu estado com a página técnica, sem abrir outro socket.

## Decisões visuais e de UX

- Marca KURIO preservada, embora a página Figma se chame GreenMint.
- Imagens extraídas da exportação fornecida; sem requisições externas para arte ou fontes. Os recortes contêm os fundos já rasterizados e têm resolução inferior à de assets originais. Versões WebP comprimidas são usadas na interface; PNGs e a exportação original são preservados. O preload do artwork principal antecipa a imagem comum ao início e ao primeiro detalhe.
- Fonte monoespaçada do sistema até confirmação da família original; tokens numéricos foram aproximados da exportação. Não declarar fidelidade pixel a pixel.
- Desktop usa modal de autenticação; mobile usa apresentação em tela cheia. Rotas diretas funcionam em ambos.
- Checkout mobile contém dados, carteira/rede e revisão para suprir o frame incompleto.
- Selecionar uma carteira cadastrada já estabelece a conexão simulada, inclusive na seleção inicial e após refresh. Não há etapa manual de conectar ou simular recusa no resumo; o link para gerenciar carteiras permanece. Campos continuam validados e a revisão/cotação é obrigatória antes do envio. O aviso de demonstração foi retirado desse resumo conforme a referência; o pedido continua inteiramente simulado e os cenários de pagamento recusado ficam em `/demonstracao`.
- Perfil, carteiras e recibo têm adaptações mobile próprias; tablet usa layout intermediário.
- ENS/indicação são opcionais; endereço, e-mail, nome e dados necessários são validados. Base integra o conjunto EVM demonstrado, substituindo a referência visual a Solana.
- Google/Facebook, newsletter e conteúdo editorial informam indisponibilidade. Referências de transação são explicitamente simuladas.
- Os textos do marketplace usam linguagem normal de compra e conta, conforme a referência. A confirmação exibe Compra confirmada e apenas Continuar explorando; o botão de referência foi removido. Os esclarecimentos sobre mocks e dados fictícios ficam no README e na página técnica de avaliação. Ao carregar dados antigos, uma migração no store remove apenas a frase conhecida de demonstração da descrição dos NFTs, preservando contas, carrinhos, preços, estoque e snapshots de pedidos.
- Rodapé recomposto a partir da referência: benefícios, newsletter, faixa de contato, conta, ajuda, categorias, redes sociais e carteiras compatíveis. Conta usa telas existentes; categorias abrem o catálogo filtrado e reiniciam os demais filtros. Ajuda e ícones sociais são decorativos, sem links ou botões. Atividade, estúdio de criador e uma página própria de coleção não existem no escopo; a coluna de perfil oferece perfil, carteiras, pedidos e favoritos. A newsletter valida o e-mail e informa indisponibilidade, sem enviar ou persistir o endereço.
- Contraste, labels, foco, movimento reduzido e anúncios acessíveis prevalecem sobre detalhes do desenho quando necessário.

## Validação e limites da entrega

Scripts de tipos/lint/build, testes unitários críticos, E2E e regressão visual foram preparados. Os resultados efetivamente executados e pendências de entrega ficam em `docs/05-VALIDACAO.md`. Lighthouse produz doze relatórios e medianas no build otimizado. Publicação/repositório precisam registrar suas URLs reais; a existência de configuração não comprova deploy.

ESLint aplica complexidade máxima 9 e funções de até 50 linhas no código de `src`. A tela inicial também mostra um estado de carregamento enquanto MSW e sessão são preparados, evitando uma página vazia. A altura mínima do conteúdo mantém o rodapé fora da área visível durante a resolução das rotas, reduzindo CLS.

A detecção de classes do Tailwind é limitada aos arquivos TS/TSX em `src` e ao `index.html`, usando fontes explícitas. Relatórios e cópias temporárias não alteram o CSS gerado. Referência: [detecção de fontes do Tailwind](https://tailwindcss.com/docs/detecting-classes-in-source-files).
