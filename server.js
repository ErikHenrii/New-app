// ═══════════════════════════════════════════════════════════
//  server.js — Entry point do backend Missão Reviver
// ═══════════════════════════════════════════════════════════

console.log(">>> O arquivo server.js foi iniciado com sucesso! <<<");

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const initDatabase = require('./src/db/init');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const anivRoutes = require('./src/routes/aniversariantesRoutes');
const lgpdRoutes = require('./src/routes/lgpdRoutes');
const liderancaRoutes = require('./src/routes/liderancaRoutes');
const conteudoRoutes = require('./src/routes/conteudoRoutes');

const app = express();

// CRÍTICO: Render usa proxy — sem isso o rate-limit vê TODAS as
// requisições como vindo de um único IP (o do proxy), estourando o limite
app.set('trust proxy', 1);

// O Render obriga o uso de process.env.PORT
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// ── Rate limiting global (generoso para não bloquear uso normal) ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5000, // 5000 req por IP em 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api/', limiter);

// ── Health check (Render usa isso) ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    banco: global.bancoPronto ? 'conectado' : 'aguardando',
    database_url: process.env.DATABASE_URL ? 'definida' : 'NÃO DEFINIDA',
  });
});

// ── Middleware: avisa se o banco não está pronto ──
// Rotas públicas que não precisam de banco: /api/health, /api/conteudo (GET)
app.use('/api/', (req, res, next) => {
  if (!global.bancoPronto && !req.path.includes('/health') && !req.path.startsWith('/conteudo')) {
    return res.status(503).json({
      erro: 'Banco de dados ainda não conectado. Veja os logs do Render.',
      detalhe: process.env.DATABASE_URL
        ? 'DATABASE_URL está definida mas o PostgreSQL pode estar iniciando.'
        : 'DATABASE_URL NÃO está definida! Crie um banco PostgreSQL no Render e adicione a variável DATABASE_URL.',
    });
  }
  next();
});

// ── Rotas da API ──
app.use('/api/auth', authRoutes);
app.use('/api/perfil', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/aniversariantes', anivRoutes);
app.use('/api/lgpd', lgpdRoutes);
app.use('/api/liderancas', liderancaRoutes);
app.use('/api/conteudo', conteudoRoutes);

// ── Arquivos estáticos (frontend) ──
app.use(express.static(path.join(__dirname, 'public')));

// ── SPA fallback ──
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const filePath = path.join(__dirname, 'public', req.path);
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Handler de erros ──
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

// ═══════════════════════════════════════════════════════════
//  STARTUP — Abre o servidor PRIMEIRO, banco DEPOIS
// ═══════════════════════════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Missão Reviver rodando na porta ${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/health`);
  console.log(`   Site: http://localhost:${PORT}/`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.DATABASE_URL) {
    console.log('');
    console.log('⚠️  ATENÇÃO: DATABASE_URL não está definida!');
    console.log('⚠️  Crie um PostgreSQL no Render e adicione a variável DATABASE_URL.');
    console.log('');
    console.log('   O site institucional funciona normalmente sem banco.');
    console.log('   Apenas login/registro/membros precisam do PostgreSQL.');
  }
});

// Inicializa o banco em background (não bloqueia o servidor)
async function initBancoBackground() {
  if (!process.env.DATABASE_URL) {
    console.log('📊 Banco não inicializado — DATABASE_URL ausente. Site funciona, API de membros aguarda configuração.');
    return;
  }

  let tentativa = 0;
  const maxTentativas = 15;
  while (tentativa < maxTentativas) {
    tentativa++;
    try {
      console.log(`📊 Conectando ao banco (tentativa ${tentativa}/${maxTentativas})...`);
      await initDatabase();
      console.log('✅ Banco inicializado com sucesso!');
      return;
    } catch (err) {
      console.error(`❌ Banco não conectou (tentativa ${tentativa}/${maxTentativas}): ${err.message}`);
      if (tentativa < maxTentativas) {
        console.log(`   Tentando novamente em 5 segundos...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  console.error('❌ Não foi possível conectar ao banco após ' + maxTentativas + ' tentativas.');
  console.error('   Verifique a variável DATABASE_URL no Render Dashboard → Environment.');
}

initBancoBackground();
