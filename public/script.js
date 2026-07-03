// ============================================
//  COMUNIDADE CRISTÃ MISSÃO REVIVER
//  script.js — Interações e animações
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ── MENU MOBILE ──────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  // ── NAVBAR SCROLL ─────────────────────────────
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(10, 42, 110, 1)';
      nav.style.boxShadow  = '0 4px 20px rgba(0,0,0,0.3)';
    } else {
      nav.style.background = 'rgba(10, 42, 110, 0.95)';
      nav.style.boxShadow  = 'none';
    }
  });

  // ── ANIMAÇÃO DE ENTRADA ──────────────────────
  const animElements = document.querySelectorAll(
    '.culto-card, .ministerio-card, .evento-item, .sobre-pillar, .stat-item, .contato-card'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animElements.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // ── CONTADOR DE ESTATÍSTICAS ──────────────────
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        let current  = 0;
        const step   = Math.ceil(target / 60);
        const timer  = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current.toLocaleString('pt-BR') + suffix;
        }, 25);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => countObserver.observe(el));

  // ── SMOOTH SCROLL COM OFFSET ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── HIGHLIGHT LINK ATIVO NA NAV ──────────────
  const sections = document.querySelectorAll('section[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => navObserver.observe(sec));

  // ══════════════════════════════════════════════
  //  CARROSSEL INFINITO DE FLYERS
  //  Técnica: clona os slides para criar loop
  //  contínuo sem travamento visual.
  // ══════════════════════════════════════════════
  const track         = document.getElementById('carouselTrack');
  const prevBtn       = document.getElementById('prevBtn');
  const nextBtn       = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const originalSlides = Array.from(track.querySelectorAll('.flyer-slide'));
  const totalOriginal  = originalSlides.length;

  // ── Clonar slides antes e depois para loop suave ──
  originalSlides.forEach(slide => {
    const cloneBefore = slide.cloneNode(true);
    const cloneAfter  = slide.cloneNode(true);
    cloneBefore.setAttribute('aria-hidden', 'true');
    cloneAfter.setAttribute('aria-hidden', 'true');
    cloneBefore.classList.add('clone');
    cloneAfter.classList.add('clone');
    track.insertBefore(cloneBefore, track.firstChild);
    track.appendChild(cloneAfter);
  });

  const allSlides  = Array.from(track.querySelectorAll('.flyer-slide'));
  let currentIndex = totalOriginal; // começa no primeiro slide real (após os clones)
  let isTransitioning = false;
  let paused = false;

  function getSlidesPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function getSlideWidth() {
    const slideEl = allSlides[0];
    const gap = 20;
    return slideEl.offsetWidth + gap;
  }

  function setPosition(index, animate) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    track.style.transform  = `translateX(-${index * getSlideWidth()}px)`;
  }

  function goTo(index, animate = true) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;
    setPosition(currentIndex, animate);
  }

  // Ao terminar a transição, verifica se precisa "saltar" para o clone real
  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    // Se chegou nos clones do fim → salta para os originais sem animação
    if (currentIndex >= totalOriginal * 2) {
      currentIndex = totalOriginal;
      setPosition(currentIndex, false);
    }
    // Se chegou nos clones do início → salta para os originais sem animação
    if (currentIndex < totalOriginal) {
      currentIndex = totalOriginal * 2 - 1;
      setPosition(currentIndex, false);
    }

    updateDots();
  });

  // ── Dots (apenas para os slides originais) ──
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalOriginal; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(totalOriginal + i);
        paused = true;
        setTimeout(() => { paused = false; }, 6000);
      });
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    const realIndex = (currentIndex - totalOriginal + totalOriginal) % totalOriginal;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === realIndex);
    });
  }

  // ── Botões prev / next ──
  prevBtn.addEventListener('click', () => {
    goTo(currentIndex - 1);
    paused = true;
    setTimeout(() => { paused = false; }, 6000);
  });

  nextBtn.addEventListener('click', () => {
    goTo(currentIndex + 1);
    paused = true;
    setTimeout(() => { paused = false; }, 6000);
  });

  // ── Swipe touch ──
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    paused = true;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goTo(currentIndex + 1);
      else          goTo(currentIndex - 1);
    }
    setTimeout(() => { paused = false; }, 6000);
  });

  // ── Pausar ao hover ──
  const wrapper = track.closest('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  // ── Auto-play contínuo ──
  const INTERVAL_MS = 3000; // 3 segundos entre cada slide

  setInterval(() => {
    if (!paused) goTo(currentIndex + 1);
  }, INTERVAL_MS);

  // ── Responsivo ──
  window.addEventListener('resize', () => {
    setPosition(currentIndex, false);
  });

  // ── Init ──
  setPosition(currentIndex, false);
  buildDots();

});

// ══════════════════════════════════════════════
//  MODAL DE MINISTÉRIOS
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {

  const ministeriosData = {
    louvor: {
      emoji: '🎵',
      titulo: 'Ministério de Louvor',
      tag: 'Toda semana',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/b4eb0b140_Louvor.png',
      mensagem: 'O Ministério de Louvor existe para conduzir a igreja a um encontro genuíno com a presença de Deus através da música e da adoração. Buscamos excelência técnica ao serviço da unção, levando cada culto a se tornar um verdadeiro altar de adoração. Se você tem um dom musical ou vocal e sente o chamado para servir, venha fazer parte da nossa equipe!'
    },
    infantil: {
      emoji: '👶',
      titulo: 'Ministério Infantil',
      tag: 'Domingos',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/5bf312ba5_Infantil.png',
      mensagem: 'Cuidamos das crianças com muito amor, ensinando a Palavra de Deus de forma leve, lúdica e transformadora. Nossas salas são preparadas com atividades, louvor infantil e histórias bíblicas para que os pequenos cresçam firmados na fé desde cedo. Um espaço seguro e alegre para os filhos da nossa igreja.'
    },
    jovens: {
      emoji: '🎓',
      titulo: 'Jovens Reviver',
      tag: 'Sábados',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/fc8c208cf_Juventude.png',
      mensagem: 'O Jovens Reviver é um espaço vivo, dinâmico e cheio de propósito para a juventude da nossa igreja. Aqui discutimos os desafios reais da vida cristã na adolescência e juventude, com uma linguagem atual e muita comunhão. Vem com a gente construir uma geração que vive o evangelho com ousadia!'
    },
    casais: {
      emoji: '👨‍👩‍👧‍👦',
      titulo: 'Ministério de Casais',
      tag: 'Mensal',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/dc54c54de_Casais.png',
      mensagem: 'Acreditamos que o casamento é uma instituição divina que merece ser cuidada e fortalecida continuamente. Nossos encontros mensais trazem ensino bíblico, dinâmicas e momentos de comunhão para casais em todas as fases do relacionamento — noivos, recém-casados ou casados há décadas. Fortalecendo lares, edificamos a igreja.'
    },
    social: {
      emoji: '🤝',
      titulo: 'Ação Social',
      tag: 'Quinzenal',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/6801954c0_aaosocial.png',
      mensagem: 'Colocamos a fé em prática amando ao próximo de forma concreta. Através de distribuição de alimentos, roupas e atendimento humanizado, levamos esperança às famílias em situação de vulnerabilidade em Betim e região. Se você quer servir com as mãos e o coração, esse é o seu lugar.'
    },
    missoes: {
      emoji: '🌐',
      titulo: 'Missões',
      tag: 'Contínuo',
      imagem: 'https://media.base44.com/images/public/6a443242a10f3bc165c0860e/5907599e7_misso.png',
      mensagem: 'Levamos o evangelho além dos muros da nossa igreja, apoiando missionários e projetos evangelísticos no Brasil e no mundo. Cremos na Grande Comissão e investimos oração, recursos e envio de pessoas para que mais vidas conheçam o amor de Cristo, onde quer que estejam.'
    }
  };

  const modalOverlay   = document.getElementById('ministerioModal');
  const modalClose     = document.getElementById('ministerioModalClose');
  const modalImg       = document.getElementById('ministerioModalImg');
  const modalEmoji     = document.getElementById('ministerioModalEmoji');
  const modalTitle     = document.getElementById('ministerioModalTitle');
  const modalTag       = document.getElementById('ministerioModalTag');
  const modalMessage   = document.getElementById('ministerioModalMessage');
  const ministerioCards = document.querySelectorAll('.ministerio-card');

  if (!modalOverlay) return;

  function openModal(key) {
    const data = ministeriosData[key];
    if (!data) return;

    modalImg.src = data.imagem;
    modalImg.alt = data.titulo;
    modalEmoji.textContent = data.emoji;
    modalTitle.textContent = data.titulo;
    modalTag.textContent   = data.tag;
    modalMessage.textContent = data.mensagem;

    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  ministerioCards.forEach(card => {
    card.addEventListener('click', () => openModal(card.getAttribute('data-ministerio')));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.getAttribute('data-ministerio'));
      }
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

});
