# Mapeamento do design do marketplace de NFTs

Referência: [Frontend Challenge no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1&p=f). Inspeção realizada em 21/10/2026.

Este mapeamento prepara a implementação dos fluxos de descoberta, compra e conta. O Figma orienta a composição visual; o enunciado define o comportamento e o escopo. Nenhuma aplicação foi implementada nesta etapa.

## Evidências e limites da inspeção

- Arquivo confirmado: `Frontend Challenge`.
- Página confirmada: `Marketplace de NFTs GreenMint`.
- Marca visível nas interfaces: `KURIO`, com menções a `Kurio` nos textos.
- Foram identificados e examinados visualmente nove frames desktop e seis mobile.
- A tela `Desktop / Início` exibe largura de 1440 e altura de 3668 no canvas. Isso não define altura fixa para a aplicação.
- O plugin Figma está instalado, mas suas ações de leitura não foram disponibilizadas entre as ferramentas desta conversa. A inspeção utilizou o navegador e a visualização pública.
- A sessão pública solicita cadastro/login para inspeção detalhada e apresentação. Valores exatos de tokens, famílias de fontes, propriedades de componentes e arquivos exportáveis permanecem pendentes. Nenhum hexadecimal, tamanho de fonte ou breakpoint foi deduzido como especificação oficial.

## Inventário de telas

Os nomes abaixo reproduzem os nomes dos frames. “Adaptação necessária” significa ausência de frame correspondente, não ausência da funcionalidade no escopo.

| Tela | Frame desktop | Frame mobile | Tratamento previsto |
| --- | --- | --- | --- |
| Início | Desktop / Início | Mobile / Início | Composições distintas, com o mesmo catálogo e estado de filtros |
| Detalhe | Desktop / Detalhes do NFT | Mobile / Detalhes do NFT | Galeria e compra adaptadas ao espaço disponível |
| Carrinho | Desktop / Carrinho de NFTs | Mobile / Carrinho de NFTs | Tabela desktop e itens empilhados mobile |
| Pagamento | Desktop / Pagamento | Mobile / Pagamento | Dados, carteira, rede, revisão e envio em ambos |
| Confirmação | Desktop / Confirmação de Pedido | Ausente | Adaptação necessária do recibo |
| Login | Desktop / Login | Mobile / Login | Modal desktop e tela dedicada mobile |
| Cadastro | Desktop / Cadastro | Mobile / Cadastro | Modal desktop e tela dedicada mobile |
| Perfil | Desktop / Perfil do Colecionador | Ausente | Adaptação necessária do formulário e navegação |
| Carteiras | Desktop / Carteiras | Ausente | Adaptação necessária de formulários e seleção |

Não há frame tablet entre os quinze frames listados. O comportamento em 768 px deve ser definido e verificado durante a implementação.

## Identidade visual observada

| Elemento | Observação confirmada | Aplicação no projeto |
| --- | --- | --- |
| Marca | KURIO no header e na autenticação mobile | Preservar a marca visível até resolver a diferença com GreenMint |
| Fundos | Superfícies muito escuras em tons marrons | Mapear tokens de fundo, superfície e superfície elevada |
| Destaques | Botões e detalhes em laranja/dourado | Mapear ação principal, estado ativo e foco acessível |
| Texto | Texto claro e texto secundário mais discreto | Medir contraste antes de consolidar os tokens |
| Tipografia | Aparência monoespaçada em títulos e textos observados | Confirmar família, pesos e licença; não escolher fonte por semelhança |
| Imagens | Retratos ilustrados de primatas usados no hero, galeria e cards | Inventariar e exportar os assets originais |
| Formas | Cards e imagens com cantos arredondados; CTAs mobile mais arredondados | Preservar diferenças observadas entre composições |
| Divisores | Linhas discretas separando informações e seções | Usar tokens compartilhados após inspeção dos valores |

Os nomes de tokens acima representam uma organização proposta; não são nomes de variáveis confirmados no Figma.

## Composição por tela

### Início

Desktop observado:

- Header com marca, links Início/Mercado/Criadores/Aprenda, busca, carrinho e Entrar.
- Hero com título, texto de apoio, CTA Explorar, imagem de destaque e indicadores de slides.
- Área de catálogo com sidebar de coleções, contagens e faixa de preço; o trecho inferior também mostra filtro de rede.
- Abas Todos os NFTs, Novos lançamentos e Em alta, além de ordenação.
- Grid com imagem, nome e preço; alguns cards exibem preço anterior ou destaque de raridade.
- Na árvore de camadas do frame, os grupos principais se chamam Top, Products, Promos, Blog e Footer.

Mobile observado:

- Busca no topo, botão de filtros, hero compacto, abas e grid de duas colunas.
- Cards com ação de favorito e navegação inferior por ícones.

Complementos funcionais: filtros combináveis, paginação, URL compartilhável, skeleton, vazio, erro e atualização em segundo plano. A representação da paginação e o conteúdo do painel mobile de filtros precisam de especificação visual complementar.

### Detalhes do NFT

Desktop observado:

- Header, breadcrumb, galeria com miniaturas e imagem principal.
- Nome, preço em ETH, avaliação, descrição, seleção de edição, quantidade, Comprar e Favoritar.
- Metadados, compartilhamento, abas de detalhes/avaliações e seção de outros NFTs.

Mobile observado:

- Voltar e favorito no topo, imagem principal, título, avaliação, descrição e opções de edição em coluna.

Complementos funcionais: acesso direto, NFT inexistente, edição indisponível, limite inteiro de quantidade e falha ao favoritar. Avaliações e compartilhamento são elementos visuais observados; criação de avaliação não é exigida.

### Carrinho de NFTs

Desktop observado:

- Tabela de itens com imagem, nome, identificação, preço, edição/quantidade, total e remoção.
- Coluna de resumo com código promocional, Aplicar, subtotal, desconto, taxa de rede, total e Conectar e finalizar.
- Link para continuar explorando e seção de recomendações.

Mobile observado:

- Voltar, título, cards empilhados de itens, controles de quantidade, cupom, valores e CTA inferior.

Complementos funcionais: vazio, persistência, mesclagem ao autenticar, cupom inválido/expirado e avisos de preço/estoque. Os valores desenhados são exemplos visuais, não regras de cálculo ou preços obrigatórios das fixtures.

### Pagamento

Desktop observado:

- Formulário do colecionador à esquerda e itens/resumo/seleção de carteira à direita.
- Labels observadas: nome de exibição, nome de usuário, rede, nome do perfil, endereço da carteira, ENS ou carteira secundária opcional, tipo de carteira, código de indicação, e-mail e nome ENS.
- Opção Usar outra carteira e observação opcional do colecionador.
- Seleção de provedores com referências a WalletConnect, MetaMask e Coinbase Wallet.
- CTA Confirmar compra.

Mobile observado:

- Título Pagamento com carteira, seleção entre carteiras cadastradas, Trocar carteira, opções de provedor, total e Confirmar compra.
- O frame mobile inspecionado não apresenta o formulário completo do desktop.

Complementos funcionais: etapa de dados e revisão no mobile; conexão simulada, recusa e desconexão; revalidação da cotação e confirmação renovada quando houver mudanças. Não integrar extensões de carteira ou blockchain.

Labels e asteriscos não bastam para estabelecer limites, formatos e regras de negócio. As ambiguidades estão registradas no documento de decisões.

### Confirmação de pedido

- Composição central em formato de recibo, com ícone de agradecimento e ação de fechar.
- Identificação da transação, data, total, carteira, itens, quantidades/edições, taxa e total.
- Texto de confirmação e CTA Ver no Etherscan.

Complementos funcionais: recibo consultável por rota direta, acesso autorizado ao próprio pedido, snapshot imutável e estados pendente/recusado separados da confirmação. Identificação e exploração de transação devem ser explicitamente simuladas, inclusive quando o texto visual sugerir uma operação real.

### Login e cadastro

Desktop observado:

- Modais sobre a composição da página inicial, ação de fechar e alternância entre Entrar/Criar conta.
- Login: e-mail, senha, alternância de visibilidade da senha, Esqueceu a senha e Entrar.
- Cadastro: nome de usuário, e-mail, senha, confirmação de senha e Criar conta.
- Ambos mostram botões de Google e Facebook.

Mobile observado:

- Telas dedicadas com marca, formulário, botões sociais e link para alternar entre login e cadastro.

Complementos funcionais: labels acessíveis onde o desenho usa placeholder, erros de campo/API, conflito de cadastro, preservação da rota de retorno e controle de foco no modal. Login social e recuperação por e-mail não têm integração real exigida no enunciado.

### Perfil do colecionador

- Header, sidebar Meu perfil e formulário em duas colunas no desktop.
- Campos observados: nome de exibição, nome de usuário, e-mail, nome ENS e apelido da carteira.
- Ações de avatar: carregar e remover.
- Alteração de senha: senha atual, nova senha e confirmação.
- Sidebar com Dados do perfil, Carteiras, Atividade, Lista de interesse, Ofertas, Arquivos baixados, Suporte e Sair.

Complementos funcionais: feedback de salvamento, validação, erros da API e persistência. Adaptar a uma coluna e navegação compacta no mobile. Não criar páginas auxiliares apenas porque há links no menu.

### Carteiras

- Mesmo shell de conta do perfil.
- Carteira principal com nome de exibição, apelido, rede, nome do perfil, endereço, campo secundário opcional, tipo, indicação, e-mail e ENS.
- Ações Adicionar e Salvar carteira.
- Seção Carteira secundária, mensagem de ausência, Adicionar e opção Igual à carteira principal.

Complementos funcionais: consulta, cadastro/edição, validações por rede, persistência e disponibilidade das carteiras no checkout. Adaptar os formulários ao mobile sem remover campos necessários.

## Componentes candidatos a reutilização

Esta é uma divisão de implementação proposta a partir das repetições visuais, não uma afirmação de que existem componentes publicados no Figma.

| Grupo | Componentes | Estados necessários |
| --- | --- | --- |
| Navegação | Header, breadcrumb, navegação mobile, menu de conta | Ativo, autenticado, visitante, foco |
| Catálogo | Hero, tabs, card, grid, filtros, ordenação, paginação | Loading, vazio, erro, filtros ativos, favorito |
| NFT | Galeria, metadados, seletor de edição, quantidade | Edição esgotada, limite, preço alterado |
| Compra | Item do carrinho, cupom, resumo, seletor de carteira, recibo | Cotando, inválido, desatualizado, pendente, recusado, confirmado |
| Formulários | Campo, senha, select, upload de avatar, erro associado | Disabled, inválido, enviando, sucesso |
| Feedback | Skeleton, aviso, status de conexão, diálogo/drawer | Reduced motion, foco, anúncio acessível |
| Conteúdo auxiliar | Recomendações, rodapé, navegação editorial | Destino coerente ou indisponibilidade explícita |

## Inventário de assets e tokens

| Item | Uso observado | Situação nesta etapa | Condição para implementação fiel |
| --- | --- | --- | --- |
| Marca KURIO | Header e autenticação | Visual confirmada; arquivo/tipografia não exportados | Confirmar se é texto ou vetor e preservar proporção |
| Retrato principal do primata de jaqueta verde | Hero, NFT e galeria | Visual confirmado | Exportar resolução e recortes adequados |
| Outros retratos e thumbnails | Catálogo, recomendações e carrinho | Variedade confirmada; inventário binário pendente | Relacionar asset a NFT/galeria e evitar imagens remotas obrigatórias |
| Ícones de navegação e ações | Header, mobile, formulários, sidebar | Usos confirmados; origem não confirmada | Preferir os vetores originais; documentar substituições |
| Marcas de provedores e redes sociais | Carteiras e autenticação | Referências visuais confirmadas | Confirmar disponibilidade/licença e necessidade funcional |
| Fontes | Toda a aplicação | Família, pesos e arquivos pendentes | Confirmar licença e disponibilizar arquivos necessários localmente |
| Cores e tipografia | Superfícies, texto, CTAs e estados | Hierarquia observada, valores exatos pendentes | Extrair propriedades e medir contraste |
| Espaçamentos e formas | Containers, grids, campos e cards | Composição observada, valores exatos pendentes | Extrair largura, gaps, radius, bordas e sombras |

Não foram exportados assets nem substituídas fontes nesta etapa. Não usar capturas da tela completa como implementação da interface.

## Adaptações de responsividade e acessibilidade

- Avaliar todas as telas em 390, 768 e 1440 px, além do comportamento intermediário e com zoom.
- Preservar a composição própria de mobile: navegação compacta, cards e formulários empilhados.
- Proposta para filtros mobile: drawer com rótulo, fechamento por teclado, contenção/restauração de foco e indicação de filtros ativos.
- Proposta para checkout mobile: dados do colecionador, carteira/rede e revisão em etapas, sem omitir validações do desktop.
- Proposta para perfil/carteiras mobile: formulário em uma coluna e menu de conta compacto.
- Proposta para confirmação mobile: recibo fluido com quebra de identificadores longos e todos os valores legíveis.
- Campos com placeholder precisam de label acessível; ícones isolados precisam de nome acessível.
- Medir contraste; documentar ajustes em relação ao Figma quando necessários.
- Reservar dimensões de imagens/skeletons e respeitar `prefers-reduced-motion` no shimmer.
- Modais desktop de autenticação precisam de foco inicial, contenção de foco, Escape e retorno ao disparador.

## Limites do escopo visual

Páginas editoriais, suporte, atividade, ofertas e downloads não integram a entrega funcional. A existência dos grupos Promos/Blog ou de links auxiliares não amplia esse escopo. Preservar a composição relevante e definir comportamento honesto para ações auxiliares, conforme as decisões pendentes.

A matriz de comportamentos e evidências está em [Critérios de aceite](02-CRITERIOS-DE-ACEITE.md). As escolhas ainda não definidas estão em [Decisões e pendências](03-DECISOES-E-PENDENCIAS.md).
