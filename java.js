/* ============================================================
   NutriCoach AI — scripts da landing page
   ============================================================ */

/* ---------- Contador de oferta ----------
   Reinicia por sessão do navegador (não é um prazo global fixo
   pra todo mundo, é só um lembrete de tempo pra decidir). */
(function () {
  var KEY = 'ncoach_offer_deadline';
  var DURATION = 20 * 60 * 1000; // 20 minutos
  var deadline = Number(sessionStorage.getItem(KEY));

  if (!deadline || deadline < Date.now()) {
    deadline = Date.now() + DURATION;
    try { sessionStorage.setItem(KEY, String(deadline)); } catch (e) {}
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var diff = Math.max(0, deadline - Date.now());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    ['cdH2', 'cdM2', 'cdS2'].forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el) el.textContent = pad([h, m, s][i]);
    });
  }

  tick();
  setInterval(tick, 1000);
})();

/* ---------- Modal "Já tenho acesso" ---------- */
function openAccess() {
  var ov = document.getElementById('accessOv');
  if (!ov) return;
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAccess() {
  var ov = document.getElementById('accessOv');
  if (!ov) return;
  ov.classList.remove('open');
  document.body.style.overflow = '';
}

(function () {
  var ov = document.getElementById('accessOv');
  if (ov) {
    // fecha ao clicar no fundo escuro (fora do card)
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeAccess();
    });
  }

  /* ---------- Lightbox das fotos do app ---------- */
  var lightbox = document.getElementById('photoLightbox');
  var lightboxImg = document.getElementById('lightboxImage');
  var lightboxClose = lightbox ? lightbox.querySelector('.photo-lightbox-close') : null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.app-photo').forEach(function (fig) {
    var img0 = fig.querySelector('img');
    // reconcilia imagens que já estavam em cache antes do onload inline
    if (img0 && img0.complete) {
      if (img0.naturalWidth > 0) img0.classList.add('loaded');
      else img0.classList.add('failed');
    }

    function trigger() {
      var img = fig.querySelector('img');
      // só abre se a imagem realmente carregou
      var ok = img && (img.classList.contains('loaded') || (img.complete && img.naturalWidth > 0));
      if (ok) openLightbox(img.src, img.alt);
    }
    fig.addEventListener('click', trigger);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ESC fecha modal e lightbox */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAccess(); closeLightbox(); }
  });
})();

/* ============================================================
   Efeitos de scroll (vanilla, sem biblioteca)
   ============================================================ */
(function () {
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Barra de progresso no topo ---------- */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  var header = document.querySelector('header.top');
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var scrolled = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    progress.style.width = pct + '%';

    if (header) header.classList.toggle('scrolled', scrolled > 24);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal das seções (fade + slide-up) ---------- */
  var targets = document.querySelectorAll(
    'section, .strip, footer, .feat, .step, .proof, .mini-feature, .app-photo, .audience-list > div'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll suave nas âncoras (#comprar etc.) ---------- */
  function headerOffset() {
    var bar = document.querySelector('.sticky-bar');
    var h = header ? header.getBoundingClientRect().height : 0;
    var b = bar ? bar.getBoundingClientRect().height : 0;
    return h + b + 12;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({
        top: top,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();
