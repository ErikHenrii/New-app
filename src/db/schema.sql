-- ═══════════════════════════════════════════════════════════
--  SCHEMA — Missão Reviver (PostgreSQL)
--  Executa automaticamente no primeiro deploy via db/init.js
-- ═══════════════════════════════════════════════════════════

-- ── Tabela: membros ──
CREATE TABLE IF NOT EXISTS membros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo   VARCHAR(150) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL,
  telefone        VARCHAR(20),

  -- Dados pessoais
  data_nascimento DATE,
  genero          VARCHAR(20),
  cpf             VARCHAR(14),
  estado_civil    VARCHAR(20),

  -- Endereço
  endereco_rua    VARCHAR(200),
  endereco_numero VARCHAR(20),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_estado VARCHAR(2),
  endereco_cep    VARCHAR(10),

  -- Família
  nome_conjuge    VARCHAR(100),
  data_casamento  DATE,
  filhos          TEXT,
  qtd_filhos      INTEGER DEFAULT 0,

  -- Vida espiritual
  data_conversao  DATE,
  data_batismo    DATE,
  ministerio      VARCHAR(50),
  funcao_igreja   VARCHAR(50),
  igreja_anterior VARCHAR(150),
  dons_espirituais TEXT,
  testemunho      TEXT,

  -- Contato de emergência
  emergencia_nome       VARCHAR(100),
  emergencia_telefone   VARCHAR(20),
  emergencia_parentesco VARCHAR(50),

  -- Redes sociais
  instagram       VARCHAR(100),
  facebook        VARCHAR(100),

  -- Preferências
  notificar_email        BOOLEAN DEFAULT true,
  notificar_whatsapp     BOOLEAN DEFAULT true,
  participar_aniversarios BOOLEAN DEFAULT true,

  -- Foto (base64)
  foto_perfil     TEXT,

  -- Metadados
  role            VARCHAR(10) NOT NULL DEFAULT 'membro',
  status          VARCHAR(10) NOT NULL DEFAULT 'ativo',
  perfil_completo BOOLEAN DEFAULT false,
  ultimo_acesso   TIMESTAMP,
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Tabela: auditoria ──
CREATE TABLE IF NOT EXISTS auditoria (
  id         SERIAL PRIMARY KEY,
  membro_id  UUID REFERENCES membros(id) ON DELETE SET NULL,
  acao       VARCHAR(50) NOT NULL,
  detalhes   TEXT,
  timestamp  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Tabela: liderancas ──
CREATE TABLE IF NOT EXISTS liderancas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(150) NOT NULL,
  cargo       VARCHAR(100) NOT NULL,
  descricao   TEXT,
  telefone    VARCHAR(20),
  email       VARCHAR(255),
  foto        TEXT,
  ordem       INTEGER DEFAULT 0,
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Seed: Lideranças iniciais ──
INSERT INTO liderancas (nome, cargo, descricao, ordem)
SELECT * FROM (VALUES
  ('Pastor', 'Pastor Presidente', 'Líder espiritual da igreja', 1),
  ('Ancião', 'Ancião', 'Liderança administrativa', 2),
  ('Diácono', 'Diácono', 'Serviço e apoio à comunidade', 3)
) AS t(nome, cargo, descricao, ordem)
WHERE NOT EXISTS (SELECT 1 FROM liderancas LIMIT 1);

-- ── Índices ──
CREATE INDEX IF NOT EXISTS idx_membros_email ON membros(email);
CREATE INDEX IF NOT EXISTS idx_membros_status ON membros(status);
CREATE INDEX IF NOT EXISTS idx_membros_role ON membros(role);
CREATE INDEX IF NOT EXISTS idx_membros_data_nascimento ON membros(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_auditoria_membro_id ON auditoria(membro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria(timestamp);
CREATE INDEX IF NOT EXISTS idx_liderancas_ativo ON liderancas(ativo);
