// ═══════════════════════════════════════════════════════════
//  routes/authRoutes.js — Registro, Login, Logout, Sessão
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { hashSenha, verificarSenha } = require('../utils/crypto');
const { validarEmail, validarSenha, validarNome } = require('../utils/validation');
const { authMiddleware, gerarToken } = require('../middleware/auth');

// ── Rate limit específico para login (mais restritivo) ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// ── POST /api/auth/registrar ──
router.post('/registrar', async (req, res, next) => {
  try {
    const {
      nome_completo, email, senha, consentimento,
      telefone, data_nascimento, genero, cpf, estado_civil,
      endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
      nome_conjuge, data_casamento, filhos, qtd_filhos,
      data_conversao, data_batismo, ministerio, funcao_igreja, igreja_anterior, dons_espirituais,
      emergencia_nome, emergencia_telefone, emergencia_parentesco,
      instagram, facebook,
      notificar_email, notificar_whatsapp, participar_aniversarios,
      testemunho,
    } = req.body;

    // Validações
    if (!validarNome(nome_completo)) return res.status(400).json({ erro: 'Nome deve ter ao menos 3 caracteres' });
    if (!validarEmail(email)) return res.status(400).json({ erro: 'E-mail inválido' });
    if (!validarSenha(senha)) return res.status(400).json({ erro: 'Senha deve ter ao menos 6 caracteres' });
    if (!consentimento) return res.status(400).json({ erro: 'É necessário aceitar a política de privacidade' });

    const emailLower = email.toLowerCase().trim();

    // Verifica se e-mail já existe
    const { rows: existentes } = await pool.query('SELECT id FROM membros WHERE email = $1', [emailLower]);
    if (existentes.length > 0) return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });

    // Cria o membro
    const id = uuidv4();
    const senhaHash = await hashSenha(senha);
    const agora = new Date();

    await pool.query(`
      INSERT INTO membros (
        id, nome_completo, email, senha_hash, telefone,
        data_nascimento, genero, cpf, estado_civil,
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        nome_conjuge, data_casamento, filhos, qtd_filhos,
        data_conversao, data_batismo, ministerio, funcao_igreja, igreja_anterior, dons_espirituais,
        emergencia_nome, emergencia_telefone, emergencia_parentesco,
        instagram, facebook,
        notificar_email, notificar_whatsapp, participar_aniversarios,
        testemunho, role, status, perfil_completo, criado_em, atualizado_em
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'membro','ativo',false,$35,$35
      )
    `, [
      id, nome_completo.trim(), emailLower, senhaHash, telefone || null,
      data_nascimento || null, genero || null, cpf || null, estado_civil || null,
      endereco_rua || null, endereco_numero || null, endereco_bairro || null,
      endereco_cidade || null, endereco_estado || null, endereco_cep || null,
      nome_conjuge || null, data_casamento || null, filhos || null, qtd_filhos || 0,
      data_conversao || null, data_batismo || null, ministerio || null,
      funcao_igreja || null, igreja_anterior || null, dons_espirituais || null,
      emergencia_nome || null, emergencia_telefone || null, emergencia_parentesco || null,
      instagram || null, facebook || null,
      notificar_email !== false, notificar_whatsapp !== false, participar_aniversarios !== false,
      testemunho || null, agora,
    ]);

    // Auditoria
    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [id, 'CADASTRO_REALIZADO', `Novo cadastro: ${emailLower}`]
    );

    // Gera token de sessão
    const token = gerarToken({ id, email: emailLower, role: 'membro' });

    // Atualiza último acesso
    await pool.query('UPDATE membros SET ultimo_acesso = NOW() WHERE id = $1', [id]);

    res.status(201).json({
      sucesso: true,
      token,
      membro: { id, nome_completo: nome_completo.trim(), email: emailLower, role: 'membro' },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });

    const emailLower = email.toLowerCase().trim();

    const { rows } = await pool.query(
      'SELECT id, nome_completo, email, senha_hash, role, status FROM membros WHERE email = $1',
      [emailLower]
    );

    if (rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });

    const membro = rows[0];
    if (membro.status !== 'ativo') return res.status(403).json({ erro: 'Conta inativa. Contate um administrador.' });

    const senhaOk = await verificarSenha(senha, membro.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });

    // Atualiza último acesso
    await pool.query('UPDATE membros SET ultimo_acesso = NOW(), atualizado_em = NOW() WHERE id = $1', [membro.id]);

    // Auditoria
    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [membro.id, 'LOGIN_SUCESSO', `Login realizado`]
    );

    const token = gerarToken(membro);

    res.json({
      sucesso: true,
      token,
      membro: {
        id: membro.id,
        nome_completo: membro.nome_completo,
        email: membro.email,
        role: membro.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ──
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'LOGOUT', 'Logout manual']
    );
    res.json({ sucesso: true, mensagem: 'Logout realizado' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/sessao — Verifica token e retorna dados do usuário ──
router.get('/sessao', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome_completo, email, role, status, perfil_completo, foto_perfil FROM membros WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });

    res.json({
      autenticado: true,
      membro: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
