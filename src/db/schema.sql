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

-- ── Tabela: site_conteudo — conteúdo dinâmico do site/dashboard ──
CREATE TABLE IF NOT EXISTS site_conteudo (
  id          SERIAL PRIMARY KEY,
  secao       VARCHAR(50) NOT NULL UNIQUE,
  dados       JSONB NOT NULL DEFAULT '{}',
  atualizado_por UUID REFERENCES membros(id) ON DELETE SET NULL,
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed inicial das seções de conteúdo
INSERT INTO site_conteudo (secao, dados)
SELECT 'cultos', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('dia','Domingo','hora','18:00','nome','Escola Bíblica Dominical','desc','Estudo da Palavra para todas as idades'),
    jsonb_build_object('dia','Domingo','hora','19:15','nome','Culto de Louvor e Adoração','desc','Culto principal com mensagem e louvor'),
    jsonb_build_object('dia','Quarta-feira','hora','19:30','nome','Culto de Libertação','desc','Oração, libertação e cura interior'),
    jsonb_build_object('dia','Sexta-feira','hora','19:30','nome','Culto de Oração','desc','Mural de oração e intercessão')
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'cultos');

INSERT INTO site_conteudo (secao, dados)
SELECT 'eventos', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('dia',5,'mes','JUL','nome','Reunião de Líderes de Ministério','desc','Reunião estratégica com todos os líderes.','hora','19:00h · Templo Sede'),
    jsonb_build_object('dia',12,'mes','JUL','nome','Acampa Somos Um','desc','Acampamento de jovens. R$ 150,00.','hora','Inscrições na secretaria'),
    jsonb_build_object('dia',19,'mes','JUL','nome','Encontro de Casais','desc','Dia especial para casais.','hora','09:00h às 17:00h'),
    jsonb_build_object('dia',26,'mes','JUL','nome','Batismo nas Águas','desc','Celebração de batismo.','hora','16:00h · Templo Sede')
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'eventos');

INSERT INTO site_conteudo (secao, dados)
SELECT 'avisos', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('titulo','Reunião de Líderes','texto','Todos os líderes devem comparecer.','data','02/07/2026','tipo','urgente'),
    jsonb_build_object('titulo','Acampa Somos Um','texto','Inscrições abertas! Vagas limitadas.','data','01/07/2026','tipo','evento'),
    jsonb_build_object('titulo','Batismo nas Águas','texto','Inscrições abertas para novos convertidos.','data','28/06/2026','tipo','geral')
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'avisos');

INSERT INTO site_conteudo (secao, dados)
SELECT 'devocionais', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('data','Quinta, 2 de Julho','titulo','O Poder da Persistência em Oração','verso','Pedis e dar-se-vos-á.','ref','Lucas 11:9','texto','Jesus nos ensina que a oração é um estilo de vida.'),
    jsonb_build_object('data','Quarta, 1 de Julho','titulo','Gratidão em Todas as Circunstâncias','verso','Em tudo dai graças.','ref','1 Ts 5:18','texto','A gratidão é uma escolha diária.')
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'devocionais');

INSERT INTO site_conteudo (secao, dados)
SELECT 'estudos', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('titulo','O Sermão do Monte','autor','Pr. Responsável','data','28/06/2026','duracao','45 min','tipo','Vídeo + PDF','resumo','Estudo sobre as bem-aventuranças.','tags',jsonb_build_array('Mateus','Ensino')),
    jsonb_build_object('titulo','Vida de Oração','autor','Pr. Responsável','data','21/06/2026','duracao','38 min','tipo','Áudio + PDF','resumo','Como desenvolver uma vida de oração.','tags',jsonb_build_array('Oração','Vida Cristã'))
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'estudos');

INSERT INTO site_conteudo (secao, dados)
SELECT 'escalas', jsonb_build_object(
  'itens', jsonb_build_array(
    jsonb_build_object('data','07/07','culto','Culto de Adoração','funcao','Louvor','responsavel','Ministério de Louvor'),
    jsonb_build_object('data','10/07','culto','Culto de Libertação','funcao','Palavra','responsavel','Pr. Responsável'),
    jsonb_build_object('data','14/07','culto','Culto de Oração','funcao','Intercessão','responsavel','Ministério de Intercessão')
  )
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'escalas');

INSERT INTO site_conteudo (secao, dados)
SELECT 'config_igreja', jsonb_build_object(
  'horario_atendimento', 'Segunda a Sexta: 08h às 12h e 14h às 18h',
  'endereco', 'R. Felipe dos Santos, 461 - Centro, Betim - MG',
  'cep', '32600-126',
  'telefone_igreja', '(31) 0000-0000',
  'email_igreja', 'contato@missaoreviver.com.br',
  'pix_key', 'missaoreviver@igreja.com.br'
)
WHERE NOT EXISTS (SELECT 1 FROM site_conteudo WHERE secao = 'config_igreja');

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
CREATE INDEX IF NOT EXISTS idx_site_conteudo_secao ON site_conteudo(secao);
