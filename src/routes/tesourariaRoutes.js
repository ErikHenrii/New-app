// routes/tesourariaRoutes.js - Gestao Financeira da Igreja
// CRUD de transacoes (entradas e saidas) + relatorios

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// -- Auto-criar tabela se nao existir (self-healing) --
let tabelaVerificada = false;
async function garantirTabela() {
  if (tabelaVerificada) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacoes_financeiras (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo            VARCHAR(10) NOT NULL,
        categoria       VARCHAR(50) NOT NULL,
        descricao       VARCHAR(255) NOT NULL,
        valor           DECIMAL(10,2) NOT NULL,
        data_transacao  DATE NOT NULL,
        forma_pagamento VARCHAR(30),
        referencia      VARCHAR(100),
        observacoes     TEXT,
        registrado_por  UUID REFERENCES membros(id) ON DELETE SET NULL,
        criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
        atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes_financeiras(tipo)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes_financeiras(data_transacao)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes_financeiras(categoria)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transacoes_referencia ON transacoes_financeiras(referencia)');
    tabelaVerificada = true;
  } catch (e) {
    console.error('Erro ao criar tabela transacoes_financeiras:', e.message);
  }
}

// -- GET /api/tesouraria - Lista todas as transacoes --
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { tipo, categoria, mes_ref, limite } = req.query;
    let query = 'SELECT * FROM transacoes_financeiras WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (tipo) {
      query += ` AND tipo = $${paramIdx++}`;
      params.push(tipo);
    }
    if (categoria) {
      query += ` AND categoria = $${paramIdx++}`;
      params.push(categoria);
    }
    if (mes_ref) {
      query += ` AND referencia = $${paramIdx++}`;
      params.push(mes_ref);
    }

    query += ' ORDER BY data_transacao DESC, criado_em DESC';

    if (limite) {
      query += ` LIMIT $${paramIdx++}`;
      params.push(parseInt(limite));
    }

    const { rows } = await pool.query(query, params);
    res.json({ transacoes: rows });
  } catch (err) { next(err); }
});

// -- GET /api/tesouraria/resumo - Resumo financeiro --
router.get('/resumo', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { mes_ref } = req.query;

    let whereClause = '';
    const params = [];
    if (mes_ref) {
      whereClause = 'WHERE referencia = $1';
      params.push(mes_ref);
    }

    const { rows: totais } = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS total_saidas,
        COUNT(*) FILTER (WHERE tipo = 'entrada') AS num_entradas,
        COUNT(*) FILTER (WHERE tipo = 'saida') AS num_saidas
      FROM transacoes_financeiras ${whereClause}
    `, params);

    const { rows: porCategoria } = await pool.query(`
      SELECT
        categoria,
        tipo,
        SUM(valor) as total,
        COUNT(*) as quantidade
      FROM transacoes_financeiras ${whereClause}
      GROUP BY categoria, tipo
      ORDER BY tipo, total DESC
    `, params);

    const { rows: recentes } = await pool.query(`
      SELECT * FROM transacoes_financeiras ${whereClause}
      ORDER BY data_transacao DESC, criado_em DESC
      LIMIT 5
    `, params);

    const saldo = (totais[0]?.total_entradas || 0) - (totais[0]?.total_saidas || 0);

    res.json({
      total_entradas: parseFloat(totais[0]?.total_entradas || 0),
      total_saidas: parseFloat(totais[0]?.total_saidas || 0),
      saldo: parseFloat(saldo),
      num_entradas: parseInt(totais[0]?.num_entradas || 0),
      num_saidas: parseInt(totais[0]?.num_saidas || 0),
      por_categoria: porCategoria.map(c => ({
        categoria: c.categoria,
        tipo: c.tipo,
        total: parseFloat(c.total),
        quantidade: parseInt(c.quantidade)
      })),
      recentes: recentes
    });
  } catch (err) { next(err); }
});

// -- POST /api/tesouraria - Registra nova transacao --
router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes } = req.body;

    if (!tipo || !['entrada', 'saida'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo deve ser "entrada" ou "saida"' });
    }
    if (!categoria || !descricao || !valor || !data_transacao) {
      return res.status(400).json({ erro: 'Campos obrigatorios: tipo, categoria, descricao, valor, data_transacao' });
    }

    const { rows } = await pool.query(`
      INSERT INTO transacoes_financeiras
        (tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes, registrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      tipo,
      categoria,
      descricao,
      parseFloat(valor),
      data_transacao,
      forma_pagamento || null,
      referencia || null,
      observacoes || null,
      req.user.id
    ]);

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'TESOURARIA_CREATE', tipo + ' R$ ' + valor + ' - ' + categoria + ': ' + descricao]
    );

    res.status(201).json({ sucesso: true, transacao: rows[0] });
  } catch (err) { next(err); }
});

// -- PUT /api/tesouraria/:id - Atualiza transacao --
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { id } = req.params;
    const { tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes } = req.body;

    const { rows } = await pool.query(`
      UPDATE transacoes_financeiras SET
        tipo = COALESCE($1, tipo),
        categoria = COALESCE($2, categoria),
        descricao = COALESCE($3, descricao),
        valor = COALESCE($4, valor),
        data_transacao = COALESCE($5, data_transacao),
        forma_pagamento = COALESCE($6, forma_pagamento),
        referencia = COALESCE($7, referencia),
        observacoes = COALESCE($8, observacoes),
        atualizado_em = NOW()
      WHERE id = $9
      RETURNING *
    `, [tipo, categoria, descricao, valor ? parseFloat(valor) : null, data_transacao, forma_pagamento, referencia, observacoes, id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Transacao nao encontrada' });
    }

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'TESOURARIA_UPDATE', 'Atualizou transacao ' + id]
    );

    res.json({ sucesso: true, transacao: rows[0] });
  } catch (err) { next(err); }
});

// -- DELETE /api/tesouraria/:id - Remove transacao --
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM transacoes_financeiras WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ erro: 'Transacao nao encontrada' });
    }

    await pool.query(
      'INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
      [req.user.id, 'TESOURARIA_DELETE', 'Removeu transacao ' + id]
    );

    res.json({ sucesso: true, mensagem: 'Transacao removida' });
  } catch (err) { next(err); }
});

module.exports = router;
