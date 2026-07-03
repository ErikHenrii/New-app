// ═══════════════════════════════════════════════════════════
//  db/init.js — Inicializa o banco (cria tabelas + admin inicial)
//  Executado automaticamente no startup do server.js
// ═══════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Estado global — outras partes do código podem checar se o banco está pronto
global.bancoPronto = false;

async function initDatabase() {
  // Verifica se DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida! Crie um PostgreSQL no Render e copie a Internal Database URL para a variável de ambiente DATABASE_URL.');
  }

  console.log('📊 DATABASE_URL encontrada (primeiros 30 chars):', process.env.DATABASE_URL.substring(0, 30) + '...');

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

    global.bancoPronto = true;
    console.log('✅ Banco de dados totalmente operacional!');
  } finally {
    client.release();
  }
}

module.exports = initDatabase;
