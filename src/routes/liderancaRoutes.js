// ═══════════════════════════════════════════════════════════
//  routes/liderancaRoutes.js — CRUD de Lideranças da Igreja
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// ── GET /api/liderancas — Lista todas ativas (público para membros) ──
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, cargo, descricao, telefone, email, foto, ordem, ativo
       FROM liderancas WHERE ativo = true ORDER BY ordem ASC, nome ASC`
    );
    res.json({ liderancas: rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/liderancas/todas — Lista todas incluindo inativas (admin) ──
router.get('/todas', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM liderancas ORDER BY ativo DESC, ordem ASC, nome ASC`
    );
    res.json({ liderancas: rows });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/liderancas — Admin cria nova liderança ──
router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { nome, cargo, descricao, telefone, email, foto, ordem } = req.body;
    if (!nome || !cargo) return res.status(400).json({ erro: 'Nome e cargo são obrigatórios' });

    const id = uuidv4();
    await pool.query(`
      INSERT INTO liderancas (id, nome, cargo, descricao, telefone, email, foto, ordem)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, nome.trim(), cargo.trim(), descricao || null, telefone || null,
         (email || '').toLowerCase().trim() || null, foto || null, ordem || 0]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LIDERANCA_CRIADA', `Cargo: ${cargo} - ${nome}`]
    );

    res.status(201).json({ sucesso: true, id, mensagem: 'Liderança criada com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/liderancas/:id — Admin atualiza liderança ──
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const camposPermitidos = ['nome', 'cargo', 'descricao', 'telefone', 'email', 'foto', 'ordem', 'ativo'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        let valor = req.body[campo];
        if (typeof valor === 'string') valor = valor.trim() || null;
        sets.push(`${campo} = $${idx}`);
        values.push(valor);
        idx++;
      }
    }

    if (sets.length === 0) return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    sets.push(`atualizado_em = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE liderancas SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ erro: 'Liderança não encontrada' });

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LIDERANCA_ATUALIZADA', `ID: ${req.params.id}`]
    );

    res.json({ sucesso: true, mensagem: 'Liderança atualizada com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/liderancas/:id — Admin remove liderança ──
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM liderancas WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Liderança não encontrada' });

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LIDERANCA_REMOVIDA', `ID: ${req.params.id}`]
    );

    res.json({ sucesso: true, mensagem: 'Liderança removida com sucesso' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
