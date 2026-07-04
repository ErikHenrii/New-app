// ═══════════════════════════════════════════════════════════
//  init.js — Inicialização do banco PostgreSQL
// ═══════════════════════════════════════════════════════════

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function initDatabase() {
  const client = await getPool().connect();

  try {
    // ── Tabela: usuarios ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id            SERIAL PRIMARY KEY,
        nome          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        senha_hash    TEXT NOT NULL,
        role          VARCHAR(20) NOT NULL DEFAULT 'membro',
        data_nascimento DATE,
        telefone      VARCHAR(30),
        endereco      VARCHAR(255),
        cidade        VARCHAR(100),
        estado        VARCHAR(2),
        foto_url      TEXT,
        ativo         BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Tabela: conteudo (seções editáveis pelo admin) ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS conteudo (
        id          SERIAL PRIMARY KEY,
        secao       VARCHAR(100) UNIQUE NOT NULL,
        dados       JSONB NOT NULL DEFAULT '{}',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by  INTEGER REFERENCES usuarios(id)
      );
    `);

    // ── Tabela: acessos_log (para estatísticas de "Acessos Hoje") ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS acessos_log (
        id            SERIAL PRIMARY KEY,
        usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        data_acesso   DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Tabela: liderancas ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS liderancas (
        id          SERIAL PRIMARY KEY,
        nome        VARCHAR(255) NOT NULL,
        cargo       VARCHAR(255) NOT NULL,
        descricao   TEXT,
        foto_url    TEXT,
        ordem       INTEGER NOT NULL DEFAULT 0,
        ativo       BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Índices ──
    await client.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_conteudo_secao ON conteudo(secao);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_acessos_data ON acessos_log(data_acesso);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_acessos_usuario ON acessos_log(usuario_id);`);

    // ── Seed: conteúdo padrão das seções ──
    const secoesPadrao = {
      agenda: {
        titulo: 'Agenda de Eventos',
        eventos: [
          { titulo: 'Culto de Celebração', data: '2026-07-05', horario: '19:00', local: 'Templo Sede' },
          { titulo: 'Reunião de Oração', data: '2026-07-10', horario: '20:00', local: 'Templo Sede' },
        ],
      },
      estudos: {
        titulo: 'Estudos Bíblicos',
        texto: 'Junte-se a nós para aprofundar seu conhecimento da Palavra de Deus.',
        itens: [],
      },
      oracao: {
        titulo: 'Pedido de Oração',
        texto: 'Compartilhe seus pedidos de oração com nossa equipe pastoral.',
        itens: [],
      },
      ministerios: {
        titulo: 'Nossos Ministérios',
        texto: 'Conheça os ministérios disponíveis em nossa comunidade.',
        itens: [],
      },
      avisos: {
        titulo: 'Avisos da Semana',
        texto: 'Fique por dentro dos comunicados importantes da comunidade.',
        itens: [],
      },
      dizimos: {
        titulo: 'Dízimos e Ofertas',
        texto: 'Sua contribuição sustenta a obra de Deus em nossa comunidade.',
        itens: [],
      },
      galeria: {
        titulo: 'Galeria de Fotos',
        texto: 'Momentos especiais da nossa comunidade.',
        fotos: [],
      },
      devocional: {
        titulo: 'Devocional',
        texto: 'Uma palavra de fé para o seu dia.',
        itens: [],
      },
      escalas: {
        titulo: 'Escalas de Serviço',
        texto: 'Confira as escalas dos proximos cultos e eventos.',
        itens: [],
      },
      contato_pastoral: {
        titulo: 'Contato Pastoral',
        texto: 'Nossa equipe pastoral está disponível para atendê-lo.',
        telefone: '(00) 0000-0000',
        email: 'pastoral@missaoreviver.com.br',
      },
      horario_atendimento: {
        titulo: 'Horário de Atendimento',
        texto: 'Segunda a Sexta: 08h às 12h e 14h às 18h\nSábado: 08h às 12h\nDomingo: Fechado',
      },
    };

    for (const [secao, dados] of Object.entries(secoesPadrao)) {
      await client.query(
        `INSERT INTO conteudo (secao, dados)
         VALUES ($1, $2)
         ON CONFLICT (secao) DO NOTHING;`,
        [secao, JSON.stringify(dados)]
      );
    }

    // ── Seed: admin inicial ──
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@missaoreviver.com.br';
    const adminSenha = process.env.ADMIN_SENHA || 'Reviver@Admin2026';
    const adminNome = process.env.ADMIN_NOME || 'Administrador';

    const adminExiste = await client.query('SELECT id FROM usuarios WHERE email = $1', [adminEmail]);
    if (adminExiste.rows.length === 0) {
      const hash = await bcrypt.hash(adminSenha, 10);
      await client.query(
        `INSERT INTO usuarios (nome, email, senha_hash, role)
         VALUES ($1, $2, $3, 'admin');`,
        [adminNome, adminEmail, hash]
      );
      console.log(`✅ Admin inicial criado: ${adminEmail}`);
    }

    global.bancoPronto = true;
    console.log('📊 Esquema do banco verificado/criado com sucesso.');
  } finally {
    client.release();
  }
}

module.exports = initDatabase;
module.exports.getPool = getPool;
