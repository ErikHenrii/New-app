// ═══════════════════════════════════════════════════════════
//  routes/lgpdRoutes.js — Portabilidade e exclusão (LGPD)
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// ── GET /api/lgpd/exportar-dados — Baixa todos os dados do membro ──
router.get('/exportar-dados', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM membros WHERE id = $1`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Não encontrado' });

    const dados = rows[0];
    delete dados.senha_hash;

    const { rows: logs } = await pool.query(
      `SELECT acao, detalhes, timestamp FROM auditoria WHERE membro_id = $1 ORDER BY timestamp DESC`,
      [req.user.id]
    );

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LGPD_EXPORTACAO', 'Membro exportou seus dados']
    );

    res.json({
      mensagem: 'Seus dados completos conforme o Art. 18 da LGPD',
      dados_pessoais: dados,
      historico_auditoria: logs,
      data_exportacao: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/lgpd/solicitar-exclusao — Anonimiza a conta ──
router.delete('/solicitar-exclusao', authMiddleware, async (req, res, next) => {
  try {
    await pool.query(`
      UPDATE membros SET
        nome_completo = 'USUÁRIO EXCLUÍDO',
        email = 'excluido_' || id::text || '@removido.local',
        senha_hash = 'REMOVED',
        telefone = null, data_nascimento = null, genero = null, cpf = null, estado_civil = null,
        endereco_rua = null, endereco_numero = null, endereco_bairro = null,
        endereco_cidade = null, endereco_estado = null, endereco_cep = null,
        nome_conjuge = null, data_casamento = null, filhos = null, qtd_filhos = 0,
        data_conversao = null, data_batismo = null, ministerio = null, funcao_igreja = null,
        igreja_anterior = null, dons_espirituais = null, testemunho = null,
        emergencia_nome = null, emergencia_telefone = null, emergencia_parentesco = null,
        instagram = null, facebook = null, foto_perfil = null,
        status = 'excluido', atualizado_em = NOW()
      WHERE id = $1
    `, [req.user.id]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LGPD_EXCLUSAO', 'Membro solicitou exclusão de dados']
    );

    res.json({ sucesso: true, mensagem: 'Dados anonizados. Sua conta foi excluída conforme a LGPD.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
