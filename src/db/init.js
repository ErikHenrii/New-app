// ═══════════════════════════════════════════════════════════
//  db/init.js — Inicializa o banco (cria tabelas + admin inicial)
//  Executado automaticamente no startup do server.js
// ═══════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function initDatabase() {
  const client = await pool.connect();
  try {
    // 1. Executa o schema.sql
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tabelas verificadas/criadas');

    // 2. Cria admin inicial se não existir
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@missaoreviver.com.br';
    const adminNome = process.env.ADMIN_NOME || 'Administrador';
    const adminSenha = process.env.ADMIN_SENHA || 'Reviver@Admin2026';

    const { rows } = await client.query('SELECT id FROM membros WHERE email = $1', [adminEmail.toLowerCase()]);
    if (rows.length === 0) {
      const senhaHash = await bcrypt.hash(adminSenha, 12);
      const id = uuidv4();
      await client.query(`
        INSERT INTO membros (id, nome_completo, email, senha_hash, role, status, perfil_completo)
        VALUES ($1, $2, $3, $4, 'admin', 'ativo', true)
      `, [id, adminNome, adminEmail.toLowerCase(), senhaHash]);
      console.log('✅ Admin inicial criado:', adminEmail);
    } else {
      console.log('ℹ️  Admin já existe:', adminEmail);
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar banco:', err.message);
    // Não derruba o servidor — tenta de novo na próxima requisição
  } finally {
    client.release();
  }
}

module.exports = initDatabase;
