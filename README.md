# Missão Reviver — Plataforma Web

Sistema completo da Comunidade Cristã Missão Reviver com site institucional + sistema de autenticação e gestão de membros.

## 🏗️ Arquitetura

- **Frontend**: HTML, CSS, JavaScript (servido estaticamente pelo Express)
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens) com bcrypt
- **Deploy**: Render (free tier)

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou Render)

## 🚀 Instalação Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com sua string de conexão do PostgreSQL

# 3. Iniciar o servidor
npm start
# ou em modo desenvolvimento (auto-reload):
npm run dev
```

O servidor roda em `http://localhost:3000`

## 🌐 Deploy no Render

1. Faça push do código para um repositório GitHub
2. No Render, clique em "New" → "Blueprint"
3. Selecione o repositório
4. O Render detecta o `render.yaml` automaticamente:
   - Cria um banco PostgreSQL (free tier)
   - Cria um web service Node.js
   - Configura as variáveis de ambiente automaticamente
5. No primeiro deploy, o servidor executa `db/init.js` que:
   - Cria as tabelas (`membros`, `auditoria`)
   - Cria o admin inicial (admin@missaoreviver.com.br / Reviver@Admin2026)

## 🔑 Credenciais Padrão

- **E-mail**: admin@missaoreviver.com.br
- **Senha**: Reviver@Admin2026

⚠️ **Altere a senha do admin após o primeiro login!**

## 📁 Estrutura

```
missao-reviver-app/
├── server.js              # Entry point Express
├── package.json           # Dependências
├── render.yaml            # Configuração Render
├── .env.example           # Modelo de variáveis
├── src/
│   ├── config/database.js # Pool PostgreSQL
│   ├── db/
│   │   ├── schema.sql     # Schema das tabelas
│   │   └── init.js        # Inicialização do banco
│   ├── middleware/
│   │   ├── auth.js        # Validação JWT
│   │   └── adminOnly.js   # Bloqueio não-admins
│   ├── routes/
│   │   ├── authRoutes.js          # Login, registro, logout, sessão
│   │   ├── profileRoutes.js       # Perfil do membro
│   │   ├── adminRoutes.js         # Painel administrativo
│   │   ├── aniversariantesRoutes.js # Aniversariantes
│   │   └── lgpdRoutes.js          # LGPD (exportar/excluir)
│   └── utils/
│       ├── crypto.js      # bcrypt
│       └── validation.js  # Validação de campos
└── public/                # Frontend estático
    ├── index.html         # Site institucional
    ├── login.html         # Página de login
    ├── register.html      # Cadastro de membros
    ├── dashboard.html     # Portal do membro
    ├── admin.html         # Painel administrativo
    ├── css/auth.css       # Estilos auth
    └── js/
        ├── api.js              # Camada de comunicação API
        ├── auth-frontend.js    # Lógica das páginas auth
        └── dashboard-data.js   # Conteúdo do portal
```

## 🔄 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/registrar` | Cadastrar novo membro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/sessao` | Verificar sessão atual |
| GET | `/api/perfil` | Ver próprio perfil |
| PUT | `/api/perfil` | Atualizar perfil |
| POST | `/api/perfil/alterar-senha` | Alterar senha |
| GET | `/api/admin/stats` | Estatísticas (admin) |
| GET | `/api/admin/usuarios` | Listar membros (admin) |
| GET | `/api/admin/usuarios/:id` | Ver membro (admin) |
| POST | `/api/admin/usuarios` | Criar membro (admin) |
| PUT | `/api/admin/usuarios/:id` | Atualizar membro (admin) |
| DELETE | `/api/admin/usuarios/:id` | Excluir/anonimizar (admin) |
| GET | `/api/admin/auditoria` | Logs de auditoria (admin) |
| GET | `/api/admin/exportar-csv` | Exportar CSV (admin) |
| GET | `/api/aniversariantes` | Aniversariantes do mês |
| GET | `/api/aniversariantes/admin` | Aniversariantes (admin, vê todos) |
| GET | `/api/lgpd/exportar-dados` | Exportar meus dados (LGPD) |
| DELETE | `/api/lgpd/solicitar-exclusao` | Solicitar exclusão (LGPD) |

## 🔒 Segurança

- Senhas criptografadas com bcrypt (12 rounds)
- JWT com expiração de 7 dias
- Rate limiting no login (10 tentativas / 15 min)
- Rate limiting global (200 req / 15 min)
- Conformidade LGPD: exportação e anonimização de dados

## 📝 Licença

Propriedade da Comunidade Cristã Missão Reviver — Betim, MG
