/* ═══════════════════════════════════════════════════════════════════════
   MISSÃO REVIVER — DADOS DO DASHBOARD
   Conteúdo completo da área do membro
   ═══════════════════════════════════════════════════════════════════════ */

// ═════════════════════════════════════════════
//  DADOS DA IGREJA
// ═════════════════════════════════════════════

const IGREJA_DADOS = {

  // ── Cultos semanais ──
  cultos: [
    { dia: 'Domingo', horarios: [
      { hora: '18:00', nome: 'Escola Bíblica Dominical', desc: 'Estudo da Palavra para todas as idades' },
      { hora: '19:15', nome: 'Culto de Louvor e Adoração', desc: 'Culto principal com mensagem e louvor' }
    ]},
    { dia: 'Quarta-feira', horarios: [
      { hora: '19:30', nome: 'Culto de Libertação', desc: 'Oração, libertação e cura interior' }
    ]},
    { dia: 'Sexta-feira', horarios: [
      { hora: '19:30', nome: 'Culto de Oração', desc: 'Mural de oração e intercessão' }
    ]}
  ],

  // ── Eventos especiais (próximos) ──
  eventos: [
    { dia: 5, mes: 'JUL', nome: 'Reunião de Líderes de Ministério', desc: 'Reunião estratégica com todos os líderes. Presença obrigatória.', hora: '19:00h · Templo Sede' },
    { dia: 12, mes: 'JUL', nome: 'Acampa Somos Um — Inscrições Abertas', desc: 'Acampamento de jovens e adolescentes. Garanta sua vaga! Valor: R$ 150,00 (3x de R$ 50).', hora: 'Inscrições na secretaria' },
    { dia: 19, mes: 'JUL', nome: 'Encontro de Casais', desc: 'Um dia especial para fortalecer relacionamentos. Palestras, dinâmicas e louvor.', hora: '09:00h às 17:00h · Templo Sede' },
    { dia: 26, mes: 'JUL', nome: 'Batismo nas Águas', desc: 'Celebração de batismo. Inscrições abertas para novos convertidos.', hora: '16:00h · Templo Sede' },
    { dia: 2, mes: 'AGO', nome: 'Aniversário da Igreja — 7 Anos', desc: 'Grande celebração! Teremos louvor especial, palavra e confraternização.', hora: '19:00h · Templo Sede' },
    { dia: 9, mes: 'AGO', nome: 'Vigília de Oração', desc: 'Noite de adoração e intercessção. Traga seu pedido de oração.', hora: '22:00h às 06:00h' }
  ],

  // ── Estudos bíblicos ──
  estudos: [
    {
      titulo: 'O Sermão do Monte — As Bem-Aventuranças',
      autor: 'Pr. Responsável',
      data: '28/06/2026',
      duracao: '45 min',
      tipo: 'Vídeo + PDF',
      resumo: 'Um estudo profundo sobre as bem-aventuranças pregadas por Jesus no Sermão do Monte. Análise versículo por versículo de Mateus 5.',
      tags: ['Mateus', 'Ensino de Jesus', 'Caráter Cristão'],
      link: '#'
    },
    {
      titulo: 'Vida de Oração — Comunicando-se com Deus',
      autor: 'Pr. Responsável',
      data: '21/06/2026',
      duracao: '38 min',
      tipo: 'Áudio + PDF',
      resumo: 'Como desenvolver uma vida de oração consistente. Modelos bíblicos de oração, os tipos de oração e como cultivar intimidade com o Pai.',
      tags: ['Oração', 'Vida Cristã', 'Intimidade com Deus'],
      link: '#'
    },
    {
      titulo: 'Discipulado Radical — Seguindo a Jesus de Verdade',
      autor: 'Pr. Responsável',
      data: '14/06/2026',
      duracao: '52 min',
      tipo: 'Vídeo',
      resumo: 'O que significa ser um discípulo de Jesus nos dias de hoje? O custo do discipulado e a alegria de servir a Cristo.',
      tags: ['Discipulado', 'Cristianismo Prático'],
      link: '#'
    },
    {
      titulo: 'O Livro de Atos — A Igreja Primitiva',
      autor: 'Pr. Responsável',
      data: '07/06/2026',
      duracao: '1h 10min',
      tipo: 'Vídeo + PDF + Slides',
      resumo: 'Estudo panorâmico do livro de Atos dos Apóstolos. Como o Espírito Santo conduziu a igreja em seus primeiros passos.',
      tags: ['Atos', 'Igreja', 'Espírito Santo', 'Missões'],
      link: '#'
    },
    {
      titulo: 'Família Segundo o Coração de Deus',
      autor: 'Pr. Responsável',
      data: '31/05/2026',
      duracao: '41 min',
      tipo: 'Vídeo + PDF',
      resumo: 'Princípios bíblicos para construir uma família sólida. Papéis no lar, educação dos filhos e o amor entre os cônjuges.',
      tags: ['Família', 'Casamento', 'Filhos'],
      link: '#'
    },
    {
      titulo: 'Guerra Espiritual — Revestindo a Armadura',
      autor: 'Pr. Responsável',
      data: '24/05/2026',
      duracao: '48 min',
      tipo: 'Áudio + PDF',
      resumo: 'Estudo sobre a armadura de Deus em Efésios 6. Como识别 e resistir às investidas do inimigo na vida cotidiana.',
      tags: ['Batalha Espiritual', 'Efésios', 'Proteção'],
      link: '#'
    }
  ],

  // ── Ministérios ──
  ministerios: [
    { nome: 'Louvor', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/b4eb0b140_Louvor.png', desc: 'Adoração e música nos cultos. Ensaios às quintas.', lider: 'Carlos Silva', reuniao: 'Quintas · 20h' },
    { nome: 'Infantil', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/5bf312ba5_Infantil.png', desc: 'Ensino bíblico para crianças de 3 a 12 anos.', lider: 'Ana Costa', reuniao: 'Domingos · 18h' },
    { nome: 'Juventude', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/fc8c208cf_Juventude.png', desc: 'Comunhão e discipulado para jovens e adolescentes.', lider: 'Pedro Santos', reuniao: 'Sábados · 19h' },
    { nome: 'Casais', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/dc54c54de_Casais.png', desc: 'Encontros e aconselhamento para casais.', lider: 'Marcos e Rita', reuniao: 'Mensal · Sábado' },
    { nome: 'Intercessão', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/6801954c0_aaosocial.png', desc: 'Grupo de oração e guerra espiritual.', lider: 'Maria José', reuniao: 'Sextas · 18h' },
    { nome: 'Ação Social', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/6801954c0_aaosocial.png', desc: 'Ações comunitárias e ajuda aos necessitados.', lider: 'João Pereira', reuniao: '1º sábado do mês' },
    { nome: 'Evangelismo', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/6b55c4e22_WhatsAppImage2026-07-01at162538.jpg', desc: 'Missões urbanas e evangelismo de rua.', lider: 'Lucas Alves', reuniao: 'Sábados · 15h' },
    { nome: 'Som e Mídia', img: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/0c4684486_WhatsAppImage2026-07-01at162932.jpg', desc: 'Som, projeção e transmissão dos cultos.', lider: 'Rafael Dias', reuniao: 'Domingos · 17h' }
  ],

  // ── Comunicados ──
  avisos: [
    { titulo: 'Reunião de Líderes — 05/07', texto: 'Todos os líderes de ministério devem comparecer à reunião no templo às 19h. Tragam seus relatórios mensais.', data: '02/07/2026', tipo: 'urgente' },
    { titulo: 'Acampa Somos Um — Inscrições Abertas', texto: 'Inscrições abertas para o acampamento de jovens! 3 dias de adoração, comunhão e diversão. Valor: R$ 150 (3x R$ 50). Vagas limitadas!', data: '01/07/2026', tipo: 'evento' },
    { titulo: 'Encontro de Casais — 19/07', texto: 'Inscrições abertas para o Encontro de Casais. Um dia inteiro para investir no seu relacionamento. R$ 30 por casal (inclui almoço).', data: '30/06/2026', tipo: 'evento' },
    { titulo: 'Batismo nas Águas — 26/07', texto: 'Se você deseja se batizar, procure um dos pastores ou a secretaria. Preparatório em 3 encontros: 12, 15 e 19 de julho.', data: '28/06/2026', tipo: 'geral' },
    { titulo: 'Campanha de Jejum e Oração', texto: 'Estamos em campanha de jejum e oração por 21 dias (01 a 21 de julho). Junte-se a nós! Folia diária de oração às 6h e 18h.', data: '28/06/2026', tipo: 'espiritual' },
    { titulo: 'Reforma do Templo', texto: 'Estamos arrecadando ofertas para a reforma do templo. Meta: R$ 15.000. Arrecadado até agora: R$ 8.300. Contribua via PIX com a chave "missaoreviver@igreja.com.br".', data: '25/06/2026', tipo: 'geral' },
    { titulo: 'Nova Escola Bíblica', texto: 'A partir de julho, a Escola Bíblica Dominical terá 3 classes: Adultos, Adolescentes e Crianças. Matrículas abertas!', data: '20/06/2026', tipo: 'geral' }
  ],

  // ── Devocionais ──
  devocionais: [
    {
      data: 'Quinta-feira, 2 de Julho',
      titulo: 'O Poder da Persistência em Oração',
      verso: '"E eu vos digo: Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á."',
      ref: 'Lucas 11:9',
      texto: 'Jesus nos ensina que a oração não é um evento isolado, mas um estilo de vida. A persistência não é para convencer Deus, mas para fortalecer nossa fé. Quando continuamos pedindo, buscando e batendo, nosso coração se alinha com a vontade do Pai. Hoje, não desista daquilo que você tem clamado. Deus ouve, Deus responde, no tempo certo. Pergunta do dia: Qual é aquele pedido que você quase desistiu de fazer? Renove hoje sua fé e volte a bater na porta.'
    },
    {
      data: 'Quarta-feira, 1 de Julho',
      titulo: 'Gratidão em Todas as Circunstâncias',
      verso: '"Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco."',
      ref: '1 Tessalonicenses 5:18',
      texto: 'A gratidão não é um sentimento que surge apenas quando tudo vai bem. É uma escolha diária de reconhecer que Deus é bom, independentemente das circunstâncias. Quando escolhemos ser gratos, nosso coração se enche de paz e nossa perspectiva muda. Hoje, liste 5 coisas pelas quais você é grato. Pergunta do dia: O que muda em você quando escolhe a gratidão em vez da reclamação?'
    }
  ],

  // ── Aniversariantes ──
  aniversariantes: [
    { nome: 'Maria Silva', dia: 3, mes: 'Julho', iniciais: 'MS', telefone: '(31) 99999-0003' },
    { nome: 'João Santos', dia: 7, mes: 'Julho', iniciais: 'JS', telefone: '(31) 99999-0007' },
    { nome: 'Ana Oliveira', dia: 12, mes: 'Julho', iniciais: 'AO', telefone: '(31) 99999-0012' },
    { nome: 'Carlos Pereira', dia: 15, mes: 'Julho', iniciais: 'CP', telefone: '(31) 99999-0015' },
    { nome: 'Rita Souza', dia: 18, mes: 'Julho', iniciais: 'RS', telefone: '(31) 99999-0018' },
    { nome: 'Pedro Lima', dia: 22, mes: 'Julho', iniciais: 'PL', telefone: '(31) 99999-0022' },
    { nome: 'Beatriz Costa', dia: 25, mes: 'Julho', iniciais: 'BC', telefone: '(31) 99999-0025' },
    { nome: 'Marcos Alves', dia: 28, mes: 'Julho', iniciais: 'MA', telefone: '(31) 99999-0028' }
  ],

  // ── Escalas de serviço ──
  escalas: [
    { data: 'Dom 05/07', culto: 'Culto de Adoração', funcao: 'Louvor', responsavel: 'Carlos Silva' },
    { data: 'Dom 05/07', culto: 'Culto de Adoração', funcao: 'Som/Mídia', responsavel: 'Rafael Dias' },
    { data: 'Dom 05/07', culto: 'Culto de Adoração', funcao: 'Recepção', responsavel: 'Maria José' },
    { data: 'Qua 08/07', culto: 'Culto de Libertação', funcao: 'Louvor', responsavel: 'Pedro Santos' },
    { data: 'Qua 08/07', culto: 'Culto de Libertação', funcao: 'Som/Mídia', responsavel: 'Lucas Alves' },
    { data: 'Sex 10/07', culto: 'Culto de Oração', funcao: 'Intercessão', responsavel: 'Maria José' },
    { data: 'Dom 12/07', culto: 'Culto de Adoração', funcao: 'Louvor', responsavel: 'Ana Costa' },
    { data: 'Dom 12/07', culto: 'Culto de Adoração', funcao: 'Som/Mídia', responsavel: 'Rafael Dias' },
    { data: 'Dom 12/07', culto: 'Culto de Adoração', funcao: 'Infantil', responsavel: 'Ana Costa' }
  ],

  // ── Contato pastoral ──
  pastoral: [
    { nome: 'Pr. Responsável', cargo: 'Pastor Principal', iniciais: 'PR', contato: 'pastor@missaoreviver.com.br', telefone: '(31) 99999-0001' },
    { nome: 'Líder Carlos', cargo: 'Líder de Jovens', iniciais: 'LC', contato: 'jovens@missaoreviver.com.br', telefone: '(31) 99999-0002' },
    { nome: 'Líder Ana', cargo: 'Líder Infantil', iniciais: 'LA', contato: 'infantil@missaoreviver.com.br', telefone: '(31) 99999-0003' },
    { nome: 'Líder Marcos', cargo: 'Aconselhamento Familiar', iniciais: 'LM', contato: 'familias@missaoreviver.com.br', telefone: '(31) 99999-0004' },
    { nome: 'Líder Maria', cargo: 'Intercessão e Oração', iniciais: 'MM', contato: 'oracao@missaoreviver.com.br', telefone: '(31) 99999-0005' },
    { nome: 'Secretária Rita', cargo: 'Secretaria da Igreja', iniciais: 'SR', contato: 'contato@missaoreviver.com.br', telefone: '(31) 99999-0000' }
  ],

  // ── Versículos do dia (rotação) ──
  versiculos: [
    { texto: '"Porque onde dois ou três estiverem reunidos em meu nome, aí estou eu no meio deles."', ref: 'Mateus 18:20' },
    { texto: '"O Senhor é o meu pastor; nada me faltará."', ref: 'Salmos 23:1' },
    { texto: '"Tudo posso naquele que me fortalece."', ref: 'Filipenses 4:13' },
    { texto: '"Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento."', ref: 'Provérbios 3:5' },
    { texto: '"Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas."', ref: 'Mateus 6:33' },
    { texto: '"Sede fortes e corajosos. Não temais nem vos atemorizeis diante deles; porque o Senhor, vosso Deus, é quem vai convosco."', ref: 'Deuteronômio 31:6' },
    { texto: '"O meu conselho é: invoca a Deus, e a ti te escutará."', ref: 'Jó 22:21' }
  ],

  // ── Galeria ──
  galeria: [
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/0c4684486_WhatsAppImage2026-07-01at162932.jpg', titulo: 'Culto de Louvor' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/28b54ae60_WhatsAppImage2026-07-01at162653.jpg', titulo: 'Encontro de Jovens' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/6b55c4e22_WhatsAppImage2026-07-01at162538.jpg', titulo: 'Evangelismo' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/5907599e7_misso.png', titulo: 'Logo da Igreja' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/b4eb0b140_Louvor.png', titulo: 'Ministério de Louvor' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/5bf312ba5_Infantil.png', titulo: 'Ministério Infantil' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/fc8c208cf_Juventude.png', titulo: 'Ministério de Jovens' },
    { src: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/dc54c54de_Casais.png', titulo: 'Ministério de Casais' }
  ]
};

// ═════════════════════════════════════════════
//  PEDIDOS DE ORAÇÃO (IndexedDB)
// ═════════════════════════════════════════════

const STORE_PRAYERS = 'prayers';

// Garante que a store existe
function ensurePrayersStore() {
  return new Promise((resolve) => {
    const req = indexedDB.open('reviver_auth', 1);
    req.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_PRAYERS)) {
        // Precisa upgrade
        const ver = db.version + 1;
        db.close();
        const req2 = indexedDB.open('reviver_auth', ver);
        req2.onupgradeneeded = (ev) => {
          const db2 = ev.target.result;
          if (!db2.objectStoreNames.contains(STORE_PRAYERS)) {
            db2.createObjectStore(STORE_PRAYERS, { keyPath: 'id' });
          }
        };
        req2.onsuccess = () => { req2.result.close(); resolve(); };
        req2.onerror = () => resolve();
      } else {
        db.close(); resolve();
      }
    };
    if (req2) req2.onerror = () => resolve();
  });
}

async function salvarPedido(pedido) {
  await ensurePrayersStore();
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('reviver_auth');
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_PRAYERS, 'readwrite');
      tx.objectStore(STORE_PRAYERS).put(pedido);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}

async function listarPedidos() {
  await ensurePrayersStore();
  return new Promise((resolve) => {
    const req = indexedDB.open('reviver_auth');
    req.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_PRAYERS)) { db.close(); resolve([]); return; }
      const tx = db.transaction(STORE_PRAYERS, 'readonly');
      const req2 = tx.objectStore(STORE_PRAYERS).getAll();
      req2.onsuccess = () => { db.close(); resolve(req2.result || []); };
      req2.onerror = () => { db.close(); resolve([]); };
    };
  });
}

// ═════════════════════════════════════════════
//  RENDERIZAÇÃO
// ═════════════════════════════════════════════

async function renderWelcome(usuario) {
  const welcomeEl = document.getElementById('welcomeName');
  if (welcomeEl) welcomeEl.textContent = `Bem-vindo(a), ${usuario.nome_completo}!`;

  // Tenta mostrar a foto no banner se existir
  try {
    const { perfil } = await API.perfil.obter();
    if (perfil.foto_perfil) {
      const banner = document.querySelector('.welcome-banner');
      if (banner) {
        const oldImg = banner.querySelector('.welcome-foto');
        if (oldImg) oldImg.remove();
        const img = document.createElement('img');
        img.src = perfil.foto_perfil;
        img.className = 'welcome-foto';
        img.style.cssText = 'position:absolute;top:20px;right:20px;width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3);z-index:2;';
        banner.appendChild(img);
      }
    }
  } catch(e) {}

  // Versículo do dia (baseado no dia do ano)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const verse = IGREJA_DADOS.versiculos[dayOfYear % IGREJA_DADOS.versiculos.length];
  const verseText = document.getElementById('verseText');
  const verseRef = document.getElementById('verseRef');
  if (verseText) verseText.textContent = verse.texto;
  if (verseRef) verseRef.textContent = `— ${verse.ref}`;
}

function renderUpcomingEvents() {
  const el = document.getElementById('upcomingEvents');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.eventos.slice(0, 3).map(e => `
    <div class="event-card">
      <div class="event-date"><div class="day">${e.dia}</div><div class="month">${e.mes}</div></div>
      <div class="event-info">
        <h3>${e.nome}</h3>
        <p>${e.desc}</p>
        <div class="event-time">🕐 ${e.hora}</div>
      </div>
    </div>
  `).join('');
}

function renderWeeklyServices() {
  const el = document.getElementById('weeklyServices');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.cultos.map(c => c.horarios.map(h => `
    <div class="event-card">
      <div class="event-date" style="background:var(--teal);"><div class="day" style="font-size:0.9rem;">${c.dia.substring(0,3)}</div><div class="month">${h.hora}</div></div>
      <div class="event-info">
        <h3>${h.nome}</h3>
        <p>${h.desc}</p>
        <div class="event-time">📅 ${c.dia} · 🕐 ${h.hora}</div>
      </div>
    </div>
  `).join('')).join('');
}

function renderSpecialEvents() {
  const el = document.getElementById('specialEvents');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.eventos.map(e => `
    <div class="event-card">
      <div class="event-date"><div class="day">${e.dia}</div><div class="month">${e.mes}</div></div>
      <div class="event-info">
        <h3>${e.nome}</h3>
        <p>${e.desc}</p>
        <div class="event-time">🕐 ${e.hora}</div>
      </div>
    </div>
  `).join('');
}

function renderStudies() {
  const el = document.getElementById('studiesList');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.estudos.map(s => `
    <div class="study-card">
      <div class="study-header">
        <h3>${s.titulo}</h3>
        <div class="study-meta">
          <span>👤 ${s.autor}</span>
          <span>📅 ${s.data}</span>
          <span>⏱️ ${s.duracao}</span>
          <span>📂 ${s.tipo}</span>
        </div>
      </div>
      <div class="study-body">
        <p>${s.resumo}</p>
        <div class="study-tags">${s.tags.map(t => `<span class="study-tag">${t}</span>`).join('')}</div>
        <div class="study-actions">
          <a href="${s.link}" class="study-btn study-btn-primary">📖 Acessar Estudo</a>
          <button class="study-btn study-btn-secondary" onclick="alert('Download não disponível nesta demo')">⬇ Baixar PDF</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderMinistries() {
  const el = document.getElementById('ministriesGrid');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.ministerios.map(m => `
    <div class="ministry-card" onclick="alert('Ministério: ${m.nome}\\nLíder: ${m.lider}\\nReunião: ${m.reuniao}\\n\\nPara participar, procure o líder ou a secretaria.')">
      <img src="${m.img}" class="min-img" alt="${m.nome}" onerror="this.style.background='var(--gray-light)'" />
      <div class="min-body">
        <h3>${m.nome}</h3>
        <p>${m.desc}</p>
        <div class="min-leader">👤 ${m.lider} · ${m.reuniao}</div>
      </div>
    </div>
  `).join('');
}

function renderAnnouncements() {
  const el = document.getElementById('announcementsList');
  if (!el) return;
  const tipoCor = { 'urgente': 'var(--error)', 'evento': 'var(--teal)', 'espiritual': 'var(--blue-mid)', 'geral': 'var(--gray-text)' };
  const tipoIcon = { 'urgente': '🔴', 'evento': '🎉', 'espiritual': '🙏', 'geral': '📢' };
  el.innerHTML = IGREJA_DADOS.avisos.map(a => `
    <div class="content-card" style="border-left-color:${tipoCor[a.tipo] || 'var(--teal)'}">
      <strong>${tipoIcon[a.tipo] || '📢'} ${a.titulo}</strong>
      <div style="margin-top:6px;font-size:0.88rem;color:var(--text-dark);line-height:1.6;">${a.texto}</div>
      <div class="meta">📅 ${a.data}</div>
    </div>
  `).join('');
}

function renderGallery() {
  const el = document.getElementById('galleryGrid');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.galeria.map(g => `
    <div class="gallery-item" onclick="window.open('${g.src}', '_blank')" title="${g.titulo}">
      <img src="${g.src}" alt="${g.titulo}" loading="lazy" />
    </div>
  `).join('');
}

async function renderBirthdays() {
  const el = document.getElementById('birthdayList');
  if (!el) return;

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const mesAtual = new Date().getMonth() + 1;

  try {
    // Tenta buscar aniversariantes reais do IndexedDB
    if (typeof API !== 'undefined' && API.aniversariantes) {
      const data = await API.aniversariantes(mesAtual);
      const anivs = data.aniversariantes || [];
      if (anivs && anivs.length > 0) {
        el.innerHTML = anivs.map(a => {
          const iniciais = a.nome_completo.split(' ').map(w => w[0]).slice(0,2).join('');
          const telefone = a.telefone || null;
          const waLink = telefone ? gerarLinkWhatsAppMembro(telefone, a.nome_completo) : null;
          return `
          <div class="birthday-item">
            <div class="birthday-avatar">${iniciais}</div>
            <div class="b-info">
              <div class="b-name">${a.nome_completo}</div>
              <div class="b-date">Dia ${a.dia} de ${MESES[mesAtual-1]}${a.idade ? ' · Faz ' + a.idade + ' anos' : ''}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              ${waLink ? '<a href="' + waLink + '" target="_blank" class="btn btn-primary btn-sm" style="text-decoration:none;">📱 WhatsApp</a>' : '<span style="font-size:0.75rem;color:var(--gray-text);">Sem telefone</span>'}
              <span class="b-icon">🎂</span>
            </div>
          </div>`;
        }).join('');
        return;
      }
    }
  } catch(e) {
    console.error('Erro ao carregar aniversariantes reais:', e);
  }

  // Fallback: dados de exemplo estáticos
  el.innerHTML = IGREJA_DADOS.aniversariantes.map(a => {
    const telefone = a.telefone || null;
    const waLink = telefone ? gerarLinkWhatsAppMembro(telefone, a.nome) : null;
    return `
    <div class="birthday-item">
      <div class="birthday-avatar">${a.iniciais}</div>
      <div class="b-info">
        <div class="b-name">${a.nome}</div>
        <div class="b-date">${a.dia} de ${a.mes}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        ${waLink ? '<a href="' + waLink + '" target="_blank" class="btn btn-primary btn-sm" style="text-decoration:none;">📱 WhatsApp</a>' : '<span style="font-size:0.75rem;color:var(--gray-text);">Sem telefone</span>'}
        <span class="b-icon">🎂</span>
      </div>
    </div>
  `}).join('');
}

// ── Gerar link WhatsApp (versão do dashboard do membro) ──
function gerarLinkWhatsAppMembro(telefone, nome) {
  let numero = telefone.replace(/\D/g, '');
  if (numero.length === 11 || numero.length === 10) {
    numero = '55' + numero;
  }
  const primeiroNome = nome.split(' ')[0];
  const mensagem = `Olá ${primeiroNome}! 🎉🎂\n\nA Comunidade Cristã Missão Reviver deseja a você um Feliz Aniversário! Que Deus abençoe sua vida com saúde, alegria e paz. Que este novo ciclo de vida seja repleto das bênçãos do Senhor. 🙏✨\n\n"Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais." — Jeremias 29:11\n\nCom amor,\nFamília Missão Reviver 💙`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}





function renderPastoral() {
  const el = document.getElementById('pastoralGrid');
  if (!el) return;
  el.innerHTML = IGREJA_DADOS.pastoral.map(p => `
    <div class="pastoral-card">
      <div class="p-avatar">${p.iniciais}</div>
      <div class="p-name">${p.nome}</div>
      <div class="p-role">${p.cargo}</div>
      <a href="mailto:${p.contato}" class="p-contact">✉️ ${p.contato}</a>
      <a href="tel:${p.telefone.replace(/\D/g,'')}" class="p-contact">📞 ${p.telefone}</a>
    </div>
  `).join('');
}

// ═════════════════════════════════════════════
//  PEDIDOS DE ORAÇÃO — SUBMIT + RENDER
// ═════════════════════════════════════════════

async function submitPrayer() {
  const texto = document.getElementById('prayerText').value.trim();
  const anonimo = document.getElementById('prayerAnonymous').checked;
  const publico = document.getElementById('prayerPublic').checked;

  if (!texto || texto.length < 10) {
    showAlert('prayerAlert', 'Escreva um pedido com pelo menos 10 caracteres.');
    return;
  }

  const sessaoData = await API.auth.sessao();
  const sessao = sessaoData.autenticado ? sessaoData.membro : null;
  if (!sessao) return;

  const pedido = {
    id: crypto.randomUUID(),
    texto,
    autor: anonimo ? 'Anônimo' : sessao.nome_completo,
    publico,
    data: new Date().toISOString(),
    timestamp: Date.now()
  };

  await salvarPedido(pedido);
  document.getElementById('prayerText').value = '';
  showAlert('prayerAlert', 'Pedido enviado! Estamos orando por você. 🙏', 'success');
  renderPrayers();
}

async function renderPrayers() {
  const pedidos = await listarPedidos();
  const el = document.getElementById('prayerList');
  if (!el) return;

  const publicos = pedidos.filter(p => p.publico).sort((a, b) => b.timestamp - a.timestamp);

  // Combina com pedidos de exemplo se não houver suficientes
  const exemplos = [
    { id: 'ex1', autor: 'Anônimo', texto: 'Pela saúde da minha mãe que está doente. Que Deus a cure e fortaleça nossa família.', data: '2026-06-30T10:00:00Z' },
    { id: 'ex2', autor: 'Maria', texto: 'Pela provisão de emprego. Estamos passando por um momento difícil financeiramente.', data: '2026-06-29T14:00:00Z' },
    { id: 'ex3', autor: 'João', texto: 'Pela conversão do meu filho. Que Deus toque no coração dele e o traga de volta para casa.', data: '2026-06-28T18:00:00Z' }
  ];

  const todos = [...publicos, ...exemplos];

  el.innerHTML = todos.map(p => `
    <div class="content-card">
      <strong>${p.autor}</strong>
      <div style="margin-top:6px;font-size:0.88rem;color:var(--text-dark);line-height:1.6;">🙏 ${p.texto}</div>
      <div class="meta">${formatDate(p.data)}</div>
    </div>
  `).join('');
}

// ═════════════════════════════════════════════
//  PIX COPY
// ═════════════════════════════════════════════

function copyPix() {
  const key = document.getElementById('pixKey').textContent;
  navigator.clipboard.writeText(key).then(() => {
    alert('Chave PIX copiada: ' + key);
  }).catch(() => {
    alert('Chave PIX: ' + key);
  });
}

// ═════════════════════════════════════════════
//  TABS — Suporte
// ═════════════════════════════════════════════

function switchTabByName(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const tab = [...document.querySelectorAll('.tab')].find(t => t.textContent.toLowerCase().includes(name));
  if (tab) tab.classList.add('active');
  const content = document.getElementById(`tab-${name}`);
  if (content) content.classList.add('active');
}

// ═════════════════════════════════════════════
//  CONTEÚDO DINÂMICO — Carrega da API com fallback
// ═════════════════════════════════════════════

let conteudoAPI = null; // cache do conteúdo do backend

async function carregarConteudoAPI() {
  if (conteudoAPI !== null) return conteudoAPI;
  try {
    if (typeof API !== 'undefined' && API.conteudo) {
      const data = await API.conteudo.listarTudo();
      conteudoAPI = data.conteudo || {};
      console.log('📦 Conteúdo carregado da API');
    }
  } catch (e) {
    console.log('📦 Usando dados padrão (API indisponível)');
    conteudoAPI = {};
  }
  return conteudoAPI;
}

// ═════════════════════════════════════════════
//  RENDERIZAÇÃO — Usa API se disponível, fallback IGREJA_DADOS
// ═════════════════════════════════════════════

function renderUpcomingEvents() {
  const el = document.getElementById('upcomingEvents');
  if (!el) return;
  const eventos = (conteudoAPI?.eventos?.itens) || IGREJA_DADOS.eventos;
  el.innerHTML = eventos.slice(0, 3).map(e => `
    <div class="event-mini">
      <div class="event-mini-date">${e.dia}<span>${e.mes}</span></div>
      <div class="event-mini-info">
        <strong>${e.nome}</strong>
        <span>${e.hora || ''}</span>
      </div>
    </div>
  `).join('');
}

function renderWeeklyServices() {
  const el = document.getElementById('weeklyServices');
  if (!el) return;
  const cultosAPI = conteudoAPI?.cultos?.itens;
  if (cultosAPI && cultosAPI.length > 0) {
    // Agrupa por dia
    const porDia = {};
    cultosAPI.forEach(c => {
      if (!porDia[c.dia]) porDia[c.dia] = [];
      porDia[c.dia].push(c);
    });
    el.innerHTML = Object.entries(porDia).map(([dia, horarios]) => `
      <div class="service-day">
        <div class="service-day-name">${dia}</div>
        ${horarios.map(h => `
          <div class="service-item">
            <div class="service-time">${h.hora}</div>
            <div class="service-info">
              <strong>${h.nome}</strong>
              <span>${h.desc || ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  } else {
    el.innerHTML = IGREJA_DADOS.cultos.map(c => c.horarios.map(h => `
      <div class="service-day">
        <div class="service-day-name">${c.dia}</div>
        <div class="service-item">
          <div class="service-time">${h.hora}</div>
          <div class="service-info">
            <strong>${h.nome}</strong>
            <span>${h.desc}</span>
          </div>
        </div>
      </div>
    `).join('')).join('');
  }
}

function renderSpecialEvents() {
  const el = document.getElementById('specialEvents');
  if (!el) return;
  const eventos = (conteudoAPI?.eventos?.itens) || IGREJA_DADOS.eventos;
  el.innerHTML = eventos.map(e => `
    <div class="content-card event-card-special">
      <div class="event-date-badge">${e.dia}<span>${e.mes}</span></div>
      <div class="event-details">
        <h4>${e.nome}</h4>
        <p>${e.desc}</p>
        <div class="event-meta">🕐 ${e.hora || ''}</div>
      </div>
    </div>
  `).join('');
}

function renderStudies() {
  const el = document.getElementById('studiesContent');
  if (!el) return;
  const estudos = (conteudoAPI?.estudos?.itens) || IGREJA_DADOS.estudos;
  el.innerHTML = estudos.map(s => {
    const tags = (s.tags || []).map(t => `<span class="study-tag">${t}</span>`).join('');
    return `
    <div class="content-card study-card">
      <div class="study-header">
        <h4>${s.titulo}</h4>
        <span class="study-type">${s.tipo || ''}</span>
      </div>
      <div class="study-meta">
        <span>👤 ${s.autor || ''}</span>
        <span>📅 ${s.data || ''}</span>
        <span>⏱️ ${s.duracao || ''}</span>
      </div>
      <p>${s.resumo || ''}</p>
      <div class="study-tags">${tags}</div>
      <a href="${s.link || '#'}" class="btn btn-primary btn-sm" style="text-decoration:none;margin-top:8px;">📖 Acessar Estudo</a>
    </div>
  `}).join('');
}



function renderAnnouncements() {
  const el = document.getElementById('announcementsContent');
  if (!el) return;
  const avisos = (conteudoAPI?.avisos?.itens) || IGREJA_DADOS.avisos;
  const tipoCor = { urgente: '#dc3545', evento: '#28a745', geral: '#007bff', espiritual: '#6f42c1' };
  el.innerHTML = avisos.map(a => `
    <div class="content-card announcement-card" style="border-left:4px solid ${tipoCor[a.tipo] || '#007bff'};">
      <div class="announcement-header">
        <h4>${a.titulo}</h4>
        <span class="announcement-date">${a.data || ''}</span>
      </div>
      <p>${a.texto}</p>
    </div>
  `).join('');
}

function renderDevotional() {
  const el = document.getElementById('devotionalContent');
  if (!el) return;
  const devocionais = (conteudoAPI?.devocionais?.itens) || IGREJA_DADOS.devocionais;
  el.innerHTML = devocionais.map(d => `
    <div class="devotional-card" style="margin-bottom:16px;">
      <div class="dev-date">${d.data}</div>
      <h3>${d.titulo}</h3>
      <div class="dev-verse">${d.verso}<br><span style="font-style:normal;font-weight:600;">— ${d.ref}</span></div>
      <div class="dev-text">${d.texto}</div>
    </div>
  `).join('');
}

function renderScales() {
  const el = document.getElementById('scaleTableBody');
  if (!el) return;
  const escalas = (conteudoAPI?.escalas?.itens) || IGREJA_DADOS.escalas;
  el.innerHTML = escalas.map(s => `
    <tr>
      <td>${s.data}</td>
      <td>${s.culto}</td>
      <td class="scale-role">${s.funcao}</td>
      <td>${s.responsavel}</td>
    </tr>
  `).join('');
}

// ═════════════════════════════════════════════
//  INIT — Renderiza tudo ao carregar
// ═════════════════════════════════════════════

const originalInitDashboard = window.initDashboard;

async function initDashboardComplete() {
  await originalInitDashboard();

  const sessaoData = await API.auth.sessao();
  const sessao = sessaoData.autenticado ? sessaoData.membro : null;
  if (!sessao) return;

  // Carrega conteúdo da API PRIMEIRO (com fallback)
  await carregarConteudoAPI();

  await renderWelcome(sessao);
  renderUpcomingEvents();
  renderWeeklyServices();
  renderSpecialEvents();
  renderStudies();
  renderMinistries();
  renderAnnouncements();
  renderGallery();
  await renderBirthdays();
  renderDevotional();
  renderScales();
  renderPastoral();
  renderPrayers();
}

// Override
window.initDashboard = initDashboardComplete;

// ═════════════════════════════════════════════
//  SEÇÕES COLAPSÁVEIS DO PERFIL
// ═════════════════════════════════════════════

function toggleSection(id) {
  const body = document.getElementById(id);
  const header = body.previousElementSibling;
  if (body.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    header.classList.remove('collapsed');
  } else {
    body.classList.add('collapsed');
    header.classList.add('collapsed');
  }
}
