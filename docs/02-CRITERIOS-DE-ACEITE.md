# Critérios de aceite do marketplace de NFTs

Base: enunciado `Desafio Frontend — Marketplace de NFT.txt`, fornecido em `C:/Users/pedro/Downloads`, e [arquivo Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1&p=f). Mapeamento realizado em 21/10/2026.

Os critérios abaixo são a referência de aceite definida no planejamento. O estado atual, as evidências executadas e as pendências estão em [validação da entrega](05-VALIDACAO.md). “E2E 1” a “E2E 12” correspondem aos grupos de teste da seção 9 do enunciado; critérios adicionais complementam esses grupos.

Cada evidência deve ser reproduzível a partir de um checkout limpo. Testes observam a interface e os resultados; REST passa por Axios/handlers MSW e tempo real passa por socket.io-client e pela simulação compatível com Socket.IO.

## Catálogo e detalhes

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| CAT-01 | Início apresenta destaques, catálogo e navegação ao detalhe, seguindo os frames de desktop/mobile | Inspeção e E2E 1/2 |
| CAT-02 | Busca, filtros combinados, ordenação e página são representados na URL e enviados à API | E2E 1 com resultado compatível com os parâmetros |
| CAT-03 | Refresh e voltar/avançar restauram os parâmetros e resultados correspondentes | E2E 1 |
| CAT-04 | Alterar filtro reinicia a paginação sem descartar os demais filtros válidos | E2E 1 |
| CAT-05 | Resposta antiga de uma busca/filtro não substitui o resultado mais recente | E2E 1/12 com latências controladas |
| CAT-06 | Resultado vazio, falha e recuperação por nova tentativa têm feedback próprio | E2E 1/12 |
| DET-01 | Acesso direto ao identificador carrega o NFT; identificador inexistente apresenta estado de não encontrado | E2E 2 |
| DET-02 | Galeria, informações, edição, quantidade, favorito e compra são operáveis | E2E 2/4/5 |
| DET-03 | Quantidade aceita apenas inteiros válidos, respeitando mínimo e disponibilidade da edição | E2E 5 com valores inválidos e limites |
| DET-04 | Edição indisponível não pode ser comprada; API também rejeita a tentativa inválida | E2E 5/9 |
| FAV-01 | Favoritos exigem autenticação, persistem após refresh e são isolados por usuário | E2E 3/4 |
| FAV-02 | Pelo menos uma interação é otimista; proposta: favoritar, com rollback e feedback em falha | E2E 4 com mutation recusada |

## Carrinho e cotação

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| CAR-01 | Adicionar, alterar e remover identifica corretamente NFT e edição e respeita disponibilidade | E2E 5 |
| CAR-02 | Carrinho persiste após refresh e os itens do visitante são preservados ao autenticar | E2E 5; política de mesclagem documentada |
| CAR-03 | Cupom pode ser aplicado/removido; código inválido e expirado não concedem desconto | E2E 5/12 |
| CAR-04 | Subtotal, desconto, taxa e total exibidos correspondem à cotação retornada pela API | E2E 5/6 |
| CAR-05 | Valores em ETH trafegam como strings decimais e preservam precisão; quantidades são inteiras | Verificação de contrato e testes de cálculo/limites |
| CAR-06 | Alteração de preço/estoque via Socket.IO informa a mudança e atualiza itens/resumo ativos | E2E 9 |
| CAR-07 | Falha de consulta/mutation preserva estado recuperável; carrinho vazio oferece continuidade de navegação | E2E 5/12 |

## Pagamento e pedidos

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| PED-01 | Checkout exige sessão válida e preserva contexto quando solicita login | E2E 3/6 |
| PED-02 | Campos do layout são validados no cliente e na API; erros ficam associados aos campos | E2E 6/8/11 |
| PED-03 | Carteiras cadastradas aparecem no checkout, com rede e conexão simulada, recusa e desconexão | E2E 6/7/8 |
| PED-04 | Usuário revisa dados, itens e valores antes do envio, inclusive em mobile | E2E 6 e inspeção |
| PED-05 | Antes de confirmar, API revalida preço, disponibilidade, cupom e taxas | E2E 6/9 |
| PED-06 | Mudança na cotação bloqueia confirmação anterior e exige nova confirmação explícita | E2E 9 com preço e disponibilidade alterados |
| PED-07 | Clique repetido ou retry após timeout não cria outra compra: a tentativa reutiliza chave de idempotência | E2E 7 |
| PED-08 | Mesma chave e mesmo conteúdo recuperam o mesmo pedido; mesma chave com conteúdo diferente gera conflito | E2E 7 e teste de contrato |
| PED-09 | Pendente, confirmado e recusado têm estados distintos; apenas confirmação da simulação habilita o recibo de sucesso | E2E 6/7/10 |
| PED-10 | Refresh ou reconexão recupera pedido pendente sem criar nova compra | E2E 7/10 |
| PED-11 | Confirmado e recusado são terminais; evento atrasado não os regride | E2E 10 |
| PED-12 | Falha preserva itens; confirmação remove somente os itens e quantidades efetivamente comprados | E2E 6/7, incluindo mudança concorrente no carrinho |
| PED-13 | Recibo usa snapshot do pedido: mudar o catálogo depois não altera itens, preços, taxas ou total históricos | E2E 6/9 |
| PED-14 | Acesso direto ao pedido valida existência e propriedade; outro usuário não lê recibo privado | E2E 3/6 e validação da API simulada |
| PED-15 | Recibo contém identificação, itens, quantidades, taxas e total; referências e links de transação indicam simulação | E2E 6 e inspeção desktop/mobile |

## Sessão e conta

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| CON-01 | Cadastro, login, consulta da sessão e logout funcionam via API simulada | E2E 3 |
| CON-02 | Cadastro trata campos inválidos, confirmação de senha e conflito de conta | E2E 3/8 |
| CON-03 | Sessão é recuperada após refresh; rotas privadas aguardam sua resolução corretamente | E2E 3 |
| CON-04 | Expiração durante navegação e checkout preserva contexto para retomada após autenticação | E2E 3/7 |
| CON-05 | Logout/troca de usuário limpa cache privado, listeners e subscriptions da sessão anterior | E2E 3/10 |
| CON-06 | Checkout, perfil, carteiras, favoritos e pedidos exigem autenticação também na camada simulada | E2E 3 com acessos não autorizados |
| CON-07 | Perfil permite editar dados e avatar; validações/API e persistência são observáveis após refresh | E2E 8 |
| CON-08 | Alteração de senha valida senha atual e nova confirmação e persiste a mudança na simulação | E2E 8, sem senha em claro no armazenamento |
| CON-09 | Carteiras principal/secundária permitem cadastro/edição, validação, persistência e uso no checkout | E2E 8/6 |
| CON-10 | Apenas credenciais fictícias; nenhum segredo, senha em claro ou dado privado aparece nos logs | Revisão de armazenamento, fixtures e logs |

## Integração e estado assíncrono

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| INT-01 | React, TypeScript, TanStack Router/Query, Axios, REST, Socket.IO, Tailwind, shadcn/ui, MSW, Playwright e Lighthouse participam efetivamente | Código, execução e documentação |
| INT-02 | Router trata rotas, parâmetros de busca, proteção, acesso direto e rota inexistente | E2E 1/2/3 e acesso direto publicado |
| INT-03 | Query gerencia consultas, mutations e sincronização; todas as chamadas REST usam Axios | Revisão de integração e cenários E2E |
| INT-04 | Contratos são tipados entre transporte, estado e UI, com validação nas fronteiras externas | Typecheck e testes de contrato relevantes |
| INT-05 | Loading, vazio, erro, sucesso e atualização em segundo plano têm tratamento consistente | E2E 12 e inspeção |
| INT-06 | Mutations/eventos invalidam ou atualizam o cache coerentemente; dados são isolados por usuário e parâmetros | E2E 1/3/9/10 |
| INT-07 | Consultas obsoletas são canceladas/descartadas; recuperação não duplica operações | E2E 1/7/12 |
| INT-08 | Política de cache, retries, sincronização e rollback é documentada | ARCHITECTURE e correspondência com o código |
| API-01 | Contratos documentam sessão, NFTs, favoritos, carrinho, cotação, pedidos, perfil e carteiras | Documento de contratos e handlers correspondentes |
| API-02 | Respostas distinguem validação, sessão inválida, permissão, inexistência, conflito e falha transitória | Cenários reproduzíveis e testes de contrato |

## Mocks e tempo real

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| MOC-01 | Respostas fictícias e regras da simulação ficam nos mocks de rede; não em componentes/hooks/Axios | Revisão da separação e execução com MSW |
| MOC-02 | Desenvolvimento, demonstração e testes reutilizam contratos/cenários e estado consistente | Execução dos mesmos cenários nos ambientes |
| MOC-03 | Persistência sustenta refresh; reset restaura integralmente um estado conhecido, incluindo pedidos e sessão | E2E isolados e comando de reset |
| MOC-04 | Fixtures incluem pelo menos dois usuários e variedade para filtros/paginação | E2E 1/3 |
| MOC-05 | Cenários configuráveis incluem sucesso/vazio, lentidão, respostas fora de ordem, falha de conexão e 4xx/5xx | E2E 1/12 |
| MOC-06 | Cenários incluem sessão expirada/não autorizado, conflitos de cadastro/formulário e cupons inválidos/expirados | E2E 3/5/8 |
| MOC-07 | Cenários incluem preço alterado, edição esgotada, timeout após criação, pagamento confirmado e recusado | E2E 6/7/9/10 |
| MOC-08 | MSW simula eventos com integração compatível com Socket.IO; eventos passam pelo socket.io-client | E2E 9/10 e documentação do transporte/limitações |
| MOC-09 | Mocks são ativados por configuração e funcionam no build publicado; REST e eventos refletem os mesmos dados | Preview/deploy e E2E de demonstração |
| RT-01 | nft.updated atualiza preço/disponibilidade no catálogo, detalhe e carrinho ativos | E2E 9 |
| RT-02 | order.updated atualiza o pedido e apresenta confirmação ou recusa coerente | E2E 6/7/10 |
| RT-03 | Eventos contêm identidade estável, recurso e versão; duplicatas/antigos não reaplicam efeitos nem regridem estado | E2E 10 |
| RT-04 | Reconexão reconcilia recursos ativos via REST | E2E 10 com alterações durante desconexão |
| RT-05 | Eventos da sessão anterior não afetam outro usuário; listeners são liberados no fim do ciclo de vida | E2E 3/10 |
| RT-06 | NFT no carrinho muda durante navegação, usuário recebe aviso, resumo atualiza e cotação antiga não finaliza compra | E2E 9 cobrindo a sequência completa |
| RT-07 | Interrupção enquanto pedido está pendente permite recuperação após reconectar ou recarregar | E2E 10 |

## Visual, responsividade e acessibilidade

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| VIS-01 | Implementar os quinze frames, preservando tipografia, cores, imagens, hierarquia, composição e proporções | Comparação com Figma e inspeção |
| VIS-02 | Todas as nove telas funcionam em 390, 768 e 1440 px; perfil/carteiras/recibo têm adaptação mobile | Matriz de inspeção por tela e viewport |
| VIS-03 | Skeletons com shimmer cobrem catálogo, detalhe e resumo sem deslocamentos indevidos e respeitam movimento reduzido | E2E 12, reduced motion e medição de CLS |
| VIS-04 | Assets/fontes necessários estão acessíveis localmente; substituições e desvios são documentados | Build local e ARCHITECTURE |
| VIS-05 | Início, detalhe, carrinho e pagamento possuem baselines estáveis e versionadas | Regressão visual Playwright desktop/mobile |
| A11Y-01 | Fluxos são operáveis por teclado com foco visível | E2E 11 |
| A11Y-02 | Diálogos/drawers têm foco inicial, contenção, fechamento e restauração apropriados | E2E 11 |
| A11Y-03 | Semântica, labels, nomes de ícones e erros associados aos campos são verificáveis | E2E 11 e inspeção |
| A11Y-04 | Imagens relevantes têm alternativas; contraste é legível e estados não dependem apenas de cor | Auditoria e inspeção |
| A11Y-05 | Mutations e mudanças em tempo real fornecem feedback acessível sem deslocar foco indevidamente | E2E 9/11 |
| A11Y-06 | Não há overflow horizontal indevido nem perda de conteúdo com zoom | Inspeção em viewports e zoom |

## Testes e auditoria

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| QA-01 | Os doze grupos E2E da seção 9 são executáveis com mocks, incluindo caminhos de falha | Suite Playwright |
| QA-02 | Fluxos principais rodam em Chromium desktop/mobile; cada teste começa em estado isolado | Configuração e relatório |
| QA-03 | Relógio, latência e disparo de eventos são controlados nos cenários sensíveis ao tempo | Fixtures/configuração dos testes |
| QA-04 | Relatório HTML e traces de falhas são gerados | Artifacts da execução |
| LH-01 | Início/detalhe são auditados no build otimizado, mobile/desktop, no cenário padrão com imagens/fontes/funcionalidades reais da entrega | Configuração Lighthouse versionada |
| LH-02 | Três medições por página/perfil: doze execuções; reportar medianas por categoria | Relatórios HTML/JSON e resumo de resultados |
| LH-03 | Metas: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 90 | Resultados medidos, sem antecipar aprovação |
| LH-04 | Registrar LCP, CLS, TBT, versões, ambiente e condições; justificar resultados abaixo das metas | Relatório de auditoria com causas |

## Entrega e deploy

| ID | Critério verificável | Evidência prevista |
| --- | --- | --- |
| ENT-01 | Entregar código, lockfile, assets, mocks, fixtures, testes e configuração de auditoria | Checkout limpo |
| ENT-02 | Repositório e URL pública correspondem à mesma versão entregue e ficam acessíveis na avaliação | Identificação da versão e smoke test publicado |
| ENT-03 | Deploy preserva mocks/tempo real, acesso direto e refresh das rotas | Smoke test de rotas, checkout e eventos |
| ENT-04 | README contém setup, env vars, credenciais fictícias, cenários/reset, comandos e reprodução de falhas | Execução seguindo o README |
| ENT-05 | ARCHITECTURE contém REST/eventos, sessão, carrinho, cache, reconciliação, limitações e desvios do Figma | Revisão da documentação |
| ENT-06 | Comandos cobrem dev com mocks, build, preview, typecheck, lint, Playwright e Lighthouse | Execução documentada |
| ENT-07 | Checkout limpo executa sem backend de produção ou serviços privados | Validação em ambiente limpo |
| ENT-08 | Ações fora do escopo não aparentam sucesso funcional | Inspeção de navegação e ações auxiliares |

## Critérios eliminatórios

Não liberar a entrega se houver ausência de uso efetivo da stack obrigatória, fluxos principais apenas visuais, compra confirmada sem resposta da simulação, exposição de dados entre usuários, eventos simulados diretamente na UI ou ausência de E2E executáveis.

## Peso da avaliação

| Critério do enunciado | Pontos | Evidências deste mapeamento |
| --- | --- | --- |
| Fidelidade visual e responsividade | 20 | VIS e inventário de design |
| Fluxos e experiência de uso | 20 | CAT, DET, FAV, CAR, PED e CON |
| Integração e estado | 15 | INT e API |
| Tempo real | 10 | RT |
| Mocking | 10 | MOC |
| Testes | 10 | QA e evidências E2E |
| Acessibilidade | 5 | A11Y |
| Performance | 5 | LH |
| Arquitetura e documentação | 5 | INT-08, API, ENT |
| Total | 100 | Evidências e limites registrados em 05-VALIDACAO.md |

## Marcos de validação propostos

1. Validar compatibilidade MSW/Socket.IO no build de demonstração e idempotência/recuperação do pedido.
2. Consolidar tokens/assets e entregar catálogo, detalhe e carrinho integrados, com testes correspondentes.
3. Concluir sessão, favoritos, perfil e carteiras, verificando isolamento de usuários.
4. Concluir checkout/recibo e cenários de falha, revalidação e reconexão.
5. Fechar regressão visual, acessibilidade, Lighthouse, documentação e deploy.

Os testes acompanham cada marco. O conjunto completo precisa passar antes da entrega, e as metas de auditoria dependem de medição.
