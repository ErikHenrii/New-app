/* ═════════════════════════════════════════════════════════════════
   MISSÃO REVIVER — FRONTEND AUTH (v2.0 — Backend API)
   Lógica das páginas: login, registro, dashboard, admin, LGPD
   Agora usa API fetch → Node.js backend → PostgreSQL
   ═════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 6000);
}

function clearErrors() {
  document.querySelectorAll('.form-group input').forEach(f => f.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('error');
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) errorEl.textContent = message;
}

function redirectToDashboard(role) {
  window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
}

async function logout() {
  try { await API.auth.logout(); } catch(e) {}
  API.setToken(null);
  window.location.href = 'login.html';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [ano, mes, dia] = dateStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDateOnly(dateStr) {
  if (!dateStr) return '—';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [ano, mes, dia] = dateStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ═══════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════

async function handleLogin(e) {
  e.preventDefault();
  clearErrors();
  if (document.body.dataset.loggingIn === '1') return;
  document.body.dataset.loggingIn = '1';

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    showAlert('loginAlert', 'Preencha todos os campos.');
    document.body.dataset.loggingIn = '0';
    return;
  }

  try {
    const data = await API.auth.login(email, senha);
    API.setToken(data.token);
    showAlert('loginAlert', `Bem-vindo, ${data.membro.nome_completo}!`, 'success');
    setTimeout(() => redirectToDashboard(data.membro.role), 800);
  } catch (err) {
    document.body.dataset.loggingIn = '0';
    showAlert('loginAlert', err.message);
  }
}

// ═══════════════════════════════════════════════
//  REGISTRO
// ═══════════════════════════════════════════════

async function handleRegister(e) {
  e.preventDefault();
  clearErrors();
  // Anti-submit duplo
  if (document.body.dataset.registering === '1') return;
  document.body.dataset.registering = '1';

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const senha = document.getElementById('senha').value;
  const consentimento = document.getElementById('consentimento').checked;

  let hasError = false;
  if (nome.length < 3) { setFieldError('nome', 'Nome muito curto'); hasError = true; }
  if (!email.includes('@')) { setFieldError('email', 'E-mail inválido'); hasError = true; }
  if (senha.length < 6) { setFieldError('senha', 'Mínimo 6 caracteres'); hasError = true; }
  if (hasError) { document.body.dataset.registering = '0'; return; }

  try {
    const data = await API.auth.registrar({
      nome_completo: nome, email, telefone, senha, consentimento
    });
    API.setToken(data.token);
    showAlert('registerAlert', `Cadastro realizado! Bem-vindo, ${data.membro.nome_completo}!`, 'success');
    setTimeout(() => redirectToDashboard(data.membro.role), 1200);
  } catch (err) {
    document.body.dataset.registering = '0';
    showAlert('registerAlert', err.message);
  }
}

// ═══════════════════════════════════════════════
//  DASHBOARD (MEMBRO)
// ═══════════════════════════════════════════════

async function initDashboard() {
  if (!API.isAuthenticated()) { window.location.href = 'login.html'; return; }

  try {
    const sessao = await API.auth.sessao();
    if (!sessao.autenticado) { window.location.href = 'login.html'; return; }

    const membro = sessao.membro;
    document.getElementById('userName').textContent = membro.nome_completo;
    const roleEl = document.getElementById('userRole');
    if (roleEl) {
      roleEl.textContent = membro.role;
      roleEl.className = `badge badge-${membro.role}`;
    }

    // Botão admin se for admin
    if (membro.role === 'admin') {
      const adminBtn = document.getElementById('adminLink');
      if (adminBtn) adminBtn.style.display = '';
    }

    // Carrega perfil completo
    const { perfil } = await API.perfil.obter();
    popularFormPerfil(perfil);

    // Avatar com inicial
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      if (perfil.foto_perfil) {
        avatarEl.innerHTML = `<img src="${perfil.foto_perfil}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        avatarEl.textContent = membro.nome_completo.split(' ').map(w => w[0]).slice(0, 2).join('');
      }
    }

    // Foto preview
    if (perfil.foto_perfil) {
      atualizarFotoPreview(perfil.foto_perfil, membro.nome_completo);
    }

    // NÃO chamar initDashboardComplete aqui — o dashboard-data.js
    // já sobrescreve window.initDashboard para chamar ambos.
    // Chamar aqui causa RECURSÃO INFINITA.
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    if (err.message.includes('Sessão expirada') || err.message.includes('inválida') || err.message.includes('Token')) {
      window.location.href = 'login.html';
    } else {
      // Mostra erro na tela em vez de falhar silenciosamente
      const perfilInfo = document.getElementById('perfilInfo');
      if (perfilInfo) {
        perfilInfo.innerHTML = '<div style="color:#dc3545;padding:12px;background:#f8d7da;border-radius:8px;">⚠️ Erro ao carregar perfil: ' + err.message + '</div>';
      }
    }
  }
}

// ═══════════════════════════════════════════════
//  PERFIL — Popular formulário
// ═══════════════════════════════════════════════

function calcularCompletude(perfil) {
  const campos = ['nome_completo','telefone','data_nascimento','genero','cpf','estado_civil',
    'endereco_rua','endereco_numero','endereco_bairro','endereco_cidade','endereco_estado','endereco_cep',
    'nome_conjuge','data_casamento','filhos','data_conversao','data_batismo','ministerio','funcao_igreja',
    'dons_espirituais','testemunho','emergencia_nome','emergencia_telefone','emergencia_parentesco',
    'instagram','facebook'];
  const preenchidos = campos.filter(c => perfil[c] && String(perfil[c]).trim()).length;
  return Math.round((preenchidos / campos.length) * 100);
}

function popularFormPerfil(p) {
  // Converte Date do PostgreSQL (objeto Date) para string YYYY-MM-DD
  const toDateStr = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.split('T')[0];
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = (val === null || val === undefined) ? '' : String(val); };
  const setDate = (id, val) => { const el = document.getElementById(id); if (el) el.value = toDateStr(val); };
  const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val !== false; };

  // Dados pessoais
  set('editNome', p.nome_completo);
  set('editTelefone', p.telefone);
  setDate('editDataNasc', p.data_nascimento);
  set('editGenero', p.genero);
  set('editCPF', p.cpf);
  set('editEstadoCivil', p.estado_civil);

  // Endereço
  set('editRua', p.endereco_rua);
  set('editNumero', p.endereco_numero);
  set('editBairro', p.endereco_bairro);
  set('editCidade', p.endereco_cidade);
  set('editEstado', p.endereco_estado);
  set('editCEP', p.endereco_cep);

  // Família
  set('editConjuge', p.nome_conjuge);
  setDate('editDataCasamento', p.data_casamento);
  set('editFilhos', p.filhos);
  set('editQtdFilhos', p.qtd_filhos);

  // Vida espiritual
  setDate('editDataConversao', p.data_conversao);
  setDate('editDataBatismo', p.data_batismo);
  set('editMinisterio', p.ministerio);
  set('editFuncao', p.funcao_igreja);
  set('editIgrejaAnterior', p.igreja_anterior);
  set('editDons', p.dons_espirituais);
  set('editTestemunho', p.testemunho);

  // Emergência
  set('editEmergenciaNome', p.emergencia_nome);
  set('editEmergenciaTel', p.emergencia_telefone);
  set('editEmergenciaParent', p.emergencia_parentesco);

  // Redes sociais
  set('editInstagram', p.instagram);
  set('editFacebook', p.facebook);

  // Preferências
  setCheck('editNotifEmail', p.notificar_email);
  setCheck('editNotifWhats', p.notificar_whatsapp);
  setCheck('editPartAniv', p.participar_aniversarios);

  // Progresso
  const progresso = calcularCompletude(p);
  const progressBar = document.getElementById('profileProgress');
  const progressText = document.getElementById('profileProgressText');
  if (progressBar) progressBar.style.width = progresso + '%';
  if (progressText) progressText.textContent = progresso + '%';
}

// ═══════════════════════════════════════════════
//  FOTO DE PERFIL
// ═══════════════════════════════════════════════

function atualizarFotoPreview(fotoBase64, nome) {
  const preview = document.getElementById('fotoPreview');
  const placeholder = document.getElementById('fotoPlaceholder');
  if (fotoBase64) {
    if (preview) { preview.src = fotoBase64; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (preview) preview.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.textContent = nome ? nome.split(' ').map(w=>w[0]).slice(0,2).join('') : '?';
    }
  }
}

function handleFotoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('A foto deve ter no máximo 2MB.'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Redimensiona para 300x300 mantendo proporção
      const canvas = document.createElement('canvas');
      canvas.width = 300; canvas.height = 300;
      const ctx = canvas.getContext('2d');
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      atualizarFotoPreview(base64);
      // Marca que precisa salvar
      const hiddenInput = document.getElementById('fotoBase64');
      if (hiddenInput) {
        hiddenInput.value = base64;
        hiddenInput.dataset.alterada = '1';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removerFoto() {
  atualizarFotoPreview(null);
  const hiddenInput = document.getElementById('fotoBase64');
  if (hiddenInput) {
    hiddenInput.value = '';
    hiddenInput.dataset.alterada = '1';
  }
}

// ═══════════════════════════════════════════════
//  PERFIL — Salvar
// ═══════════════════════════════════════════════

async function salvarPerfil() {
  console.log('📝 salvarPerfil iniciado...');
  // Retorna undefined (não null) para campos vazios — assim o backend NÃO sobrescreve
  const get = (id) => { const el = document.getElementById(id); const v = el?.value?.trim(); return v || undefined; };
  const getCheck = (id) => { const el = document.getElementById(id); return el ? el.checked : undefined; };

  const fotoHidden = document.getElementById('fotoBase64');
  const fotoAlterada = fotoHidden?.dataset.alterada === '1';
  const fotoBase64 = fotoHidden?.value || null;

  const dados = {
    nome_completo: get('editNome'),
    telefone: get('editTelefone'),
    data_nascimento: get('editDataNasc'),
    genero: get('editGenero'),
    cpf: get('editCPF'),
    estado_civil: get('editEstadoCivil'),
    endereco_rua: get('editRua'),
    endereco_numero: get('editNumero'),
    endereco_bairro: get('editBairro'),
    endereco_cidade: get('editCidade'),
    endereco_estado: get('editEstado'),
    endereco_cep: get('editCEP'),
    nome_conjuge: get('editConjuge'),
    data_casamento: get('editDataCasamento'),
    filhos: get('editFilhos'),  // texto com nomes dos filhos
    qtd_filhos: get('editQtdFilhos') !== undefined ? parseInt(get('editQtdFilhos')) || 0 : undefined,
    data_conversao: get('editDataConversao'),
    data_batismo: get('editDataBatismo'),
    ministerio: get('editMinisterio'),
    funcao_igreja: get('editFuncao'),
    igreja_anterior: get('editIgrejaAnterior'),
    dons_espirituais: get('editDons'),
    testemunho: get('editTestemunho'),
    emergencia_nome: get('editEmergenciaNome'),
    emergencia_telefone: get('editEmergenciaTel'),
    emergencia_parentesco: get('editEmergenciaParent'),
    instagram: get('editInstagram'),
    facebook: get('editFacebook'),
    notificar_email: getCheck('editNotifEmail'),
    notificar_whatsapp: getCheck('editNotifWhats'),
    participar_aniversarios: getCheck('editPartAniv'),
  };

  if (fotoAlterada) {
    dados.foto_perfil = fotoBase64 || null;
    // Limpa flag após salvar
    if (fotoHidden) fotoHidden.dataset.alterada = '0';
  }

  // Desabilita botão durante o save
  const saveBtn = document.querySelector('button[onclick="salvarPerfil()"]');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Salvando...'; }

  try {
    console.log('📤 Enviando dados para /api/perfil:', Object.keys(dados).filter(k => dados[k] !== undefined));
    const result = await API.perfil.atualizar(dados);
    console.log('✅ Resposta do servidor:', result);
    showAlert('perfilAlert', '✅ Perfil salvo com sucesso!' + (result.perfil_completo ? ' Perfil completo!' : ''), 'success');

    // Atualiza progresso
    const progressBar = document.getElementById('profileProgress');
    const progressText = document.getElementById('profileProgressText');
    if (progressBar) progressBar.style.width = calcularCompletude(dados) + '%';
    if (progressText) progressText.textContent = calcularCompletude(dados) + '%';

    // Atualiza avatar no header se a foto mudou
    if (dados.foto_perfil) {
      const avatarEl = document.getElementById('userAvatar');
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${dados.foto_perfil}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      }
    }

    // Fecha todas as seções colapsáveis abertas
    const secoes = ['secFoto', 'secPessoal', 'secEndereco', 'secFamilia', 'secEspiritual', 'secEmergencia', 'secSocial', 'secPrefs'];
    secoes.forEach(secId => {
      const body = document.getElementById(secId);
      const header = body ? body.previousElementSibling : null;
      if (body && !body.classList.contains('collapsed')) {
        body.classList.add('collapsed');
        if (header) header.classList.add('collapsed');
      }
    });

    // Scroll suave para o topo da área de perfil
    const profileTab = document.getElementById('tab-perfil');
    if (profileTab) profileTab.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Recarrega os dados do perfil do backend para garantir consistência
    try {
      const { perfil } = await API.perfil.obter();
      if (perfil) popularFormPerfil(perfil);
    } catch (e) { /* ignora erro de recarga */ }

  } catch (err) {
    console.error('❌ Erro ao salvar perfil:', err);
    showAlert('perfilAlert', '❌ Erro ao salvar: ' + err.message);
  } finally {
    // Reabilita botão
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 Salvar Todas as Informações'; }
  }
}

async function alterarSenha() {
  const atual = document.getElementById('senhaAtual').value;
  const nova = document.getElementById('novaSenha').value;
  const confirmar = document.getElementById('confirmarSenha').value;

  if (!atual || !nova) { showAlert('senhaAlert', 'Preencha todos os campos.'); return; }
  if (nova !== confirmar) { showAlert('senhaAlert', 'As senhas não conferem.'); return; }
  if (nova.length < 6) { showAlert('senhaAlert', 'Nova senha deve ter ao menos 6 caracteres.'); return; }

  try {
    await API.perfil.alterarSenha(atual, nova);
    showAlert('senhaAlert', 'Senha alterada com sucesso!', 'success');
    document.getElementById('senhaAtual').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
  } catch (err) {
    showAlert('senhaAlert', err.message);
  }
}

// ═══════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════

async function initAdmin() {
  if (!API.isAuthenticated()) { window.location.href = 'login.html'; return; }

  try {
    const sessao = await API.auth.sessao();
    if (!sessao.autenticado || sessao.membro.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return;
    }

    document.getElementById('userName').textContent = sessao.membro.nome_completo;
    const roleEl = document.getElementById('userRole');
    if (roleEl) { roleEl.textContent = 'Administrador'; roleEl.className = 'badge badge-admin'; }

    // Avatar
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = sessao.membro.nome_completo.split(' ').map(w=>w[0]).slice(0,2).join('');

    if (sessao.membro.foto_perfil && avatarEl) {
      avatarEl.innerHTML = `<img src="${sessao.membro.foto_perfil}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }

    loadAdminStats();
    loadAdminUsers();
  } catch (err) {
    console.error('Erro ao carregar admin:', err);
    window.location.href = 'login.html';
  }
}

async function loadAdminStats() {
  try {
    const stats = await API.admin.stats();
    console.log('📊 Stats recebidas:', stats);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    set('statTotal', stats.total_membros);
    set('statMembros', stats.ativos);
    set('statAdmins', stats.admins);
    set('statAcessos', stats.logins_hoje);
  } catch (err) {
    console.error('❌ Erro ao carregar stats:', err);
    // Mostra erro nas stats em vez de deixar "—"
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statTotal', '0');
    set('statMembros', '0');
    set('statAdmins', '0');
    set('statAcessos', '0');
  }
}

async function loadAdminUsers(busca = '') {
  try {
    const data = await API.admin.listarUsuarios();
    let users = data.usuarios || [];

    if (busca) {
      const b = busca.toLowerCase();
      users = users.filter(u =>
        (u.nome_completo || '').toLowerCase().includes(b) ||
        (u.email || '').toLowerCase().includes(b)
      );
    }

    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray-text);">Nenhum membro encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const iniciais = (u.nome_completo || '?').split(' ').map(w=>w[0]).slice(0,2).join('');
      const fotoHtml = u.foto_perfil
        ? `<img src="${u.foto_perfil}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
        : `<div class="avatar-mini">${iniciais}</div>`;
      const statusClass = u.status === 'ativo' ? 'status-active' : 'status-inactive';
      return `
        <tr onclick="verMembro('${u.id}')" style="cursor:pointer;">
          <td>${fotoHtml}</td>
          <td>${u.nome_completo || '—'}</td>
          <td>${u.email}</td>
          <td>${u.telefone || '—'}</td>
          <td><span class="badge badge-${u.role}">${u.role}</span></td>
          <td><span class="${statusClass}">${u.status}</span></td>
        </tr>`;
    }).join('');
  } catch (err) { console.error(err); }
}

async function verMembro(userId) {
  try {
    const data = await API.admin.verUsuario(userId);
    const m = data.membro;
    const logs = data.auditoria || [];

    const fmtDate = (val) => {
      if (!val) return '<span style="color:var(--gray-text);">Não informado</span>';
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const d = val.split('T')[0].split('-');
        return `${d[2]}/${d[1]}/${d[0]}`;
      }
      return new Date(val).toLocaleDateString('pt-BR');
    };
    const fmtBool = (v) => v ? 'Sim' : 'Não';
    const iniciais = (m.nome_completo || '?').split(' ').map(w=>w[0]).slice(0,2).join('');

    const modalBody = document.getElementById('memberModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="display:flex;gap:20px;align-items:center;margin-bottom:24px;">
        ${m.foto_perfil
          ? `<img src="${m.foto_perfil}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`
          : `<div class="avatar-large">${iniciais}</div>`}
        <div>
          <h3 style="margin:0 0 4px;">${m.nome_completo}</h3>
          <p style="margin:0;color:var(--gray-text);">${m.email}</p>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <span class="badge badge-${m.role}">${m.role}</span>
            <span class="badge ${m.status === 'ativo' ? 'badge-active' : 'badge-inactive'}">${m.status}</span>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item"><span class="info-label">Telefone</span><span class="info-value">${m.telefone || '—'}</span></div>
        <div class="info-item"><span class="info-label">Nascimento</span><span class="info-value">${fmtDate(m.data_nascimento)}</span></div>
        <div class="info-item"><span class="info-label">Gênero</span><span class="info-value">${m.genero || '—'}</span></div>
        <div class="info-item"><span class="info-label">CPF</span><span class="info-value">${m.cpf || '—'}</span></div>
        <div class="info-item"><span class="info-label">Estado Civil</span><span class="info-value">${m.estado_civil || '—'}</span></div>
        <div class="info-item"><span class="info-label">Cidade/Estado</span><span class="info-value">${m.endereco_cidade ? m.endereco_cidade + '/' + (m.endereco_estado||'') : '—'}</span></div>
        <div class="info-item"><span class="info-label">Ministério</span><span class="info-value">${m.ministerio || '—'}</span></div>
        <div class="info-item"><span class="info-label">Função</span><span class="info-value">${m.funcao_igreja || '—'}</span></div>
        <div class="info-item"><span class="info-label">Data Conversão</span><span class="info-value">${fmtDate(m.data_conversao)}</span></div>
        <div class="info-item"><span class="info-label">Data Batismo</span><span class="info-value">${fmtDate(m.data_batismo)}</span></div>
        <div class="info-item"><span class="info-label">Cônjuge</span><span class="info-value">${m.nome_conjuge || '—'}</span></div>
        <div class="info-item"><span class="info-label">Filhos</span><span class="info-value">${m.filhos ? m.qtd_filhos + ' filho(s)' : 'Não'}</span></div>
        <div class="info-item"><span class="info-label">Emergência</span><span class="info-value">${m.emergencia_nome ? m.emergencia_nome + ' (' + (m.emergencia_parentesco||'') + ')' : '—'}</span></div>
        <div class="info-item"><span class="info-label">Tel. Emergência</span><span class="info-value">${m.emergencia_telefone || '—'}</span></div>
        <div class="info-item"><span class="info-label">Instagram</span><span class="info-value">${m.instagram || '—'}</span></div>
        <div class="info-item"><span class="info-label">Divulgar aniversário</span><span class="info-value">${fmtBool(m.participar_aniversarios)}</span></div>
        <div class="info-item"><span class="info-label">Último acesso</span><span class="info-value">${m.ultimo_acesso ? new Date(m.ultimo_acesso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'Nunca'}</span></div>
        <div class="info-item"><span class="info-label">Cadastrado em</span><span class="info-value">${fmtDate(m.criado_em)}</span></div>
      </div>

      ${m.testemunho ? `<div style="margin-top:16px;"><strong>Testemunho:</strong><p style="margin-top:4px;color:var(--gray-text);font-style:italic;">${m.testemunho}</p></div>` : ''}

      <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="toggleRole('${m.id}','${m.role}')">Trocar Role (${m.role})</button>
        <button class="btn btn-secondary" onclick="toggleStatus('${m.id}','${m.status}')">Trocar Status (${m.status})</button>
        <button class="btn btn-danger" onclick="deleteUser('${m.id}','${m.nome_completo}')">Excluir (LGPD)</button>
      </div>

      ${logs.length > 0 ? `
        <div style="margin-top:24px;">
          <h4 style="margin-bottom:8px;">Histórico de Auditoria</h4>
          <div style="max-height:200px;overflow-y:auto;">
            ${logs.slice(0,20).map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--neu-out);font-size:0.8rem;"><strong>${l.acao}</strong> — ${l.detalhes||''} <span style="color:var(--gray-text);">${formatDate(l.timestamp)}</span></div>`).join('')}
          </div>
        </div>` : ''}
    `;

    document.getElementById('memberModal').style.display = 'flex';
  } catch (err) { alert(err.message); }
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

async function toggleRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'membro' : 'admin';
  try {
    await API.admin.atualizarUsuario(id, { role: newRole });
    verMembro(id);
    loadAdminStats();
    loadAdminUsers();
  } catch (err) { alert(err.message); }
}

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
  try {
    await API.admin.atualizarUsuario(id, { status: newStatus });
    verMembro(id);
    loadAdminStats();
    loadAdminUsers();
  } catch (err) { alert(err.message); }
}

async function deleteUser(id, nome) {
  if (!confirm(`Confirmar exclusão de "${nome}"? Os dados serão anonimados conforme a LGPD.`)) return;
  try {
    await API.admin.excluirUsuario(id);
    closeModal('memberModal');
    loadAdminStats();
    loadAdminUsers();
  } catch (err) { alert(err.message); }
}

async function exportarCSV() {
  try {
    const res = await fetch('/api/admin/exportar-csv', {
      headers: { Authorization: `Bearer ${API.getToken()}` },
    });
    if (!res.ok) throw new Error('Erro ao exportar');
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membros-missao-reviver-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) { alert('Erro ao exportar: ' + err.message); }
}

// ═══════════════════════════════════════════════
//  ANIVERSARIANTES (ADMIN)
// ═══════════════════════════════════════════════

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

async function loadAdminAniversariantes() {
  try {
    const mesAtual = new Date().getMonth() + 1;
    const data = await API.aniversariantesAdmin(mesAtual);
    const anivs = data.aniversariantes || [];
    const el = document.getElementById('adminAnivList');
    if (!el) return;

    const tituloEl = document.getElementById('adminAnivTitulo');
    if (tituloEl) tituloEl.textContent = `Aniversariantes de ${MESES[mesAtual-1]}`;

    if (anivs.length === 0) {
      el.innerHTML = '<p style="text-align:center;color:var(--gray-text);padding:20px;">Nenhum aniversariante este mês.</p>';
      return;
    }

    el.innerHTML = anivs.map(a => `
      <div class="birthday-item">
        <div class="birthday-avatar">${(a.nome_completo||'?').split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
        <div class="b-info">
          <div class="b-name">${a.nome_completo}</div>
          <div class="b-date">Dia ${a.dia} de ${MESES[mesAtual-1]}${a.idade ? ' · Faz ' + a.idade + ' anos' : ''}</div>
          ${a.ministerio ? '<div style="font-size:0.72rem;color:var(--teal);margin-top:2px;">🛡️ ' + a.ministerio + '</div>' : ''}
          ${!a.participar_aniversarios ? '<div style="font-size:0.72rem;color:var(--gray-text);">⚠️ Optou por não divulgar</div>' : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${a.telefone ? '<a href="' + gerarLinkWhatsApp(a.telefone, a.nome_completo) + '" target="_blank" class="btn btn-primary btn-sm" style="text-decoration:none;">📱 WhatsApp</a>' : '<span style="font-size:0.75rem;color:var(--gray-text);">Sem telefone</span>'}
          <span class="b-icon">🎂</span>
        </div>
      </div>
    `).join('');
  } catch (err) { console.error(err); }
}

// ═══════════════════════════════════════════════
//  WHATSAPP
// ═══════════════════════════════════════════════

function gerarLinkWhatsApp(telefone, nome) {
  let numero = (telefone || '').replace(/\D/g, '');
  if (numero.length === 11 || numero.length === 10) numero = '55' + numero;

  const primeiroNome = nome.split(' ')[0];
  const mensagem = `Olá ${primeiroNome}! 🎉🎂\n\nA Comunidade Cristã Missão Reviver deseja a você um Feliz Aniversário! Que Deus abençoe sua vida com saúde, alegria e paz. Que este novo ciclo de vida seja repleto das bênçãos do Senhor. 🙏✨\n\n"Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais." — Jeremias 29:11\n\nCom amor,\nFamília Missão Reviver 💙`;

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

// ── Override do switchTab no admin ──
if (document.body && document.body.getAttribute('data-page') === 'admin') {
  const originalSwitchTabAdmin = window.switchTab;
  window.switchTab = function(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const content = document.getElementById(`tab-${tabName}`);
    if (content) content.classList.add('active');
    if (btn) btn.classList.add('active');
    if (tabName === 'aniversariantes') loadAdminAniversariantes();
  };
}

// ── Modal: Criar usuário ──
async function adminCriarUsuario() {
  const nome = document.getElementById('newNome').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const telefone = document.getElementById('newTelefone').value.trim();
  const senha = document.getElementById('newSenha').value;
  const role = document.getElementById('newRole').value;

  try {
    await API.admin.criarUsuario({ nome_completo: nome, email, telefone, senha, role });
    showAlert('newUserAlert', 'Usuário criado com sucesso!', 'success');
    document.getElementById('newUserForm').reset();
    setTimeout(() => {
      document.getElementById('newUserModal').style.display = 'none';
      loadAdminUsers();
      loadAdminStats();
    }, 1200);
  } catch (err) {
    showAlert('newUserAlert', err.message);
  }
}

// ── Log de auditoria ──
async function loadAuditoria() {
  try {
    const data = await API.admin.auditoria();
    const logs = data.logs || [];
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--gray-text);">Nenhum registro.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${l.acao}</td>
        <td>${l.detalhes || '—'}</td>
        <td>${formatDate(l.timestamp)}</td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

// ═══════════════════════════════════════════════
//  LGPD
// ═══════════════════════════════════════════════

async function exportarMeusDados() {
  try {
    const dados = await API.lgpd.exportarDados();
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-lgpd-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('lgpdAlert', 'Dados exportados com sucesso!', 'success');
  } catch (err) {
    showAlert('lgpdAlert', err.message);
  }
}

async function solicitarExclusao() {
  if (!confirm('ATENÇÃO: Esta ação é IRREVERSÍVEL. Todos os seus dados serão anonimizados conforme a LGPD. Continuar?')) return;
  if (!confirm('Confirma novamente? Esta é sua última chance de cancelar.')) return;

  try {
    await API.lgpd.solicitarExclusao();
    API.setToken(null);
    alert('Seus dados foram anonimizados conforme a LGPD.');
    window.location.href = 'login.html';
  } catch (err) {
    alert(err.message);
  }
}

// ═══════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const content = document.getElementById(`tab-${name}`);
  if (content) content.classList.add('active');
  if (name === 'audit') loadAuditoria();
}

// ═══════════════════════════════════════════════
//  INIT — Detecta página atual
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'login') {
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  }

  if (page === 'register') {
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  }

  if (page === 'dashboard') {
    initDashboard();
  }

  if (page === 'admin') {
    // initAdmin() é chamado pelo script inline do admin.html
    // Não chamamos aqui para evitar execução duplicada
  }
});
