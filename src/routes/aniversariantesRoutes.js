// ═══════════════════════════════════════════════════════════
//  aniversariantesRoutes.js — BUG #3: Cálculo de Idade
//  Calcula a idade exata no backend a partir da data_nascimento.
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth, exigeAdmin } = require('../middleware/auth');

// ── Helper: calcula idade a partir de data_nascimento (YYYY-MM-DD) ──
function calcularIdade(dataNasc) {
  if (!dataNasc) return null;

  const nasc = new Date(dataNasc);
  if (isNaN(nasc.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mesDiff = hoje.getMonth() - nasc.getMonth();
  const diaDiff = hoje.getDate() - nasc.getDate();

  // Se ainda não fez aniversário este ano, subtrai 1
  if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
    idade--;
  }

  return idade;
}

// ── Helper: formato de data legível em PT-BR ──
function formatarDataBR(data) {
  if (!data) return null;
  const d = new Date(data);
  if (isNaN(d.getTime())) return null;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

// ── GET /api/aniversariantes — lista aniversariantes do mês ──
// Query param: ?mes=7 (julho). Default: mês atual.
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const agora = new Date();
    const mes = req.query.mes ? parseInt(req.query.mes) : agora.getMonth() + 1;

    if (mes < 1 || mes > 12) {
      return res.status(400).json({ erro: 'Mês inválido. Use 1 a 12.' });
    }

    // Busca aniversariantes do mês informado
    const result = await pool.query(
      `SELECT id, nome, email, data_nascimento
       FROM usuarios
       WHERE ativo = TRUE
         AND data_nascimento IS NOT NULL
         AND EXTRACT(MONTH FROM data_nascimento) = $1
       ORDER BY EXTRACT(DAY FROM data_nascimento) ASC;`,
      [mes]
    );

    // BUG #3 CORRIGIDO: calcula idade exata no backend
    const aniversariantes = result.rows.map((pessoa) => {
      const dataNasc = pessoa.data_nascimento;
      return {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        data_nascimento: dataNasc,
        data_formatada: formatarDataBR(dataNasc),
        idade: calcularIdade(dataNasc), // ← idade calculada exata
        idade_texto: `${calcularIdade(dataNasc)} anos`,
      };
    });

    return res.status(200).json({
      mes,
      total: aniversariantes.length,
      aniversariantes,
    });
  } catch (err) {
    console.error('Erro ao buscar aniversariantes:', err);
    return res.status(500).json({ erro: 'Erro ao buscar aniversariantes.' });
  }
});

module.exports = router;
