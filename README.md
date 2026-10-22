# KURIO Marketplace de NFTs

Desafio frontend em React e TypeScript com APIs REST e eventos Socket.IO simulados na camada de rede. Nenhuma operação utiliza blockchain, extensões de carteira ou dinheiro real.

## Executar

Requisitos: Node.js 22.12 ou superior e npm. Em um checkout limpo:

```sh
npm ci
npm run dev
```

O Vite informa a URL local. Os mocks estão habilitados por padrão, inclusive no build de demonstração. `.env.example` documenta `VITE_ENABLE_MOCKS`; nenhum `.env` existente precisa ser sobrescrito. Definir `false` exige uma implementação externa dos contratos `/api` e Socket.IO; este desafio entrega a simulação local.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
npm run test:visual
npm run audit:lighthouse
```

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Instalar as versões do lockfile |
| `npm run dev` | Executar o site localmente |
| `npm run typecheck` / `npm run lint` | Verificar tipos e regras de código |
| `npm test` | Executar os testes unitários |
| `npx playwright install chromium` | Preparar o navegador dos testes E2E |
| `npm run test:e2e` | Executar os fluxos E2E em desktop e mobile |
| `npm run test:visual` | Comparar as quatro telas com as baselines visuais |
| `npm run build` / `npm run preview` | Gerar e conferir o build otimizado |
| `npm run audit:lighthouse` | Gerar as medições de início e detalhe; exige build prévio |

O Playwright compila a aplicação e inicia um preview em `127.0.0.1:4182`, validando o build de demonstração com mocks. A auditoria requer build prévio e inicia outro preview em `127.0.0.1:4181`, com Chromium na porta de depuração 9223. Os scripts não dependem de um backend privado.

## Contas fictícias

| Usuário | E-mail | Senha inicial |
| --- | --- | --- |
| Ana Silva | ana@kurio.test | Colecionador!2026 |
| Bruno Costa | bruno@kurio.test | Colecionador!2026 |

Novos cadastros e alterações persistem neste navegador. O reset restaura as senhas iniciais. Use apenas dados fictícios: o armazenamento de toda a simulação é local e inspecionável. As senhas são persistidas com salt aleatório e PBKDF2/SHA-256; esta simulação não substitui uma infraestrutura de autenticação de produção.

## Cenários reproduzíveis

Abra `/demonstracao` na mesma aba da aplicação. O painel técnico não aparece no rodapé das páginas do marketplace. É possível selecionar lentidão, respostas fora de ordem, falha de conexão, HTTP 503, sessão expirada, conflito de cadastro, falha ao favoritar, pagamento recusado, timeout após criação e pedido pendente. O botão **Restaurar demonstração** limpa integralmente o cenário, usuários, carrinhos, favoritos, carteiras, cotações e pedidos.

- Cupom válido: `KURIO10`, desconto de 10% sobre o subtotal. `EXPIRED` reproduz cupom expirado; outros códigos são inválidos.
- Preço/estoque: adicione `Emerald Ape #042`, avance até a revisão, abra `/demonstracao` na mesma aba e use **Alterar preço** ou **Esgotar edição**. Retorne a `/pagamento`: o checkout exige nova revisão. Os E2E também disparam os endpoints técnicos enquanto o resumo permanece aberto, verificando a atualização pelo Socket.IO.
- Idempotência: selecione **Timeout após criar pedido**, confirme e use **Recuperar tentativa**, inclusive após refresh. A tentativa é reutilizada.
- Reconexão: selecione **Pedido pendente**, confirme a compra, guarde a URL do pedido e abra `/demonstracao` na mesma aba. Use **Desconectar**, **Concluir pendente** e **Reconectar**, depois retorne à URL do pedido, ou recarregue essa rota para recuperar o estado.
- Rollback: selecione **Falha ao favoritar** e acione o coração. O estado otimista é revertido.
- Isolamento: salve favoritos em Ana, saia e entre como Bruno. Os dados privados não são compartilhados.

O painel é uma ferramenta do ambiente de demonstração. Seus comandos alteram o backend simulado e emitem eventos na camada MSW; a interface recebe esses eventos através de socket.io-client.

## Testes e evidências

Os testes E2E usam contextos independentes de navegador. REST passa por MSW e os eventos de preço/pedido pelo protocolo Socket.IO sobre WebSocket. `playwright-report/` contém o relatório HTML e `test-results/` preserva screenshots/traces de falhas. Baselines visuais ficam junto a `tests/e2e/visual.spec.ts` e dependem da versão do Chromium e do sistema operacional. Atualize-as conscientemente com `npm run test:visual -- --update-snapshots`.

`audit-results/` recebe as doze medições Lighthouse em HTML/JSON e `summary.json` com medianas, versões, ambiente, LCP, CLS e TBT. Os perfis usam os presets oficiais mobile Slow 4G e desktop Dense 4G. Consulte [resultados e limites](docs/05-VALIDACAO.md) para as evidências da entrega.

## Design e publicação

As referências fornecidas estão em `Frontend Challenge/`. Os recortes de quatro artworks foram extraídos da exportação local para `public/art/`, preservando os arquivos originais. A interface usa versões WebP de aproximadamente 65 KB no total, diante de 831 KB dos recortes PNG. A família exata da fonte não veio na exportação; o uso atual de fonte monoespaçada do sistema é um desvio registrado em ARCHITECTURE. Atribuições dos componentes adaptados estão em [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md).

`vercel.json` contém build, diretório de saída e fallback de rotas. Para publicar na Vercel, importe o repositório como projeto Vite, use a pasta que contém `package.json` como raiz, `npm ci` para instalação, `npm run build` para build, `dist` como saída e `VITE_ENABLE_MOCKS=true` em Production e Preview.

O [guia de publicação no GitHub e na Vercel](docs/06-PUBLICACAO.md) contém o passo a passo para Windows, configuração do deploy, atualização do README e conferência da URL pública. A URL pública e a referência do repositório devem corresponder à versão efetivamente entregue.

| Links da entrega | URL |
| --- | --- |
| Repositório GitHub | [PedroAragaoDev/kurio-marketplace](https://github.com/PedroAragaoDev/kurio-marketplace) |
| Aplicação na Vercel | [KURIO Marketplace](https://kurio-marketplace-five.vercel.app/) |

A seção 12 do desafio exige ambos os links, além das instruções de execução, variáveis, credenciais, seleção/reset de cenários e testes documentados neste README.

Consulte [ARCHITECTURE](ARCHITECTURE.md), [contratos REST e eventos](docs/04-CONTRATOS.md) e o [mapeamento de aceite](docs/02-CRITERIOS-DE-ACEITE.md).
