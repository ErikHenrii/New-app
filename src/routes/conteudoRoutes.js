// ═══════════════════════════════════════════════════════════
//  routes/conteudoRoutes.js — Conteúdo dinâmico do site
//  Permite ao admin editar: cultos, eventos, avisos, etc.
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Seções válidas para edição
const SECOES_VALIDAS = ['cultos', 'eventos', 'avisos', 'devocionais', 'estudos', 'escalas', 'config_igreja'];

// ── GET /api/conteudo — Lista todo conteúdo (público, não precisa de auth) ──
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT secao, dados FROM site_conteudo');
    const resultado = {};
    rows.forEach(r => { resultado[r.secao] = r.dados; });
    res.json({ conteudo: resultado });
  } catch (err) { next(err); }
});

// ── GET /api/conteudo/:secao — Busca uma seção específica ──
router.get('/:secao', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT dados FROM site_conteudo WHERE secao = $1', [req.params.secao]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Seção não encontrada' });
    res.json({ secao: req.params.secao, dados: rows[0].dados });
  } catch (err) { next(err); }
});

// ── PUT /api/conteudo/:secao — Admin atualiza uma seção ──
router.put('/:secao', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { secao } = req.params;
    if (!SECOES_VALIDAS.includes(secao)) {
      return res.status(400).json({ erro: `Seção inválida. Válidas: ${SECOES_VALIDAS.join(', ')}` });
    }

    const dados = req.body.dados || req.body;
    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ erro: 'Dados inválidos' });
    }

    // Upsert: insere se não existe, atualiza se existe
    await pool.query(`
      INSERT INTO site_conteudo (secao, dados, atualizado_por, atualizado_em)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (secao) DO UPDATE
      SET dados = $2, atualizado_por = $3, atualizado_em = NOW()
    `, [secao, JSON.stringify(dados), req.user.id]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'CONTEUDO_ATUALIZADO', `Admin atualizou seção: ${secao}`]
    );

    res.json({ sucesso: true, mensagem: `Seção "${secao}" atualizada com sucesso` });
  } catch (err) { next(err); }
});

module.exports = router;
