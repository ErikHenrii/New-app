// ═══════════════════════════════════════════════════════════
//  routes/profileRoutes.js — Perfil do membro logado
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { hashSenha, verificarSenha } = require('../utils/crypto');

// ── GET /api/perfil — Dados completos do membro logado ──
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM membros WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Perfil não encontrado' });

    const perfil = rows[0];
    // Remove a senha do retorno
    delete perfil.senha_hash;

    res.json({ perfil });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/perfil — Atualiza os dados do perfil ──
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const camposPermitidos = [
      'nome_completo', 'telefone', 'data_nascimento', 'genero', 'cpf', 'estado_civil',
      'endereco_rua', 'endereco_numero', 'endereco_bairro', 'endereco_cidade', 'endereco_estado', 'endereco_cep',
      'nome_conjuge', 'data_casamento', 'filhos', 'qtd_filhos',
      'data_conversao', 'data_batismo', 'ministerio', 'funcao_igreja', 'igreja_anterior', 'dons_espirituais',
      'emergencia_nome', 'emergencia_telefone', 'emergencia_parentesco',
      'instagram', 'facebook',
      'notificar_email', 'notificar_whatsapp', 'participar_aniversarios',
      'testemunho', 'foto_perfil',
    ];

    // Constrói SET dinâmico apenas com campos enviados
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

    // Verifica perfil completo
    const camposObrigatorios = ['nome_completo', 'telefone', 'data_nascimento', 'endereco_cidade'];
    const { rows: atual } = await pool.query(
      `SELECT ${camposObrigatorios.join(', ')} FROM membros WHERE id = $1`,
      [req.user.id]
    );
    const merged = { ...atual[0], ...req.body };
    const perfilCompleto = camposObrigatorios.every(c => merged[c] && String(merged[c]).trim());

    sets.push(`perfil_completo = $${idx}`);
    values.push(perfilCompleto);
    idx++;
    sets.push(`atualizado_em = NOW()`);

    values.push(req.user.id);

    await pool.query(
      `UPDATE membros SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'PERFIL_ATUALIZADO', 'Membro atualizou seu perfil']
    );

    res.json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso', perfil_completo: perfilCompleto });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/perfil/alterar-senha ──
router.post('/alterar-senha', authMiddleware, async (req, res, next) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
    if (nova_senha.length < 6) return res.status(400).json({ erro: 'Nova senha deve ter ao menos 6 caracteres' });

    const { rows } = await pool.query('SELECT senha_hash FROM membros WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const senhaOk = await verificarSenha(senha_atual, rows[0].senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Senha atual incorreta' });

    const novoHash = await hashSenha(nova_senha);
    await pool.query('UPDATE membros SET senha_hash = $1, atualizado_em = NOW() WHERE id = $2', [novoHash, req.user.id]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'SENHA_ALTERADA', 'Membro alterou sua senha']
    );

    res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
