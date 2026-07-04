// ═══════════════════════════════════════════════════════════
//  liderancaRoutes.js — Gestão de lideranças da igreja
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth, exigeAdmin } = require('../middleware/auth');

// ── GET /api/liderancas — lista lideranças (público) ──
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, nome, cargo, descricao, foto_url, ordem
       FROM liderancas
       WHERE ativo = TRUE
       ORDER BY ordem ASC, nome ASC;`
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar lideranças:', err);
    return res.status(200).json([]);
  }
});

// ── POST /api/liderancas — cria nova liderança (admin) ──
router.post('/', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { nome, cargo, descricao, foto_url, ordem } = req.body;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: 'Nome e cargo são obrigatórios.' });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO liderancas (nome, cargo, descricao, foto_url, ordem)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, cargo, descricao, foto_url, ordem;`,
      [nome.trim(), cargo.trim(), descricao || null, foto_url || null, ordem || 0]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar liderança:', err);
    return res.status(500).json({ erro: 'Erro ao criar liderança.' });
  }
});

// ── PUT /api/liderancas/:id — atualiza liderança (admin) ──
router.put('/:id', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, descricao, foto_url, ordem } = req.body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE liderancas
       SET nome = COALESCE($1, nome),
           cargo = COALESCE($2, cargo),
           descricao = COALESCE($3, descricao),
           foto_url = COALESCE($4, foto_url),
           ordem = COALESCE($5, ordem),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, nome, cargo, descricao, foto_url, ordem;`,
      [nome, cargo, descricao, foto_url, ordem, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Liderança não encontrada.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar liderança:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar liderança.' });
  }
});

// ── DELETE /api/liderancas/:id — remove liderança (admin) ──
router.delete('/:id', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('UPDATE liderancas SET ativo = FALSE WHERE id = $1;', [id]);

    return res.status(200).json({ mensagem: 'Liderança removida.' });
  } catch (err) {
    console.error('Erro ao remover liderança:', err);
    return res.status(500).json({ erro: 'Erro ao remover liderança.' });
  }
});

module.exports = router;
