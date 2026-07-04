// ═══════════════════════════════════════════════════════════
//  routes/adminRoutes.js — Painel administrativo
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { hashSenha } = require('../utils/crypto');
const { validarEmail, validarSenha, validarNome } = require('../utils/validation');

// Todas as rotas exigem auth + admin
router.use(authMiddleware, adminOnly);

// ── GET /api/admin/stats — Dashboard do admin ──
router.get('/stats', async (req, res, next) => {
  try {
    const [totalMembros, ativos, admins, hojeLogins, pendentes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM membros'),
      pool.query("SELECT COUNT(*) FROM membros WHERE status = 'ativo'"),
      pool.query("SELECT COUNT(*) FROM membros WHERE role = 'admin'"),
      pool.query("SELECT COUNT(*) FROM membros WHERE ultimo_acesso::date = CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM membros WHERE perfil_completo = false"),
    ]);

    res.json({
      total_membros: parseInt(totalMembros.rows[0].count),
      ativos: parseInt(ativos.rows[0].count),
      admins: parseInt(admins.rows[0].count),
      logins_hoje: parseInt(hojeLogins.rows[0].count),
      perfil_incompleto: parseInt(pendentes.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/usuarios — Lista todos os membros ──
router.get('/usuarios', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nome_completo, email, telefone, role, status, perfil_completo,
             data_nascimento, endereco_cidade, endereco_estado, ministerio,
             ultimo_acesso, criado_em, foto_perfil
      FROM membros
      ORDER BY criado_em DESC
    `);

    res.json({ usuarios: rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/usuarios/:id — Ver membro específico ──
router.get('/usuarios/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM membros WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Membro não encontrado' });

    const membro = rows[0];
    delete membro.senha_hash;

    // Busca auditoria do membro
    const { rows: logs } = await pool.query(
      `SELECT acao, detalhes, timestamp FROM auditoria WHERE membro_id = $1 ORDER BY timestamp DESC LIMIT 50`,
      [req.params.id]
    );

    res.json({ membro, auditoria: logs });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/usuarios — Admin cria novo membro ──
router.post('/usuarios', async (req, res, next) => {
  try {
    const { nome_completo, email, senha, telefone, role } = req.body;

    if (!validarNome(nome_completo)) return res.status(400).json({ erro: 'Nome inválido' });
    if (!validarEmail(email)) return res.status(400).json({ erro: 'E-mail inválido' });
    if (!validarSenha(senha)) return res.status(400).json({ erro: 'Senha deve ter ao menos 6 caracteres' });
    if (role && !['membro', 'admin'].includes(role)) return res.status(400).json({ erro: 'Role inválido' });

    const emailLower = email.toLowerCase().trim();
    const { rows: existe } = await pool.query('SELECT id FROM membros WHERE email = $1', [emailLower]);
    if (existe.length > 0) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const id = uuidv4();
    const senhaHash = await hashSenha(senha);

    await pool.query(`
      INSERT INTO membros (id, nome_completo, email, senha_hash, telefone, role, status, perfil_completo)
      VALUES ($1, $2, $3, $4, $5, $6, 'ativo', false)
    `, [id, nome_completo.trim(), emailLower, senhaHash, telefone || null, role || 'membro']);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'ADMIN_CADASTRO', `Admin criou membro: ${emailLower}`]
    );

    res.status(201).json({ sucesso: true, id, mensagem: 'Membro criado com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/usuarios/:id — Admin atualiza membro ──
router.put('/usuarios/:id', async (req, res, next) => {
  try {
    const camposPermitidos = [
      'nome_completo', 'telefone', 'data_nascimento', 'genero', 'cpf', 'estado_civil',
      'endereco_rua', 'endereco_numero', 'endereco_bairro', 'endereco_cidade', 'endereco_estado', 'endereco_cep',
      'nome_conjuge', 'data_casamento', 'filhos', 'qtd_filhos',
      'data_conversao', 'data_batismo', 'ministerio', 'funcao_igreja', 'igreja_anterior', 'dons_espirituais',
      'emergencia_nome', 'emergencia_telefone', 'emergencia_parentesco',
      'instagram', 'facebook',
      'notificar_email', 'notificar_whatsapp', 'participar_aniversarios',
      'testemunho', 'foto_perfil', 'role', 'status',
    ];

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
      `UPDATE membros SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );

    if (result.rowCount === 0) return res.status(404).json({ erro: 'Membro não encontrado' });

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'ADMIN_ATUALIZOU', `Admin atualizou membro: ${req.params.id}`]
    );

    res.json({ sucesso: true, mensagem: 'Membro atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/usuarios/:id — Admin exclui/anonimiza membro (LGPD) ──
router.delete('/usuarios/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ erro: 'Você não pode excluir sua própria conta' });

    const { rows } = await pool.query('SELECT email FROM membros WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Membro não encontrado' });

    // Anonimiza os dados (LGPD — direito ao esquecimento)
    await pool.query(`
      UPDATE membros SET
        nome_completo = 'USUÁRIO EXCLUÍDO',
        email = 'excluido_' || $1 || '@removido.local',
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
    `, [req.params.id]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'ADMIN_EXCLUIU', `Admin excluiu/anonimizou membro: ${req.params.id}`]
    );

    res.json({ sucesso: true, mensagem: 'Membro excluído e dados anonimizados (LGPD)' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/auditoria — Logs de auditoria ──
router.get('/auditoria', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.acao, a.detalhes, a.timestamp, m.nome_completo
      FROM auditoria a
      LEFT JOIN membros m ON a.membro_id = m.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `);
    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/exportar-csv — Exporta membros em CSV ──
router.get('/exportar-csv', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT nome_completo, email, telefone, data_nascimento, genero, cpf, estado_civil,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
             nome_conjuge, data_casamento, filhos, qtd_filhos,
             data_conversao, data_batismo, ministerio, funcao_igreja, dons_espirituais,
             emergencia_nome, emergencia_telefone, emergencia_parentesco,
             instagram, facebook, role, status, criado_em
      FROM membros WHERE status != 'excluido'
      ORDER BY nome_completo
    `);

    const colunas = [
      'nome_completo','email','telefone','data_nascimento','genero','cpf','estado_civil',
      'endereco_rua','endereco_numero','endereco_bairro','endereco_cidade','endereco_estado','endereco_cep',
      'nome_conjuge','data_casamento','filhos','qtd_filhos',
      'data_conversao','data_batismo','ministerio','funcao_igreja','dons_espirituais',
      'emergencia_nome','emergencia_telefone','emergencia_parentesco',
      'instagram','facebook','role','status','criado_em'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
    };

    const csv = [
      colunas.join(','),
      ...rows.map(r => colunas.map(c => escapeCSV(r[c])).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=membros_reviver.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
