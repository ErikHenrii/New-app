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

const app = express();

// O Render obriga o uso de process.env.PORT
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// ── Rate limiting global ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api/', limiter);

// ── Health check (Render usa isso) ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rotas da API ──
app.use('/api/auth', authRoutes);
app.use('/api/perfil', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/aniversariantes', anivRoutes);
app.use('/api/lgpd', lgpdRoutes);

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
//  O Render precisa que a porta esteja ouvindo para considerar
//  o deploy bem-sucedido. O banco inicializa em background.
// ═══════════════════════════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Missão Reviver rodando na porta ${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/health`);
  console.log(`   Site: http://localhost:${PORT}/`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Inicializa o banco em background (não bloqueia o servidor)
async function initBancoBackground() {
  let tentativa = 0;
  while (tentativa < 10) {
    tentativa++;
    try {
      console.log(`📊 Conectando ao banco (tentativa ${tentativa}/10)...`);
      await initDatabase();
      console.log('✅ Banco inicializado com sucesso!');
      return; // Sucesso, para de tentar
    } catch (err) {
      console.error(`❌ Banco ainda não pronto (tentativa ${tentativa}): ${err.message}`);
      if (tentativa < 10) {
        console.log(`   Tentando novamente em 5 segundos...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  console.error('❌ Não foi possível conectar ao banco após 10 tentativas.');
  console.error('   Verifique a variável DATABASE_URL no Render.');
}

initBancoBackground();
