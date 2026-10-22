# Decisões e pendências antes da implementação

Este registro separa exigências confirmadas, propostas de UX e pontos que ainda precisam de definição. Nenhuma pendência autoriza ampliar o escopo para integrações reais. Referências: [design](01-MAPEAMENTO-DO-DESIGN.md) e [critérios de aceite](02-CRITERIOS-DE-ACEITE.md).

**Registro histórico da etapa de planejamento.** Depois da autorização para desenvolver, a exportação local fornecida substituiu o acesso ao plugin Figma. As decisões adotadas estão em [ARCHITECTURE](../ARCHITECTURE.md) e [contratos](04-CONTRATOS.md); resultados e pendências atuais estão em [validação](05-VALIDACAO.md). As propostas abaixo permanecem como histórico, sem representar confirmações individuais do usuário. A família original da fonte e os tokens estruturados continuam indisponíveis.

## Regras confirmadas pelo enunciado

- React/TypeScript e toda a stack obrigatória devem ser usados efetivamente.
- Autenticação, APIs, carteiras, pagamento e transações são simulados.
- Mocks ficam na camada de rede e devem funcionar no build de demonstração.
- Tempo real deve passar pelo socket.io-client; alterações diretas na UI não satisfazem o requisito.
- A cotação da API determina os valores da compra; preços desenhados não são contratos de dados.
- Pedidos exigem idempotência, recuperação e estados terminais.
- Dados privados e eventos são isolados por usuário/sessão.
- Perfil, carteiras e confirmação precisam funcionar em mobile mesmo sem frame específico.
- Deploy público, testes, auditorias e documentação integram a entrega.

## Pendências de acesso e especificação visual

| ID | Pendência | Impacto | Próxima verificação |
| --- | --- | --- | --- |
| D-01 | Ações do plugin Figma não disponíveis nesta conversa, embora instalado | Impede extração estruturada nesta etapa | Verificar ferramentas de leitura quando a integração estiver disponível; não reinstalar sem necessidade |
| D-02 | Família/pesos/licença das fontes e arquivos locais | Afeta fidelidade, métricas de layout e performance | Inspecionar propriedades dos textos e disponibilidade dos arquivos |
| D-03 | Valores de cores, espaçamentos, radius, bordas, sombras e tamanhos de texto | Impede especificação numérica fiel dos tokens | Extrair propriedades de elementos representativos de desktop/mobile |
| D-04 | Exportação e inventário dos assets originais | Afeta execução local e regressão visual | Exportar imagens/vetores disponíveis e relacioná-los aos usos |
| D-05 | Variantes, componentes e variáveis publicados no arquivo | Evita recriar padrões que já existem | Inspecionar bibliotecas/instâncias e propriedades antes de codificar |

O inventário de telas e os critérios comportamentais já estão mapeados. A especificação visual numérica e os assets não estão concluídos; não declarar fidelidade pixel a pixel antes de resolver D-02 a D-04.

## Propostas de produto e UX para validação

| ID | Questão | Proposta | Justificativa |
| --- | --- | --- | --- |
| P-01 | Nome da página GreenMint versus marca KURIO nas telas | Usar KURIO na interface e explicar a referência no README | Preserva a marca visual observada |
| P-02 | Login/cadastro desktop em modal versus rotas diretas | Rotas de autenticação acessíveis diretamente, com apresentação modal sobre contexto quando iniciado na navegação | Atende acesso direto e retorno ao fluxo anterior |
| P-03 | Pagamento mobile não mostra todos os campos do desktop | Organizar dados, carteira/rede e revisão em etapas | Preserva o frame de seleção e os requisitos completos |
| P-04 | Perfil, carteiras e confirmação sem frame mobile | Uma coluna, navegação compacta e recibo fluido | Mantém todos os campos e conteúdo sem overflow |
| P-05 | Filtros mobile sem painel aberto inspecionado | Drawer acessível e parâmetros na URL | Compatível com o botão observado e filtros combináveis |
| P-06 | Google/Facebook, recuperação de senha e newsletter | Informar indisponibilidade para ações não implementadas; autenticação local simulada permanece funcional | Evita sugerir integração real ou sucesso fictício |
| P-07 | Links editoriais, suporte, atividade, ofertas e downloads | Preservar identidade visual quando pertinente, com destino válido conhecido ou indicação de fora do escopo | Links do layout não autorizam novas páginas funcionais |
| P-08 | Texto de propriedade em blockchain e botão Etherscan no recibo | Identificar transação simulada e não encaminhar um hash inventado como transação real | O enunciado exclui blockchain e exploração reais |
| P-09 | Ação Comprar no detalhe | Adicionar a seleção válida ao carrinho e encaminhar ao fluxo de compra, preservando contexto para login | Unifica regras de estoque, cotação e pedido |
| P-10 | Listas de recomendações, slides e abas de avaliações | Usar dados da API simulada e navegação coerente; não criar publicação de avaliações | Atende a composição sem ampliar negócio |

As propostas não são decisões confirmadas do usuário. Devem ser consolidadas antes de implementar o fluxo afetado; ajustes visuais necessários ficam documentados em ARCHITECTURE.

## Regras de negócio ainda não especificadas

| ID | Definição necessária | O que já se sabe | Direção proposta para discussão |
| --- | --- | --- | --- |
| R-01 | Campos obrigatórios, formatos e limites de cada formulário | O layout marca campos com asterisco, inclusive ENS e indicação; o enunciado pede validação | Inventariar cada regra em contrato; esclarecer se ENS/indicação são obrigatórios ou opcionais |
| R-02 | Mesclagem entre carrinho visitante e autenticado | Deve preservar itens do visitante e respeitar disponibilidade | Mesclar por NFT/edição, somar quantidades dentro do estoque e avisar ajustes/conflitos |
| R-03 | Modelo de edições e disponibilidade | Há edições diferentes e quantidades limitadas | Especificar estoque e preço por edição; não inferir semântica apenas dos labels 1/1, 1/10, 1/50 e aberta |
| R-04 | Validade e identificação da cotação | Cotação antiga não pode confirmar compra | Definir identidade/versão e expiração da cotação no contrato, sem inventar duração nesta etapa |
| R-05 | Senhas e avatar | Senhas não podem ser armazenadas em claro; avatar precisa de validação e persistência | Definir política de senha e formatos/tamanho do avatar; limitar persistência a dados fictícios |
| R-06 | Redes, tipos e endereços de carteira aceitos | Carteiras e conexão são simuladas e precisam de validação | Definir conjunto de redes/provedores e regras de endereço por rede |
| R-07 | Cupons, taxas e arredondamento | Strings decimais e valores coerentes com API são obrigatórios | Documentar fixtures, unidades exatas, casas de apresentação e regra de arredondamento |
| R-08 | Busca, filtros, ordenação e paginação | Devem combinar e persistir na URL | Definir parâmetros, valores aceitos, ordenação padrão e tamanho de página |
| R-09 | Favorito disparado por visitante | Favoritos são privados | Encaminhar para login e definir se retoma automaticamente a intenção ou solicita novo clique |

## Riscos a validar cedo

1. Compatibilidade do transporte Socket.IO com MSW no navegador e no build publicado, incluindo reconexão. A menção ao binding no enunciado não comprova compatibilidade de versões.
2. Persistência e reset de pedidos, chaves de idempotência, sessão e cenários sem deixar estado residual entre testes.
3. Sincronização de estoque/preço/cotação por REST e eventos sem regressão por respostas atrasadas.
4. Logout/troca de usuário durante requests ou eventos, evitando exposição de dados da sessão anterior.
5. Recuperação de compra cujo pedido foi criado, mas a resposta HTTP não chegou ao cliente.
6. Fontes e imagens locais preservando fidelidade e metas de performance, sem otimizações exclusivas para auditoria.

## Resultado desta etapa

- Inventário dos quinze frames e lacunas de mobile/tablet registrado.
- Composição das nove telas e componentes reutilizáveis propostos.
- Critérios de aceite relacionados a cenários e evidências de teste.
- Limites de escopo, propostas e pendências explicitados.
- Extração numérica de tokens, exportação de assets e confirmação das regras ambíguas ainda pendentes.
- Nenhum código de aplicação, pacote, mock, teste ou deploy foi criado.
