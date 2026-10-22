# Validação e pendências da entrega

Validação local atualizada em 22/10/2026, versão 1.0.0. Os fluxos usam o build otimizado, MSW, Axios e o cliente real Socket.IO, com os mesmos dados e recursos disponíveis na demonstração.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| TypeScript, lint e build | Aprovados; lint aplica complexidade máxima 9 e funções de até 50 linhas em src |
| Playwright após limpeza dos textos | 23 aprovados e um caso que excedeu a espera de confirmação; o mesmo caso passou isoladamente, sem mudar o código. Escopo: conta, migração de descrição antiga, checkout, compra, falhas, expiração e visual de detalhe em desktop/mobile |
| Playwright após seleção automática de carteira | 20 aprovados em desktop/mobile, sem falhas ou casos ignorados: checkout, compra, recusa, idempotência, Socket.IO, recuperação, expiração e visual de pagamento |
| Testes unitários na validação anterior | 17 aprovados: precisão em wei, decimais inválidos, contratos e dados de carteira do checkout |
| Playwright na validação anterior do rodapé | 29 aprovados, zero falhas e um caso ignorado intencionalmente; escopo: footer, purchase, visual e layout em desktop/mobile |
| Regressão geral anterior | 46 aprovados, uma falha no teste de avatar mobile e um caso ignorado intencionalmente; o caso de avatar passou na repetição isolada |
| Regressão visual | Duas baselines de detalhe atualizadas após limpar os textos; pagamento pertence à validação anterior de seleção automática, e início/carrinho à validação anterior do rodapé |
| Responsividade | Nove telas verificadas em 390, 768 e 1440 px; também 720 px para reflow equivalente a zoom de 200% |
| Instalação limpa anterior | npm ci offline em diretório separado, sem node_modules preexistente, seguido de build aprovado; não repetido nas correções de checkout e rodapé |
| Reprodução do build anterior | index.html da cópia limpa e do workspace com SHA-256 idêntico antes das correções de checkout e rodapé |

O caso ignorado nas execuções anteriores pertence ao projeto mobile e evita duplicar a matriz que já percorre todos os tamanhos no projeto desktop. Não há fluxo ignorado por falha. O teste de matriz inclui carrinho e checkout com itens e o recibo de um pedido confirmado. A execução atual foi focada e não incluiu essa matriz.

Evidências atuais da limpeza de textos: [relatório HTML](../reports/interface-copy/index.html), [resultado JSON](../reports/interface-copy/results.json), [recibo desktop](../reports/interface-copy/recibo-desktop.png) e [recibo mobile](../reports/interface-copy/recibo-mobile.png). O caso de dados de carteira no desktop permaneceu pendente além dos dez segundos esperados na primeira execução; passou na repetição isolada, sem mudanças. A causa não foi confirmada e o relatório preserva a falha original.

Evidências anteriores de seleção automática: [relatório HTML](../reports/wallet-selection/index.html) e [resultado JSON](../reports/wallet-selection/results.json). Evidências da correção anterior do rodapé: [relatório HTML](../reports/footer/index.html), [resultado JSON](../reports/footer/results.json), [captura desktop](../reports/footer/rodape-desktop.png) e [captura mobile](../reports/footer/rodape-mobile.png). O relatório geral anterior está em [HTML E2E](../reports/e2e/index.html) e [JSON E2E](../reports/e2e/results.json). As baselines ficam em `tests/e2e/visual.spec.ts-snapshots`. Traces e screenshots são preservados automaticamente quando há falha.

Na regressão geral anterior, `account.spec.ts` falhou no mobile ao verificar o avatar após salvar e recarregar o perfil. A repetição isolada passou sem alterações de código. A causa ainda não foi confirmada; a leitura assíncrona do arquivo antes de salvar é um ponto a investigar. O relatório anterior preserva a falha original. O upload de avatar não foi alterado nem reexecutado nesta correção do rodapé.

Na correção anterior de checkout, `checkout.spec.ts` passou em desktop e mobile, verificando os campos do Figma, carteiras e confirmação abaixo do total, restauração de foco da revisão, validação de endereço, persistência após refresh, reconexão após mudar a rede e snapshot do pedido sem alterar as carteiras cadastradas.

No ajuste atual, selecionar uma carteira já vale como conexão simulada. O teste da principal avança diretamente à revisão; o novo teste cadastra uma secundária, seleciona, recarrega e confirma a compra usando essa carteira. Alterar rede ou provider não exige um botão extra. Endereços inválidos continuam bloqueados, e o pedido preserva os dados escolhidos. O resumo contém apenas o botão Confirmar compra, mantém o link de gerenciamento e não exibe o aviso de demonstração. Compra recusada, timeout, cliques repetidos, cotação alterada, pedido pendente e expiração continuam verificados sem a etapa manual de conectar.

No ajuste do rodapé, `footer.spec.ts` verifica navegação das quatro telas de conta existentes, cinco categorias com limpeza dos filtros anteriores, ajuda e redes sociais sem links, feedback de newsletter indisponível, ausência do painel nas páginas do marketplace e configuração/reset/reconexão em `/demonstracao`. `purchase.spec.ts` mantém compra, recusa, idempotência, Socket.IO e recuperação de pedido pendente; `layout.spec.ts` mantém a matriz de tamanhos, expiração e foco. As capturas isoladas do rodapé ocultam apenas os elementos fixos externos ao componente; os oito snapshots de página mantêm a interface completa.

O teste novo de migração insere a descrição antiga no estado persistido e confirma após refresh que o texto foi limpo, a conta segue autenticada e o carrinho mantém o item. O recibo é verificado sem referências à simulação nem botão de exploração, mantendo o snapshot de valores e o link Continuar explorando. As instruções para publicação manual estão em `docs/06-PUBLICACAO.md` e no README.

Hash do index.html atual: `560E61BED39C28DC93EA7CC272D97033F5A6E44CD8EC4C93D0AB5762679E07EE`. Hash reproduzido na instalação limpa anterior às correções: `D4F9A504FAB5F9AA52555C3B1BEF39201D6878A3B04DFDBD43A546A1211F9DEE`.

## Cobertura dos grupos do enunciado

| Grupo | Evidência |
| --- | --- |
| 1 — Busca/filtros/histórico | catalog.spec.ts: parâmetros combinados, ordenação, página e histórico |
| 2 — Detalhe | Acesso direto, inexistente, quantidade e edição esgotada |
| 3 — Conta/sessão | Cadastro, conflito, recuperação, troca de usuário e expiração |
| 4 — Favoritos | Persistência, isolamento, atualização otimista e rollback |
| 5 — Carrinho | Quantidade, remoção, cupom, refresh e mesclagem no login |
| 6 — Compra | Revisão, confirmação e recibo com snapshot imutável |
| 7 — Falhas/idempotência | Recusa, cliques repetidos, timeout e recuperação após refresh |
| 8 — Perfil/carteiras | Avatar, dados, senha, validação e persistência |
| 9 — Tempo real | Preço via Socket.IO atualiza resumo e bloqueia cotação antiga |
| 10 — Reconciliação | Duplicatas/antigos, desconexão e retomada de pedido pendente |
| 11 — Acessibilidade | Contenção/restauração de foco, Escape, Tab e erros associados |
| 12 — Estado assíncrono | Skeleton, respostas fora de ordem, vazio, erro e recuperação |

Testes adicionais de contrato verificam conflito de idempotência com outro payload, propriedade de pedidos, isolamento de requisições de visitante e preservação de uma linha removida e adicionada novamente durante um pedido pendente. O teste de expiração usa relógio fixado e avança 31 minutos, verificando a retomada dos dados editados no checkout.

## Lighthouse

Medianas de três execuções por página/perfil, no build otimizado anterior à reorganização do checkout e do rodapé. Lighthouse não foi repetido nessas correções:

| Página / perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início / mobile | 89 | 100 | 100 | 100 | 3,561 s | 0 | 25 ms |
| Início / desktop | 99 | 100 | 100 | 100 | 0,823 s | 0,0082 | 0 ms |
| Detalhe / mobile | 90 | 100 | 100 | 100 | 3,566 s | 0,0137 | 25 ms |
| Detalhe / desktop | 99 | 100 | 100 | 100 | 0,853 s | 0,0026 | 0 ms |

**LH-03 parcialmente atendido:** o início mobile ficou um ponto abaixo da meta de Performance 90. As demais medianas atendem às metas. Os relatórios mostram como restrição a cadeia de carregamento inicial: bundle de entrada, inicialização do MSW, módulos da aplicação, sessão e recursos do catálogo. O LCP mediano de 3,561 s sob Slow 4G limita a pontuação; CLS é zero e TBT é 25 ms nessa página. O custo de bootstrap dos mocks permanece na entrega. As execuções individuais variam e estão integralmente registradas, sem selecionar apenas o melhor resultado.

Configuração reproduzível: `scripts/lighthouse.mjs`. Relatórios completos em [audit-results](../audit-results/summary.json). São três execuções por rota (`/` e `/nft/nft-1`) e perfil, com cenário padrão, assets reais e mocks habilitados. Nenhuma funcionalidade é removida para a auditoria.

## Ambiente

- Node.js 22.20.0; npm 10.9.3; Windows, kernel 10.0.26200; AMD Ryzen 7 5700X.
- React 19.3.1, TypeScript 6.0.3, Vite 8.3.4 e Tailwind CSS 4.3.3; demais versões fixadas no lockfile.
- Playwright 1.64.1, Chromium 156.0.8078.4 e Lighthouse 13.5.0.
- E2E no preview otimizado em 127.0.0.1:4182; Lighthouse em 127.0.0.1:4181.
- npm informou zero vulnerabilidades na instalação das dependências. A instalação limpa usou o mesmo lockfile e o cache local.

## Pendências e limites

1. **Repositório remoto:** o autor optou por criar e publicar o repositório pelo próprio login. Nenhum repositório foi criado e nenhum push foi realizado pelo agente. O passo a passo está em `docs/06-PUBLICACAO.md`.
2. **Deploy:** configuração Vercel preparada para importação manual pelo autor, mas ainda sem URL pública. ENT-02 e ENT-03 dependem da publicação e de smoke tests nas rotas e nos eventos do ambiente publicado.
3. **Fidelidade visual:** implementação baseada na exportação rasterizada fornecida. A fonte original e os tokens estruturados não estavam disponíveis. Proporções e tokens foram aproximados; não se declara fidelidade pixel a pixel. As substituições estão em ARCHITECTURE.
4. **Escopo da simulação:** persistência local ao navegador, transporte textual do namespace padrão Socket.IO e credenciais fictícias. Não há pagamentos, autenticação de produção ou blockchain reais.
5. **Performance:** início mobile com mediana 89, diante da meta 90. As evidências e a causa observada estão descritas acima.

Os testes locais e a configuração de hospedagem não comprovam publicação. A versão remota deverá corresponder a estes fontes, com identificação do commit e verificação de acesso direto, refresh, compra simulada e Socket.IO.
