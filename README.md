# Help Desk Pro

Sistema de gerenciamento de chamados técnicos com Node.js, Express, MySQL e interface responsiva em HTML, CSS e JavaScript.

## Funcionalidades
- Login com JWT e senhas protegidas por bcrypt.
- Dashboard com indicadores reais do banco.
- Cadastro, edição, busca, filtros, atribuição e exclusão de chamados.
- Cadastro de técnicos pelo administrador.
- API REST documentada em Swagger (`/docs`).
- Testes unitários de validação e GitHub Actions.

## Pré-requisitos
Node.js 22+, npm, MySQL 8 ou MariaDB do XAMPP, Git.

## Instalação no Windows / VS Code
1. Extraia o ZIP e abra a pasta `helpdesk-pro-nodejs` no VS Code.
2. Inicie MySQL no XAMPP. Apache é necessário apenas se usar phpMyAdmin.
3. Importe `database/schema.sql` pelo phpMyAdmin ou cliente MySQL.
4. No terminal PowerShell:
   ```powershell
   npm install
   Copy-Item .env.example .env
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
5. Edite `.env`: cole a chave gerada em JWT_SECRET, informe os dados do banco e defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres, máximo 72 bytes).
6. Execute:
   ```powershell
   npm run seed
   npm start
   ```
7. Acesse http://localhost:3000 e entre com o administrador configurado.

O seed cria um administrador uma única vez por e-mail. Não publique `.env`. A porta padrão é 3000; não é necessário colocar o projeto em htdocs.

## Testes
`npm test` executa testes unitários com o test runner nativo do Node.js. Não inclui testes de integração com MySQL.

## Publicação no GitHub
Crie um repositório vazio chamado `helpdesk-pro-nodejs`, sem README inicial. No terminal:
```bash
git init
git add .
git commit -m "feat: initial Help Desk Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/helpdesk-pro-nodejs.git
git push -u origin main
```
Substitua SEU_USUARIO pelo seu usuário. Versione também o package-lock.json gerado pelo npm install.

## Arquitetura
`public/` interface; `src/` servidor, conexão, validação e seed; `database/` SQL; `docs/` OpenAPI; `test/` testes.

## Permissões e limitações
Administradores gerenciam técnicos e excluem chamados. Técnicos podem visualizar, criar e editar todos os chamados. Clientes são identificados por nome no chamado, não possuem login próprio. Tokens ficam somente na memória da página; recarregar exige novo login. Esta versão de portfólio não inclui recuperação de senha, auditoria, SLA, anexos ou implantação pública. Para produção, configure HTTPS, usuário MySQL restrito, backups, políticas de acesso e testes de integração. O Swagger pode exigir ajuste da política CSP do Helmet conforme a versão instalada.
