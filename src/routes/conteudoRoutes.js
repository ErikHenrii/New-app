// ═══════════════════════════════════════════════════════════
//  conteudoRoutes.js — BUG #4 e #5
//  Bug #4: Rotas GET (público) e PUT (admin) para todas as seções
//  Bug #5: Rota para horário de atendimento
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth, exigeAdmin } = require('../middleware/auth');

// ── Lista de seções válidas ──
const SECOES_VALIDAS = [
  'agenda',
  'estudos',
  'oracao',
  'ministerios',
  'avisos',
  'dizimos',
  'galeria',
  'devocional',
  'escalas',
  'contato_pastoral',
  'horario_atendimento', // BUG #5: nova seção
];

// ── GET /api/conteudo — retorna todas as seções (público) ──
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT secao, dados FROM conteudo ORDER BY secao ASC;');

    const conteudo = {};
    for (const row of result.rows) {
      conteudo[row.secao] = row.dados;
    }

    return res.status(200).json(conteudo);
  } catch (err) {
    // Se o banco não estiver pronto, retorna conteúdo padrão vazio
    console.error('Erro ao buscar conteúdo:', err);
    return res.status(200).json({});
  }
});

// ── GET /api/conteudo/:secao — retorna uma seção específica (público) ──
router.get('/:secao', async (req, res) => {
  try {
    const { secao } = req.params;

    if (!SECOES_VALIDAS.includes(secao)) {
      return res.status(404).json({ erro: 'Seção não encontrada.' });
    }

    const pool = getPool();
    const result = await pool.query('SELECT dados FROM conteudo WHERE secao = $1;', [secao]);

    if (result.rows.length === 0) {
      return res.status(200).json({ secao, dados: {} });
    }

    return res.status(200).json({ secao, dados: result.rows[0].dados });
  } catch (err) {
    console.error('Erro ao buscar seção:', err);
    return res.status(500).json({ erro: 'Erro ao buscar conteúdo.' });
  }
});

// ── PUT /api/conteudo/:secao — BUG #4 CORRIGIDO: salva edição do admin ──
router.put('/:secao', exigeAuth, exigeAdmin, async (req, res) => {
  try {
    const { secao } = req.params;
    const { dados } = req.body;

    if (!SECOES_VALIDAS.includes(secao)) {
      return res.status(404).json({ erro: 'Seção não encontrada.' });
    }

    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ erro: 'Campo "dados" é obrigatório e deve ser um objeto.' });
    }

    const pool = getPool();

    // Upsert: insere se não existe, atualiza se existe
    const result = await pool.query(
      `INSERT INTO conteudo (secao, dados, updated_at, updated_by)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (secao)
       DO UPDATE SET dados = $2, updated_at = NOW(), updated_by = $3
       RETURNING secao, dados, updated_at;`,
      [secao, JSON.stringify(dados), req.usuario.id]
    );

    return res.status(200).json({
      mensagem: 'Conteúdo atualizado com sucesso!',
      secao: result.rows[0].secao,
      dados: result.rows[0].dados,
      updated_at: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error('Erro ao salvar conteúdo:', err);
    return res.status(500).json({ erro: 'Erro ao salvar conteúdo.' });
  }
});

module.exports = router;
