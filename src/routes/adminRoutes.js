// ═══════════════════════════════════════════════════════════
//  adminRoutes.js — BUG #2: Dashboard com dados reais
//  Rotas: GET /api/admin/stats, GET /api/admin/usuarios
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth, exigeAdmin } = require('../middleware/auth');

// ── GET /api/admin/stats — BUG #2 CORRIGIDO: queries reais no banco ──
router.get('/stats', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const pool = getPool();

    // Total de usuários cadastrados
    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios WHERE ativo = TRUE');

    // Membros ativos (role = membro)
    const membrosResult = await pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE ativo = TRUE AND role = 'membro'");

    // Total de administradores
    const adminsResult = await pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE ativo = TRUE AND role = 'admin'");

    // Acessos hoje (logins/distintos hoje)
    const acessosResult = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id)::int AS total
       FROM acessos_log
       WHERE data_acesso = CURRENT_DATE`
    );

    // Novos cadastrados no mês atual
    const novosMesResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usuarios
       WHERE created_at >= date_trunc('month', NOW())
         AND ativo = TRUE`
    );

    const stats = {
      total_usuarios: totalResult.rows[0].total,
      membros_ativos: membrosResult.rows[0].total,
      administradores: adminsResult.rows[0].total,
      acessos_hoje: acessosResult.rows[0].total,
      novos_mes: novosMesResult.rows[0].total,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error('Erro ao buscar stats:', err);
    return res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
  }
});

// ── GET /api/admin/usuarios — lista todos os usuários ──
router.get('/usuarios', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, nome, email, role, data_nascimento, telefone, ativo, created_at
       FROM usuarios
       ORDER BY created_at DESC`
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
});

// ── PUT /api/admin/usuarios/:id/role — altera role de um usuário ──
router.put('/usuarios/:id/role', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'membro'].includes(role)) {
      return res.status(400).json({ erro: 'Role inválido. Use "admin" ou "membro".' });
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE usuarios SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, nome, email, role;`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Role atualizado!', usuario: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar role:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar role.' });
  }
});

// ── PUT /api/admin/usuarios/:id/ativo — ativa/desativa usuário ──
router.put('/usuarios/:id/ativo', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const pool = getPool();
    const result = await pool.query(
      `UPDATE usuarios SET ativo = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, nome, email, ativo;`,
      [ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Status atualizado!', usuario: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
});

module.exports = router;
