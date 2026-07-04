// ═══════════════════════════════════════════════════════════
//  profileRoutes.js — BUG #1: Edição de Perfil do Usuário
//  Garante que PUT /api/perfil atualize os dados no banco
//  e retorne status 200 com os dados novos.
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth } = require('../middleware/auth');

// ── GET /api/perfil — retorna dados do usuário logado ──
router.get('/', exigeAuth, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, nome, email, role, data_nascimento, telefone, endereco, cidade, estado, foto_url
       FROM usuarios WHERE id = $1`,
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
});

// ── PUT /api/perfil — BUG #1 CORRIGIDO: atualiza perfil no banco ──
router.put('/', exigeAuth, async (req, res) => {
  try {
    const { nome, data_nascimento, telefone, endereco, cidade, estado, foto_url } = req.body;

    // Validação: nome é obrigatório
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE usuarios
       SET nome          = $1,
           data_nascimento = $2,
           telefone      = $3,
           endereco      = $4,
           cidade        = $5,
           estado        = $6,
           foto_url      = $7,
           updated_at    = NOW()
       WHERE id = $8
       RETURNING id, nome, email, role, data_nascimento, telefone, endereco, cidade, estado, foto_url;`,
      [
        nome.trim(),
        data_nascimento || null,
        telefone ? telefone.trim() : null,
        endereco ? endereco.trim() : null,
        cidade ? cidade.trim() : null,
        estado ? estado.trim() : null,
        foto_url || null,
        req.usuario.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuarioAtualizado = result.rows[0];

    // Retorna status 200 com os dados atualizados
    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: usuarioAtualizado,
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;
