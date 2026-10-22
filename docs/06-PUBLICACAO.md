# Publicação no GitHub e na Vercel

Este guia acompanha o projeto local e permite publicar usando suas próprias contas no navegador. Não depende de conectar GitHub ou Vercel ao chat.

## 1. Criar o repositório no GitHub

1. Entre no GitHub e abra [New repository](https://github.com/new).
2. Escolha o nome do repositório, por exemplo `kurio-marketplace`.
3. Escolha a visibilidade. Um repositório público pode ser aberto pelo avaliador sem convite; um privado exige conceder acesso.
4. Deixe desmarcada a criação de README, `.gitignore` e licença: o projeto já contém os arquivos necessários.
5. Clique em **Create repository** e copie a URL HTTPS mostrada na página.

Esse fluxo segue a [orientação oficial para publicar código local no GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github?platform=windows).

## 2. Enviar os arquivos locais

Abra o PowerShell e execute uma linha por vez na pasta do projeto. Se algum comando retornar erro, resolva antes de continuar. Esta é a sequência para a primeira publicação, quando ainda não existe um repositório Git local.

```powershell
Set-Location -LiteralPath 'C:\Users\pedro\OneDrive\Área de Trabalho\Desafio'
git init -b main
git add .
git status
git commit -m "Entrega inicial do marketplace KURIO"
$kurioRepositoryUrl = Read-Host 'Cole a URL HTTPS do repositorio criado no GitHub'
git remote add origin $kurioRepositoryUrl
git remote -v
git push -u origin main
```

Antes do commit, `git status` deve listar o código, README, lockfile, assets e evidências. O `.gitignore` exclui `node_modules`, `dist`, arquivos de ambiente pessoais, configurações locais da Vercel e saídas temporárias dos testes. `.env.example` permanece incluído.

Se o commit pedir nome e e-mail, configure a identidade deste repositório e repita o commit:

```powershell
git config user.name (Read-Host 'Seu nome para o commit')
git config user.email (Read-Host 'Seu e-mail de autoria ou endereco noreply do GitHub')
git commit -m "Entrega inicial do marketplace KURIO"
```

Depois continue pelo comando que solicita a URL do repositório. Quando o Git solicitar autenticação, conclua o login na conta do GitHub que criou o repositório.

Ao terminar o push, atualize a página do GitHub e confirme que `package.json`, `src`, `public`, `README.md` e `vercel.json` estão na raiz do repositório.

## 3. Importar na Vercel

1. Entre na Vercel pelo navegador.
2. No dashboard, escolha **Add New → Project** ou **New Project**.
3. Conecte a conta do GitHub que contém o repositório e autorize acesso a ele.
4. Localize o repositório e clique em **Import**.
5. Confira as configurações abaixo e clique em **Deploy**.

| Campo | Valor deste projeto |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `.`; a pasta que contém `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | `VITE_ENABLE_MOCKS` com valor `true` em Production e Preview |

Se o repositório contiver a pasta `Desafio` como subpasta, a Root Directory deve apontar para ela. O importante é que a raiz selecionada contenha o `package.json` desta aplicação.

O projeto já contém o fallback de rotas SPA em `vercel.json`, preservando assets e o arquivo `mockServiceWorker.js`. Mantenha os mocks habilitados: eles fornecem as APIs e os eventos exigidos pelo desafio, sem um backend externo.

As configurações seguem as páginas oficiais de [importação de repositórios](https://vercel.com/docs/git) e [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite). Se adicionar ou mudar uma variável depois do primeiro deploy, faça um novo deploy para aplicá-la ao build.

## 4. Conferir a versão publicada

Quando o deploy concluir, copie a URL de produção fornecida pela Vercel e abra em uma janela anônima. O avaliador deve conseguir abrir o site sem fazer login na Vercel.

Confira os fluxos do desafio:

- Abra o início e `/nft/nft-1` diretamente; recarregue ambas as páginas.
- Entre com uma das contas do README e abra `/perfil`, `/carteiras` e `/pagamento` diretamente.
- Adicione um NFT, confirme a compra e recarregue o recibo; os valores devem permanecer.
- Abra `/demonstracao` na mesma aba e confirme que os cenários de preço alterado, pagamento recusado e pedido pendente continuam disponíveis.
- Confira o site em largura mobile.

As contas iniciais são `ana@kurio.test` e `bruno@kurio.test`, com senha `Colecionador!2026`. Os dados locais de `localhost` não são transferidos para o domínio da Vercel; o domínio publicado inicia seu próprio estado.

Se o deploy falhar, abra **Build Logs** e verifique a primeira mensagem de erro. Se o site abrir e uma rota direta retornar 404, confira a Root Directory e se `vercel.json` foi enviado. Se as APIs retornarem 404 no navegador, confira `VITE_ENABLE_MOCKS=true`, faça um novo deploy e confirme que `/mockServiceWorker.js` abre como JavaScript.

## 5. Manter os links e entregar

O README contém os links da aplicação e do repositório no início, além de setup, variáveis, contas, comandos de teste, cenários e reset. Ao publicar uma cópia própria ou alterar o endereço:

1. Atualize os links da aplicação, do repositório e do painel de cenários no README, incluindo a URL do comando de clone.
2. Confira se os endereços abrem publicamente e correspondem ao código entregue.
3. Salve e envie as alterações ao GitHub.

```powershell
git add README.md
git commit -m "Atualiza documentação da entrega"
git push
```

As próximas alterações enviadas à branch de produção conectada geram novos deploys pela integração Git da Vercel. Entregue ao avaliador o link do repositório e a URL pública que você conferiu.
