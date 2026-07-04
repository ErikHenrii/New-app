// ═══════════════════════════════════════════════════════════
//  routes/aniversariantesRoutes.js — Aniversariantes do mês
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ── GET /api/aniversariantes?mes=7 — Versão membro (respeita privacidade) ──
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const mesAtual = req.query.mes ? parseInt(req.query.mes) : new Date().getMonth() + 1;

    const { rows } = await pool.query(`
      SELECT id, nome_completo, telefone, ministerio, data_nascimento,
             EXTRACT(DAY FROM data_nascimento)::int AS dia,
             EXTRACT(MONTH FROM data_nascimento)::int AS mes,
             EXTRACT(YEAR FROM data_nascimento)::int AS ano_nasc
      FROM membros
      WHERE status = 'ativo'
        AND data_nascimento IS NOT NULL
        AND participar_aniversarios = true
        AND EXTRACT(MONTH FROM data_nascimento)::int = $1
      ORDER BY dia ASC
    `, [mesAtual]);

    const anoAtual = new Date().getFullYear();
    const aniversariantes = rows.map(r => ({
      id: r.id,
      nome_completo: r.nome_completo,
      dia: r.dia,
      mes: r.mes,
      mes_nome: MESES[mesAtual - 1],
      telefone: r.telefone,
      ministerio: r.ministerio,
      idade: anoAtual - r.ano_nasc,
    }));

    res.json({ aniversariantes, mes: mesAtual, mes_nome: MESES[mesAtual - 1] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/aniversariantes/admin?mes=7 — Versão admin (vê todos) ──
router.get('/admin', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const mesAtual = req.query.mes ? parseInt(req.query.mes) : new Date().getMonth() + 1;

    const { rows } = await pool.query(`
      SELECT id, nome_completo, email, telefone, ministerio, data_nascimento,
             EXTRACT(DAY FROM data_nascimento)::int AS dia,
             EXTRACT(MONTH FROM data_nascimento)::int AS mes,
             EXTRACT(YEAR FROM data_nascimento)::int AS ano_nasc,
             participar_aniversarios
      FROM membros
      WHERE status = 'ativo'
        AND data_nascimento IS NOT NULL
        AND EXTRACT(MONTH FROM data_nascimento)::int = $1
      ORDER BY dia ASC
    `, [mesAtual]);

    const anoAtual = new Date().getFullYear();
    const aniversariantes = rows.map(r => ({
      id: r.id,
      nome_completo: r.nome_completo,
      email: r.email,
      dia: r.dia,
      mes: r.mes,
      mes_nome: MESES[mesAtual - 1],
      telefone: r.telefone,
      ministerio: r.ministerio,
      participar_aniversarios: r.participar_aniversarios,
      idade: anoAtual - r.ano_nasc,
    }));

    res.json({ aniversariantes, mes: mesAtual, mes_nome: MESES[mesAtual - 1] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
