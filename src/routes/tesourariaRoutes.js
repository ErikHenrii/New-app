// routes/tesourariaRoutes.js - Gestao Financeira Completa da Igreja
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// -- Auto-criar tabela se nao existir --
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

// -- GET /api/tesouraria - Lista transacoes com filtros --
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { tipo, categoria, mes_ref, data_inicio, data_fim, limite } = req.query;
    let query = 'SELECT * FROM transacoes_financeiras WHERE 1=1';
    const params = [];
    let pi = 1;

    if (tipo) { query += ` AND tipo = $${pi++}`; params.push(tipo); }
    if (categoria) { query += ` AND categoria = $${pi++}`; params.push(categoria); }
    if (mes_ref) { query += ` AND referencia = $${pi++}`; params.push(mes_ref); }
    if (data_inicio) { query += ` AND data_transacao >= $${pi++}`; params.push(data_inicio); }
    if (data_fim) { query += ` AND data_transacao <= $${pi++}`; params.push(data_fim); }

    query += ' ORDER BY data_transacao DESC, criado_em DESC';
    if (limite) { query += ` LIMIT $${pi++}`; params.push(parseInt(limite)); }

    const { rows } = await pool.query(query, params);
    res.json({ transacoes: rows });
  } catch (err) { next(err); }
});

// -- GET /api/tesouraria/resumo - Dashboard financeiro completo --
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

    // Totais gerais
    const { rows: totais } = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS total_saidas,
        COUNT(*) FILTER (WHERE tipo = 'entrada') AS num_entradas,
        COUNT(*) FILTER (WHERE tipo = 'saida') AS num_saidas
      FROM transacoes_financeiras ${whereClause}
    `, params);

    // Breakdown por categoria
    const { rows: porCategoria } = await pool.query(`
      SELECT categoria, tipo, SUM(valor) as total, COUNT(*) as quantidade
      FROM transacoes_financeiras ${whereClause}
      GROUP BY categoria, tipo ORDER BY tipo, total DESC
    `, params);

    // Breakdown por forma de pagamento
    const { rows: porForma } = await pool.query(`
      SELECT forma_pagamento, tipo, SUM(valor) as total, COUNT(*) as quantidade
      FROM transacoes_financeiras ${whereClause}
      AND forma_pagamento IS NOT NULL
      GROUP BY forma_pagamento, tipo ORDER BY tipo, total DESC
    `, params);

    // Ultimas 10 transacoes
    const { rows: recentes } = await pool.query(`
      SELECT * FROM transacoes_financeiras ${whereClause}
      ORDER BY data_transacao DESC, criado_em DESC LIMIT 10
    `, params);

    // Comparativo ultimos 6 meses
    const { rows: mensal } = await pool.query(`
      SELECT
        to_char(data_transacao, 'YYYY-MM') as mes,
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
      FROM transacoes_financeiras
      WHERE data_transacao >= date_trunc('month', NOW()) - interval '5 months'
      GROUP BY to_char(data_transacao, 'YYYY-MM')
      ORDER BY mes
    `);

    // Saldo total (todas as transacoes, ignorando filtro)
    const { rows: saldoGeral } = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS total_saidas
      FROM transacoes_financeiras
    `);

    const saldo = (totais[0]?.total_entradas || 0) - (totais[0]?.total_saidas || 0);
    const saldoGeralValor = (saldoGeral[0]?.total_entradas || 0) - (saldoGeral[0]?.total_saidas || 0);

    res.json({
      total_entradas: parseFloat(totais[0]?.total_entradas || 0),
      total_saidas: parseFloat(totais[0]?.total_saidas || 0),
      saldo: parseFloat(saldo),
      saldo_geral: parseFloat(saldoGeralValor),
      num_entradas: parseInt(totais[0]?.num_entradas || 0),
      num_saidas: parseInt(totais[0]?.num_saidas || 0),
      por_categoria: porCategoria.map(c => ({
        categoria: c.categoria, tipo: c.tipo,
        total: parseFloat(c.total), quantidade: parseInt(c.quantidade)
      })),
      por_forma: porForma.map(f => ({
        forma_pagamento: f.forma_pagamento, tipo: f.tipo,
        total: parseFloat(f.total), quantidade: parseInt(f.quantidade)
      })),
      recentes: recentes,
      comparativo_mensal: mensal.map(m => ({
        mes: m.mes, entradas: parseFloat(m.entradas || 0), saidas: parseFloat(m.saidas || 0)
      }))
    });
  } catch (err) { next(err); }
});

// -- GET /api/tesouraria/exportar-csv - Exporta transacoes em CSV --
router.get('/exportar-csv', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { mes_ref } = req.query;
    let query = 'SELECT tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes, criado_em FROM transacoes_financeiras';
    const params = [];
    if (mes_ref) {
      query += ' WHERE referencia = $1';
      params.push(mes_ref);
    }
    query += ' ORDER BY data_transacao DESC';

    const { rows } = await pool.query(query, params);

    const csvHeader = 'Data,Tipo,Categoria,Descricao,Valor,Forma de Pagamento,Mes de Referencia,Observacoes\n';
    const csvRows = rows.map(r => {
      const data = new Date(r.data_transacao).toLocaleDateString('pt-BR');
      const tipo = r.tipo === 'entrada' ? 'Entrada' : 'Saida';
      const desc = (r.descricao || '').replace(/"/g, '""');
      const obs = (r.observacoes || '').replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${data}","${tipo}","${r.categoria}","${desc}","${r.valor}","${r.forma_pagamento || ''}","${r.referencia || ''}","${obs}"`;
    }).join('\n');

    const csv = '\ufeff' + csvHeader + csvRows; // BOM para Excel
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="tesouraria${mes_ref ? '_' + mes_ref : ''}.csv"`);
    res.send(csv);
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

    // Auto-gerar referencia se nao fornecida
    let ref = referencia;
    if (!ref && data_transacao) {
      ref = data_transacao.substring(0, 7); // YYYY-MM
    }

    const { rows } = await pool.query(`
      INSERT INTO transacoes_financeiras
        (tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes, registrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [tipo, categoria, descricao, parseFloat(valor), data_transacao, forma_pagamento || null, ref, observacoes || null, req.user.id]);

    try {
      await pool.query('INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
        [req.user.id, 'TESOURARIA_CREATE', tipo + ' R$ ' + valor + ' - ' + categoria + ': ' + descricao]);
    } catch(e) { /* auditoria opcional */ }

    res.status(201).json({ sucesso: true, transacao: rows[0] });
  } catch (err) { next(err); }
});

// -- PUT /api/tesouraria/:id - Atualiza transacao --
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { id } = req.params;
    const { tipo, categoria, descricao, valor, data_transacao, forma_pagamento, referencia, observacoes } = req.body;

    let ref = referencia;
    if (ref === undefined && data_transacao) {
      ref = data_transacao.substring(0, 7);
    }

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
      WHERE id = $9 RETURNING *
    `, [tipo, categoria, descricao, valor ? parseFloat(valor) : null, data_transacao, forma_pagamento, ref, observacoes, id]);

    if (rows.length === 0) return res.status(404).json({ erro: 'Transacao nao encontrada' });

    try {
      await pool.query('INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
        [req.user.id, 'TESOURARIA_UPDATE', 'Atualizou transacao ' + id]);
    } catch(e) {}

    res.json({ sucesso: true, transacao: rows[0] });
  } catch (err) { next(err); }
});

// -- DELETE /api/tesouraria/:id - Remove transacao --
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  await garantirTabela();
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM transacoes_financeiras WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ erro: 'Transacao nao encontrada' });

    try {
      await pool.query('INSERT INTO auditoria (membro_id, acao, detalhes) VALUES ($1, $2, $3)',
        [req.user.id, 'TESOURARIA_DELETE', 'Removeu transacao ' + id]);
    } catch(e) {}

    res.json({ sucesso: true, mensagem: 'Transacao removida' });
  } catch (err) { next(err); }
});

module.exports = router;
