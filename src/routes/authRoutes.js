// ═══════════════════════════════════════════════════════════
//  authRoutes.js — Registro, Login, Logout
// ═══════════════════════════════════════════════════════════

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getPool } = require('../db/init');
const { JWT_SECRET } = require('../middleware/auth');

// ── POST /api/auth/registro ──
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    const pool = getPool();
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, data_nascimento, telefone)
       VALUES ($1, $2, $3, 'membro', $4, $5)
       RETURNING id, nome, email, role, data_nascimento, telefone, foto_url;`,
      [nome.trim(), email.toLowerCase().trim(), hash, data_nascimento || null, telefone || null]
    );

    const usuario = result.rows[0];
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Registra acesso
    await pool.query('INSERT INTO acessos_log (usuario_id) VALUES ($1)', [usuario.id]);

    return res.status(201).json({ token, usuario });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ erro: 'Erro ao registrar usuário.' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const pool = getPool();
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND ativo = TRUE', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Registra acesso
    await pool.query('INSERT INTO acessos_log (usuario_id) VALUES ($1)', [usuario.id]);

    const usuarioSemSenha = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      data_nascimento: usuario.data_nascimento,
      telefone: usuario.telefone,
      endereco: usuario.endereco,
      cidade: usuario.cidade,
      estado: usuario.estado,
      foto_url: usuario.foto_url,
    };

    return res.status(200).json({ token, usuario: usuarioSemSenha });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
});

// ── GET /api/auth/verificar — valida token e retorna dados do usuário ──
router.get('/verificar', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, nome, email, role, data_nascimento, telefone, endereco, cidade, estado, foto_url
       FROM usuarios WHERE id = $1 AND ativo = TRUE`,
      [payload.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo.' });
    }

    return res.status(200).json({ usuario: result.rows[0] });
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
});

module.exports = router;
