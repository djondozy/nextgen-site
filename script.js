/* Next Gen Solutions — interactions (GSAP + ScrollTrigger ; Three.js chargé en différé) */
const WHATSAPP_NUMBER = "229XXXXXXXX"; // à remplacer par le numéro WhatsApp Business validé
const WA_TEXT = "Bonjour Next Gen Solutions, je souhaite parler d'un projet.";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const anim = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduce;
if (!anim) root.classList.add('no-anim');
if (anim) gsap.registerPlugin(ScrollTrigger);

/* ---------- Liens WhatsApp ---------- */
$$('.js-wa').forEach(a => {
  a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  a.target = '_blank'; a.rel = 'noopener';
  a.insertAdjacentHTML('beforeend', '<span class="hp"> (nouvel onglet)</span>');
});

/* ---------- Menu mobile ---------- */
const burger = $('.burger'), menu = $('#menu-mobile'), bar = $('.nav-bar');
function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  bar.classList.toggle('menu-open', open); document.documentElement.classList.toggle('menu-open-page', open);
  if (open && anim) gsap.fromTo($$('nav a, .btn', menu), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .45, ease: 'power3.out' });
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth >= 1000 && !menu.hidden) setMenu(false); });

/* ---------- Barre : bordure, masquage au défilement, lien actif ---------- */
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  bar.classList.toggle('scrolled', y > 8);
  if (anim && menu.hidden) { if (y > 400 && y > lastY + 4) bar.classList.add('hide'); else if (y < lastY - 4 || y < 400) bar.classList.remove('hide'); }
  lastY = y;
}, { passive: true });
const links = $$('.nav a');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
$$('main section[id]').forEach(s => io.observe(s));

/* ---------- Bouton WhatsApp flottant ---------- */
const waF = $('.wa-float');
if (waF) {
  const contactSec = $('#contact');
  const upd = () => { const r = contactSec.getBoundingClientRect(); waF.classList.toggle('show', scrollY > innerHeight * .8 && !(r.top < innerHeight * .6 && r.bottom > 0)); };
  addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------- « Parler de ce projet » : pré-remplit le type ---------- */
$$('.js-type').forEach(a => a.addEventListener('click', () => { const s = $('#f-type'); if (s) s.value = a.dataset.type; }));

/* ---------- À propos : texte découpé en mots (mots-clés en gras surlignés) ---------- */
const st = $('.statement');
if (st) {
  st.setAttribute('aria-label', st.textContent.replace(/\s+/g, ' ').trim());
  const wrap = (t, c) => t.split(/(\s+)/).map(x => !x || /^\s+$/.test(x) ? x : `<span class="w${c}" aria-hidden="true">${x}</span>`).join('');
  st.innerHTML = [...st.childNodes].map(n => n.nodeType === 3 ? wrap(n.textContent, '') : n.tagName === 'STRONG' ? `<strong class="kw">${wrap(n.textContent, ' k')}</strong>` : n.outerHTML).join('');
  if (!anim) $$('.w, .kw, .pi', st).forEach(e => e.classList.add('on'));
}

/* ---------- Services : un domaine actif à la fois ---------- */
const items = $$('.svc-item'), icos = $$('.sv-ico'), svNum = $('.sv-num');
function setSvc(i) {
  items.forEach((it, j) => { it.classList.toggle('on', j === i); $('.svc-head', it).setAttribute('aria-expanded', innerWidth >= 1000 ? String(j === i) : 'true'); });
  icos.forEach((ic, j) => ic.classList.toggle('on', j === i));
  if (svNum) svNum.textContent = String(i + 1).padStart(2, '0');
}
items.forEach((it, i) => {
  $('.svc-head', it).addEventListener('click', () => setSvc(i));
  if (fine) $('.svc-head', it).addEventListener('mouseenter', () => setSvc(i));
});
setSvc(0);

/* ---------- Formulaire (prototype : validation navigateur, aucun envoi) ---------- */
const form = $('#contact-form');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, PHONE = /^\+?\d{8,15}$/;
function err(id, inputId, msg) {
  const e = $('#e-' + id), i = $('#' + inputId);
  e.textContent = msg || ''; i.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const d = [i.id === 'f-desc' ? 'h-desc' : '', msg ? 'e-' + id : ''].filter(Boolean).join(' ');
  d ? i.setAttribute('aria-describedby', d) : i.removeAttribute('aria-describedby');
  return !msg;
}
form.addEventListener('submit', ev => {
  ev.preventDefault();
  const v = id => $('#' + id).value.trim(), tel = v('f-tel').replace(/[\s.\-()]/g, '');
  const ok = [
    err('nom', 'f-nom', v('f-nom') ? '' : 'Indiquez votre nom.'),
    err('org', 'f-org', v('f-org') ? '' : 'Indiquez votre organisation (ou « Particulier »).'),
    err('email', 'f-email', !v('f-email') ? 'Indiquez votre e-mail.' : EMAIL.test(v('f-email')) ? '' : 'Cette adresse e-mail ne semble pas valide.'),
    err('tel', 'f-tel', !tel || PHONE.test(tel) ? '' : 'Numéro invalide (ex. +229 01 00 00 00 00).'),
    err('type', 'f-type', v('f-type') ? '' : 'Choisissez un type de projet.'),
    err('desc', 'f-desc', v('f-desc').length >= 20 ? '' : 'Décrivez votre projet en au moins 20 caractères.'),
    err('consent', 'f-consent', $('#f-consent').checked ? '' : 'Votre accord est nécessaire pour être recontacté.'),
  ].every(Boolean);
  const status = $('.confirm', form);
  if (!ok) { status.textContent = ''; const f = $('[aria-invalid="true"]', form); f && f.focus(); return; }
  const nom = v('f-nom'), robot = !!$('#f-site').value;
  form.reset();
  if (robot) return;
  status.textContent = `Merci ${nom}, votre demande est bien enregistrée. Nous revenons vers vous rapidement. (Prototype : aucun envoi réel.)`;
  if (anim) gsap.fromTo(status, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
});

/* ---------- FAQ : une réponse à la fois, ouverture douce ---------- */
$$('.qa').forEach(d => {
  const sum = $('summary', d), ans = $('.ans', d);
  sum.addEventListener('click', e => {
    if (!anim) return;
    e.preventDefault();
    const close = (o, a) => gsap.to(a, { height: 0, opacity: 0, duration: .3, ease: 'power2.inOut', onComplete: () => { o.open = false; gsap.set(a, { clearProps: 'height,opacity' }); } });
    if (d.open) return close(d, ans);
    $$('.qa[open]').forEach(o => o !== d && close(o, $('.ans', o)));
    d.open = true; gsap.fromTo(ans, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .45, ease: 'power3.out' });
  });
});

/* =================== ANIMATIONS =================== */
if (anim) {
  root.classList.add('ready');

  /* Accueil : lettres, soulignement, et la marque (deux chevrons) qui se trace */
  $$('.sp').forEach(sp => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) { const f = document.createDocumentFragment(); [...c.textContent].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch === ' ' ? ' ' : ch; f.appendChild(s); }); c.replaceWith(f); }
      else if (c.nodeType === 1 && !c.classList.contains('hl')) walk(c);
    });
    walk(sp);
  });
  $('.hero-title').setAttribute('aria-label', 'La nouvelle génération du digital');
  $$('.hero-title .ln').forEach(l => l.setAttribute('aria-hidden', 'true'));
  const hl = $('.hl');
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.fromTo('.hero-title .ch, .hero-title .hl', { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.05, stagger: .022 }, .1)
    .to('.hero .r', { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }, .45);
  const mk = $$('.mark polyline');
  mk.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  intro.to(mk, { strokeDashoffset: 0, duration: 1.1, stagger: .2, ease: 'power2.inOut' }, .3)
    .add(() => {
      // respiration : les deux chevrons avancent ensemble, en décalé
      mk.forEach((p, i) => gsap.to(p, { x: 6, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .18 }));
    });

  gsap.to('.hero-grid', { yPercent: -10, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  ScrollTrigger.defaults({ toggleActions: 'play none none reverse' });
  /* Titres et blocs : apparitions */
  /* Apparitions dans les deux sens : en descendant elles montent, en remontant elles descendent */
  /* on ne cache que ce qui est vraiment sorti de l'écran (évite tout bloc invisible) */
  const above = b => b.filter(e => e.getBoundingClientRect().bottom < 0);
  const below = b => b.filter(e => e.getBoundingClientRect().top > innerHeight);
  $$('.h2.rv').forEach(h => gsap.fromTo(h, { clipPath: 'inset(0 0 100% 0)', y: 40 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 92%', toggleActions: 'play none none reverse' } }));
  $$('main .r').forEach(el => { if (el.closest('.hero')) return; gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' } }); });
  gsap.to('.read-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* À propos : mot à mot, surlignage, pastilles */
  const words = $$('.statement .w');
  ScrollTrigger.create({ trigger: '.statement', start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: s => {
    const n = Math.round(s.progress * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
    $$('.statement .kw').forEach(k => k.classList.toggle('on', $$('.w', k).every(w => w.classList.contains('on'))));
    $$('.statement .pi').forEach(p => { const pr = p.previousElementSibling; p.classList.toggle('on', !!pr && pr.classList.contains('on')); });
  } });
  $$('.engage svg').forEach(svg => {
    const parts = $$('path, circle', svg);
    parts.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.to(parts, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .15, scrollTrigger: { trigger: svg, start: 'top 88%' } });
  });
  if (fine) $$('.vm-card').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); gsap.to(el, { rotateY: ((e.clientX - r.left) / r.width - .5) * 5, rotateX: (.5 - (e.clientY - r.top) / r.height) * 5, transformPerspective: 1000, duration: .5 }); });
    el.addEventListener('mouseleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }));
  });

  /* Services : sur grand écran, le domaine actif suit le défilement */
  gsap.matchMedia().add('(min-width: 1000px)', () => {
    items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: 'top 55%', end: 'bottom 55%', onEnter: () => setSvc(i), onEnterBack: () => setSvc(i) }));
  });

  /* Humain × technologie */
  if ($('.meet')) {
    gsap.set('.meet-t span, .meet-sub', { yPercent: 60, opacity: 0 });
    const mt = gsap.timeline({ scrollTrigger: { trigger: '.meet', start: 'top 70%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' } });
    mt.to('.meet-t span', { yPercent: 0, opacity: 1, stagger: .14, duration: .9, ease: 'power4.out' })
      .to('.meet-sub', { yPercent: 0, opacity: 1, duration: .7, ease: 'power3.out' }, '-=.5');
    gsap.fromTo('.meet-img', { scale: .92, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.meet', start: 'top bottom', end: 'bottom 60%', scrub: true } });
    // les deux mains se rapprochent avec le défilement, l'étincelle part au contact
    const sp = $('.spark'), ring = $('.spark-ring'); let touched = false;
    const touch = on => { if (on === touched) return; touched = on;
      if (on) { gsap.fromTo(sp, { opacity: 0, scale: .2 }, { opacity: 1, scale: 1.3, duration: .3, ease: 'power2.out', onComplete: () => gsap.to(sp, { opacity: .75, scale: 1, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }) });
        gsap.fromTo(ring, { opacity: .9, scale: .2 }, { opacity: 0, scale: 2.6, duration: 1.1, ease: 'power2.out' }); }
      else { gsap.killTweensOf(sp); gsap.to(sp, { opacity: 0, duration: .3 }); } };
    gsap.timeline({ scrollTrigger: { trigger: '.meet-img', start: 'top 90%', end: 'center 50%', scrub: true, onUpdate: t => touch(t.progress > .985) } })
      .fromTo('.mi-l', { xPercent: -16, rotate: -2 }, { xPercent: 0, rotate: 0, ease: 'power1.out' }, 0)
      .fromTo('.mi-r', { xPercent: 16, rotate: 2 }, { xPercent: 0, rotate: 0, ease: 'power1.out' }, 0);
  }

  /* Méthode */
  const steps = $('.steps');
  const fill = document.createElement('span'); fill.className = 'steps-fill'; fill.setAttribute('aria-hidden', 'true'); steps.prepend(fill);
  gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 65%', end: 'bottom 65%', scrub: true } });
  $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 66%', end: 'max', onToggle: t => s.classList.toggle('on', t.isActive) }));
  $$('.step').forEach(st => {
    gsap.from(st.querySelector('.sn'), { scale: 0, duration: .7, ease: 'back.out(2)', scrollTrigger: { trigger: st, start: 'top 78%', toggleActions: 'play none none reverse' } });
    gsap.from(st.querySelector('div'), { x: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: st, start: 'top 78%', toggleActions: 'play none none reverse' } });
  });

  /* Équipe : les noms arrivent un à un */
  gsap.from('.tm', { opacity: 0, y: 60, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.team-grid', start: 'top 85%' } });
  gsap.from('.tm-ph', { clipPath: 'inset(100% 0 0 0)', stagger: .08, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.team-grid', start: 'top 85%' } });

  /* Réalisations, contact, pied de page */
  gsap.fromTo('.prep-visual', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.prep', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('#contact-form .field, #contact-form .consent, #contact-form .btn', { opacity: 0, y: 24, stagger: .06, duration: .6, ease: 'power3.out', scrollTrigger: { trigger: '#contact-form', start: 'top 80%' } });
  gsap.from('.coords li', { opacity: 0, x: -20, stagger: .1, duration: .6, ease: 'power3.out', scrollTrigger: { trigger: '.coords', start: 'top 90%' } });
  gsap.fromTo('.foot-giant', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 50%', scrub: true } });
} else {
  $$('.step').forEach(s => s.classList.add('on'));
  $$('.sp-steps li').forEach(s => s.classList.add('on'));
}

/* =================== SCÈNE 1 : devis automatique (ordinateur) =================== */
(function sceneDevis() {
  const sec = $('.scene-web'); if (!sec) return;
  const lid = $('.lid', sec), lap = $('.laptop', sec), wf = $$('.wf li', sec), chips = $$('.scene-steps li', sec);
  const chip = i => chips.forEach((c, j) => c.classList.toggle('on', j <= i));
  if (!anim) { wf.forEach(s => s.classList.add('done')); chip(3); return; }
  gsap.matchMedia().add({ big: '(min-width: 900px)', small: '(max-width: 899px)' }, ctx => {
    const big = ctx.conditions.big;
    const tl = gsap.timeline({ scrollTrigger: big ? { trigger: sec, start: 'top top', end: '+=170%', scrub: true, pin: '.scene-stage', anticipatePin: 1, invalidateOnRefresh: true } : { trigger: lap, start: 'top 95%', end: 'top 35%', scrub: true } })
      .fromTo(lap, { yPercent: 28, scale: .86 }, { yPercent: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0)
      .fromTo(lid, { rotateX: -88 }, { rotateX: 0, duration: 1, ease: 'power2.inOut' }, .25)
      .fromTo('.scene-web .shadow', { opacity: 0, scaleX: .4 }, { opacity: 1, scaleX: 1, duration: .8 }, .4);
    if (big) {
      // une fois ouvert, le titre s'efface et l'ordinateur s'agrandit pour remplir l'écran
      const head = $('.scene-head', sec), stage = $('.scene-stage', sec), steps = $('.scene-steps', sec);
      // l'ordinateur grandit vers le haut, dans la place laissée par le titre (le bas ne bouge pas)
      const top0 = 84, fit = () => Math.max(1, Math.min(1.5, (lap.offsetTop + lap.offsetHeight - top0) / lap.offsetHeight, (innerWidth * .94) / lap.offsetWidth));
      gsap.set(lap, { transformOrigin: '50% 100%' });
      tl.fromTo(head, { y: 0, opacity: 1 }, { y: -40, opacity: 0, duration: .45, ease: 'power2.in' }, 1.25)
        .to(lap, { scale: fit, duration: .8, ease: 'power2.inOut' }, 1.35)
        .to({}, { duration: .5 });
    }
  });
  gsap.from('.scene-web .scene-head > *', { y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 75%', toggleActions: 'play none none reverse' } });
  const set = (i, cls) => () => wf.forEach((s, j) => { s.classList.toggle('done', j < i || (cls === 'done' && j === i)); s.classList.toggle('run', cls === 'run' && j === i); });
  const q = x => $$(x, sec);
  const film = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true, defaults: { ease: 'power3.out' } });
  film.add(() => { wf.forEach(s => s.classList.remove('done', 'run')); chip(-1); }, 0)
    .set(q('.bub, .typing, .toast'), { opacity: 0, y: 12, scale: .96 }, 0)
    .to(q('.b1'), { opacity: 1, y: 0, scale: 1, duration: .5 }, .4)
    .add(set(0, 'done'), .6).add(() => chip(0), .6)
    .add(set(1, 'run'), .9)
    .to(q('.typing'), { opacity: 1, y: 0, scale: 1, duration: .35 }, 1.1)
    .add(set(1, 'done'), 1.9).add(() => chip(1), 1.9)
    .to(q('.typing'), { opacity: 0, duration: .2 }, 2.1)
    .to(q('.b2'), { opacity: 1, y: 0, scale: 1, duration: .5 }, 2.2)
    .add(set(2, 'run'), 2.4)
    .add(set(2, 'done'), 3.3).add(() => chip(2), 3.3)
    .to(q('.b3'), { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'back.out(1.8)' }, 3.4)
    .add(set(3, 'done'), 3.8).add(() => chip(3), 3.8)
    .add(set(4, 'run'), 4.1)
    .add(set(4, 'done'), 4.7)
    .to(q('.toast'), { opacity: 1, y: 0, scale: 1, duration: .55, ease: 'back.out(1.6)' }, 4.8)
    .to(q('.bub, .toast'), { opacity: 0, duration: .4, ease: 'power2.in' }, 7.6);
  new IntersectionObserver(([e]) => { e.isIntersecting ? film.play() : film.pause(); }, { threshold: .3 }).observe(lap);
})();

/* =================== SCÈNE 2 : épargne automatique (téléphone) =================== */
(function sceneSaving() {
  const sec = $('.scene-phone'); if (!sec) return;
  const pvs = $$('.pv', sec), steps = $$('.sp-steps li', sec), rn = $('.r-n', sec), tg = $('.tg', sec);
  const show = i => { pvs.forEach((p, j) => p.classList.toggle('on', j === i)); steps.forEach((s, j) => s.classList.toggle('on', j === i)); };
  if (!anim) { show(0); return; }
  const phone = $('.phone', sec);
  gsap.from(phone, { y: 80, rotate: 4, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: phone, start: 'top 85%' } });
  gsap.from('.sp-steps li', { x: -24, stagger: .1, duration: .6, ease: 'power3.out', scrollTrigger: { trigger: '.sp-steps', start: 'top 85%' } });
  const film = gsap.timeline({ repeat: -1, repeatDelay: .6, paused: true, defaults: { ease: 'power3.out' } });
  const swap = (i, at) => film.add(() => show(i), at).fromTo(pvs[i], { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .45, clearProps: 'opacity,x' }, at);
  swap(0, 0);
  film.from($('.goal', sec), { y: 20, opacity: 0, duration: .5 }, .3)
    .from($('.pv1 .due', sec), { y: 20, opacity: 0, duration: .5 }, .55)
    .to($('.pv1 .ph-cta', sec), { scale: .95, duration: .12, yoyo: true, repeat: 1 }, 2.1);
  swap(1, 2.5);
  film.add(() => tg.classList.remove('on'), 2.5).set($('.paid', sec), { opacity: 0, y: 10 }, 2.5)
    .add(() => tg.classList.add('on'), 3.2)
    .to($('.paid', sec), { opacity: 1, y: 0, duration: .5, ease: 'back.out(1.8)' }, 3.6)
    .from($('.paid .ok-c', sec), { scale: 0, rotate: -45, duration: .55, ease: 'back.out(2)' }, 3.6);
  swap(2, 5.2);
  const o = { v: 0 }, C = 314;
  film.fromTo($('.r-fg', sec), { strokeDashoffset: C }, { strokeDashoffset: C * (1 - .62), duration: 1.4, ease: 'power2.out' }, 5.5)
    .fromTo(o, { v: 0 }, { v: 62, duration: 1.4, ease: 'power2.out', onUpdate: () => { rn.textContent = Math.round(o.v); } }, 5.5)
    .from($$('.dep li', sec), { opacity: 0, x: 20, stagger: .12, duration: .4 }, 5.6);
  swap(3, 7.8);
  film.from($('.win-c', sec), { scale: 0, rotate: -45, duration: .6, ease: 'back.out(2)' }, 8)
    .from($$('.win b, .win-amt', sec), { opacity: 0, y: 14, stagger: .12, duration: .5 }, 8.2)
    .to({}, { duration: 1.8 }, 8.8);
  new IntersectionObserver(([e]) => { e.isIntersecting ? film.play() : film.pause(); }, { threshold: .3 }).observe(phone);
})();

/* =================== Three.js : vagues de points (accueil clair + vitrine sombre) =================== */
(function waves() {
  if (reduce || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2) return;
  let lib = null;
  const load = window.__loadThree = () => lib || (lib = new Promise((ok, ko) => { if (window.THREE) return ok(); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }));
  function make(canvas, dark) {
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' }); } catch (e) { return; }
    const small = innerWidth < 768; let dpr = Math.min(devicePixelRatio, small ? 1.25 : 1.75); renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, .1, 100); camera.position.set(0, dark ? 4.2 : 3.2, 9); camera.lookAt(0, 0, 0);
    const NX = small ? 70 : 150, NZ = small ? 36 : 70, W = 28, D = 13, pos = new Float32Array(NX * NZ * 3); let k = 0;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { pos[k++] = (i / (NX - 1) - .5) * W; pos[k++] = 0; pos[k++] = (j / (NZ - 1) - .5) * D; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const uni = { t: { value: 0 }, m: { value: new THREE.Vector2() }, px: { value: dpr }, sc: { value: 0 } };
    const base = dark ? 'vec3(.55,.65,.8)' : 'vec3(.043,.122,.227)', alpha = dark ? '.25 + h*.6' : '.16 + h*.55';
    const mat = new THREE.ShaderMaterial({ uniforms: uni, transparent: true, depthWrite: false,
      vertexShader: `uniform float t; uniform vec2 m; uniform float px; uniform float sc; varying float h; varying float fade;
        void main(){ vec3 p = position; float w = sin(p.x*.45 + t*.9)*.55 + cos(p.z*.6 + t*.7)*.45 + sin((p.x+p.z)*.25 + t*.5)*.35;
          w += .8*exp(-length(p.xz - m*vec2(13.,6.))*.35) + sc*1.2*sin(p.x*.3 + t); p.y = w; h = clamp(w*.5+.5, 0., 1.);
          vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (2. + h*2.4) * px * (9. / -mv.z);
          fade = smoothstep(13.5, 5., length(p.xz)); }`,
      fragmentShader: `varying float h; varying float fade; void main(){ vec2 c = gl_PointCoord - .5; if(length(c) > .5) discard;
          vec3 col = mix(${base}, vec3(.851,.431,.043), smoothstep(.55,.95,h)); gl_FragColor = vec4(col, (${alpha}) * fade); }` });
    scene.add(new THREE.Points(geo, mat));
    const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); }); size();
    const tm = new THREE.Vector2(); let on = true;
    canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); tm.set((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); }, { passive: true });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(canvas);
    canvas.classList.add('on');
    if (anim && !dark) ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { uni.sc.value = s.progress; } });
    let n = 0, acc = 0, last = performance.now(), strikes = 0, stop = false; const clock = new THREE.Clock();
    (function tick(now) {
      if (stop) return; requestAnimationFrame(tick); const dt = now - last; last = now;
      if (!on || document.hidden) return;
      if (++n > 5) { acc += dt; if (n === 65) { const avg = acc / 60; n = 0; acc = 0; if (avg > 24) { strikes++; if (dpr > 1) { dpr = 1; renderer.setPixelRatio(1); uni.px.value = 1; size(); } else if (strikes > 2) { stop = true; canvas.classList.remove('on'); } } } }
      uni.t.value = clock.getElapsedTime(); uni.m.value.lerp(tm, .05); renderer.render(scene, camera);
    })(performance.now());
  }
  const hero = $('.hero-3d'), sc = $('.sc-3d');
  const go = () => load().then(() => hero && make(hero, true)).catch(() => {});
  ('requestIdleCallback' in window) ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 400);
  if (sc) { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { o.disconnect(); load().then(() => make(sc, true)).catch(() => {}); } }, { rootMargin: '400px' }); o.observe(sc); }
})();

/* =================== Champ de chevrons 3D dans l'accueil (instancié, qualité adaptative) =================== */
(function heroChevrons() {
  const canvas = $('.hero-chev');
  if (!canvas || !window.__loadThree) return;
  const start = () => window.__loadThree().then(init).catch(() => {});
  ('requestIdleCallback' in window) ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 500);
  function init() {
    const small = innerWidth < 768, cores = navigator.hardwareConcurrency || 8, mem = navigator.deviceMemory || 8, low = cores <= 4 || mem <= 3;
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !small, powerPreference: 'high-performance' }); } catch (e) { return; }
    let dpr = Math.min(devicePixelRatio, small ? (low ? 1 : 1.25) : 1.75); renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0B1F3A, 9, 27);
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 100); camera.position.set(0, 0, 14);
    const sh = new THREE.Shape();
    sh.moveTo(-.55, 1); sh.lineTo(-.15, 1); sh.lineTo(.55, 0); sh.lineTo(-.15, -1); sh.lineTo(-.55, -1); sh.lineTo(.15, 0); sh.lineTo(-.55, 1);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .28, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 1 }); geo.center();
    const N = small ? (low ? 10 : 16) : (low ? 24 : 40);
    const mats = [new THREE.MeshLambertMaterial({ color: 0xD96E0B, emissive: 0x2a1200 }), new THREE.MeshLambertMaterial({ color: 0xF4F6FA }), new THREE.MeshLambertMaterial({ color: 0x2A4A78 })];
    const counts = [Math.round(N * .3), Math.round(N * .25)]; counts.push(N - counts[0] - counts[1]);
    const dummy = new THREE.Object3D(), group = new THREE.Group(); scene.add(group);
    const sets = mats.map((m, k) => {
      const im = new THREE.InstancedMesh(geo, m, counts[k]); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const data = Array.from({ length: counts[k] }, () => ({
        // plus denses à droite, plus discrets derrière le texte (à gauche)
        x: small ? (Math.random() - .5) * 11 : (Math.random() < .72 ? 1 + Math.random() * 11 : -12 + Math.random() * 10),
        y: (Math.random() - .5) * 12, z: -Math.random() * 12 + 2,
        rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6,
        sx: (Math.random() - .5) * .35, sy: (Math.random() - .5) * .45, fl: Math.random() * 6.28, sp: .3 + Math.random() * .5, s: .35 + Math.random() * .8,
      }));
      group.add(im); return { im, data };
    });
    scene.add(new THREE.AmbientLight(0x8fa0ba, .65));
    const key = new THREE.DirectionalLight(0xffffff, 1); key.position.set(5, 6, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(0xD96E0B, .8); rim.position.set(-6, -3, 6); scene.add(rim);
    const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); }); size();
    let mx = 0, my = 0, cx = 0, cy = 0, sp = 0, on = true;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(canvas);
    if (anim) ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { sp = s.progress; } });
    canvas.classList.add('on');
    // surveillance : si l'appareil peine, on baisse la résolution, puis le nombre de chevrons, puis on coupe
    let n = 0, acc = 0, last = performance.now(), strikes = 0, stop = false;
    const clock = new THREE.Clock();
    (function tick(now) {
      if (stop) return; requestAnimationFrame(tick);
      const dt = now - last; last = now;
      if (!on || document.hidden) return;
      if (++n > 5) { acc += dt; if (n === 65) { const avg = acc / 60; n = 0; acc = 0;
        if (avg > 24) { strikes++;
          if (strikes > 4) { stop = true; canvas.classList.remove('on'); return; }
          if (dpr > 1) { dpr = Math.max(1, dpr - .35); renderer.setPixelRatio(dpr); size(); }
          else sets.forEach(s => { s.im.count = Math.max(1, Math.floor(s.im.count * .6)); });
        } } }
      const t = clock.getElapsedTime(); cx += (mx - cx) * .04; cy += (my - cy) * .04;
      camera.position.x = cx * 2; camera.position.y = -cy * 1.4; camera.lookAt(0, 0, 0);
      sets.forEach(({ im, data }) => {
        for (let i = 0; i < im.count; i++) { const d = data[i];
          dummy.position.set(d.x, d.y + Math.sin(t * d.sp + d.fl) * .3, d.z);
          dummy.rotation.set(d.rx + t * d.sx, d.ry + t * d.sy, d.rz); dummy.scale.setScalar(d.s);
          dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }
        im.instanceMatrix.needsUpdate = true;
      });
      group.rotation.z = sp * .5; group.position.y = sp * 4;
      renderer.render(scene, camera);
    })(performance.now());
  }
})();


/* =================== Effets de l'accueil, vitrine et repères =================== */
if (fine && !reduce) {
  const hero = $('.hero'), bg = $('.hero-bg');
  if (hero && bg) hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); bg.style.setProperty('--sx', (e.clientX - r.left) + 'px'); bg.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }, { passive: true });
}
if (anim) {
  // Phrase qui change
  const rotW = $('.rot-w'), rot = $('.rot');
  if (rotW) {
    const list = ['vos idées deviennent des logiciels', 'vos tâches répétitives s\'automatisent', 'votre entreprise se voit en ligne', 'vos appels d\'offres sont solides', 'vos clients paient comme ils veulent'];
    let i = 0; const fit = () => { rot.style.width = rotW.offsetWidth + 'px'; }; fit();
    setInterval(() => { if (document.hidden) return; i = (i + 1) % list.length;
      gsap.to(rotW, { yPercent: -110, opacity: 0, duration: .4, ease: 'power3.in', onComplete: () => { rotW.textContent = list[i]; fit(); gsap.fromTo(rotW, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out' }); } });
    }, 2600);
  }
  // Étiquettes qui flottent
  const chips = $$('.chip');
  if (chips.length) {
    gsap.from(chips, { opacity: 0, y: 40, rotateX: -30, duration: 1.1, stagger: .18, ease: 'back.out(1.4)', delay: 1.1 });
    chips.forEach((c, i) => gsap.to(c, { y: i % 2 ? -14 : 14, duration: 2.8 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 }));
    if (fine) {
      const hero = $('.hero');
      const qs = chips.map(c => { const inn = $('.c3-in', c), d = +c.dataset.d || 1;
        return { d, x: gsap.quickTo(c, 'x', { duration: .9, ease: 'power3.out' }), ry: gsap.quickTo(inn, 'rotationY', { duration: .9, ease: 'power3.out' }), rx: gsap.quickTo(inn, 'rotationX', { duration: .9, ease: 'power3.out' }), base: c.classList.contains('ch1') || c.classList.contains('ch3') ? 18 : -18 }; });
      hero.addEventListener('pointermove', e => { const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5;
        qs.forEach(q => { q.x(px * 30 * q.d); q.ry(q.base + px * 16); q.rx(6 - py * 12); }); }, { passive: true });
      hero.addEventListener('pointerleave', () => qs.forEach(q => { q.x(0); q.ry(q.base); q.rx(6); }));
      chips.forEach(c => gsap.set($('.c3-in', c), { rotationY: c.classList.contains('ch1') || c.classList.contains('ch3') ? 18 : -18, rotationX: 6 }));
    }
  }
  // Bandeau : défile et accélère avec le défilement
  const tracks = $$('.mq-track');
  if (tracks.length) {
    const loops = tracks.map(t => t.classList.contains('rev') ? gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 40, repeat: -1 }) : gsap.to(t, { xPercent: -50, ease: 'none', duration: 32, repeat: -1 }));
    let boost = 1, dir = 1;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: t => { dir = t.direction; boost = Math.min(5, Math.max(boost, Math.abs(t.getVelocity()) / 400)); } });
    gsap.ticker.add(() => { boost += (1 - boost) * .05; loops.forEach(l => l.timeScale(dir * Math.max(1, boost))); });
    gsap.fromTo('.b-front', { rotate: -6 }, { rotate: -1.5, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.b-back', { rotate: 5 }, { rotate: 1, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  // Vitrine : s'agrandit, les trois chevrons se tracent
  if ($('.showcase')) {
    gsap.fromTo('.showcase', { scale: .9, borderRadius: 48 }, { scale: 1, borderRadius: 28, ease: 'none', scrollTrigger: { trigger: '.showcase-wrap', start: 'top 95%', end: 'top 25%', scrub: true } });
    const sch = $$('.sc-chev polyline');
    sch.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.to(sch, { strokeDashoffset: 0, duration: 1.1, stagger: .2, ease: 'power2.inOut', scrollTrigger: { trigger: '.showcase', start: 'top 75%', toggleActions: 'play none none reverse' },
      onComplete: () => sch.forEach((p, i) => gsap.to(p, { x: 6, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .18 })) });
    gsap.from('.sc-motto', { opacity: 0, y: 24, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.showcase', start: 'top 70%', toggleActions: 'play none none reverse' } });

    // Les 5 axes : chaque carte s'ouvre, le texte se décode, un balayage passe
    const axes = $$('.sc-axes li'), glyphs = '01<>/#_+=*';
    const decode = (el, txt) => { let f = 0; const tot = txt.length + 8; const id = setInterval(() => {
      el.textContent = txt.split('').map((c, k) => c === ' ' ? ' ' : k < f - 8 ? c : glyphs[(Math.random() * glyphs.length) | 0]).join('');
      if (++f > tot) { clearInterval(id); el.textContent = txt; } }, 28); };
    const texts = axes.map(li => $('.ax-t', li).textContent);
    const play = () => {
      axes.forEach((li, i) => {
        gsap.fromTo(li, { clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0)', duration: .55, ease: 'power3.out', delay: .5 + i * .14 });
        gsap.fromTo($('.ax-scan', li), { xPercent: -110 }, { xPercent: 110, duration: .9, ease: 'power2.inOut', delay: .7 + i * .14 });
        setTimeout(() => { decode($('.ax-t', li), texts[i]); li.classList.add('lit'); setTimeout(() => li.classList.remove('lit'), 900); }, (.55 + i * .14) * 1000);
      });
    };
    gsap.set(axes, { clipPath: 'inset(0 100% 0 0)' });
    ScrollTrigger.create({ trigger: '.sc-axes', start: 'top 88%', onEnter: play, onEnterBack: play,
      onLeaveBack: () => gsap.set(axes, { clipPath: 'inset(0 100% 0 0)' }) });
    // de temps en temps, un balayage parcourt les axes
    setInterval(() => { if (document.hidden) return; const li = axes[(Math.random() * axes.length) | 0]; if (!li) return;
      gsap.fromTo($('.ax-scan', li), { xPercent: -110 }, { xPercent: 110, duration: 1, ease: 'power2.inOut' }); }, 2200);

    if (fine) {
      const sc = $('.showcase'), chev = $('.sc-chev');
      sc.addEventListener('mousemove', e => { const r = sc.getBoundingClientRect(); gsap.to(chev, { x: ((e.clientX - r.left) / r.width - .5) * 30, y: ((e.clientY - r.top) / r.height - .5) * 18, duration: .8, ease: 'power3.out' }); });
      sc.addEventListener('mouseleave', () => gsap.to(chev, { x: 0, y: 0, duration: 1, ease: 'power3.out' }));
    }
  }
  // Repère de section : petit trait qui se trace
    if (fine) $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .2, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' }); });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.5)' }));
  });
}


/* Schéma des 5 axes : fils de circuit + impulsions qui partent du cœur */
$$('.sys').forEach(function sysWires(sys) {
  sys.addEventListener('svc', build_ => build());
  const svg = $('.sys-wires', sys), core = $('.sys-core', sys), nodes = $$('.node', sys), NS = 'http://www.w3.org/2000/svg';
  let wires = [], drawn = false;
  const build = () => {
    svg.innerHTML = ''; wires = [];
    const S0 = sys.getBoundingClientRect(), k = S0.width / sys.offsetWidth || 1;
    // coordonnées locales, indépendantes du zoom de la vitrine
    const rel = el => { const r = el.getBoundingClientRect(); const o = { left: (r.left - S0.left) / k, top: (r.top - S0.top) / k, width: r.width / k, height: r.height / k }; o.right = o.left + o.width; o.bottom = o.top + o.height; return o; };
    const S = { left: 0, top: 0 }, C = rel(core);
    const cx = C.left + C.width / 2, cy = C.top + C.height / 2, R = C.width / 2;
    const wide = innerWidth >= 900 && !sys.classList.contains('sys-v');
    nodes.forEach((n, i) => {
      const r = rel(n), ny = r.top + r.height / 2; let d;
      if (wide) {
        const left = r.right < cx, below = r.top > C.bottom;
        if (below) { d = `M${cx},${cy + R} V${r.top}`; }
        else {
          const sx = left ? cx - R : cx + R, ex = left ? r.right : r.left, mx = (sx + ex) / 2, sy = cy + (ny < cy ? -R * .35 : R * .35);
          d = `M${sx},${sy} H${mx} V${ny} H${ex}`;
        }
      } else {
        const bx = 14, ex = r.left;
        d = `M${cx},${cy + R} V${cy + R + 14} H${bx} V${ny} H${ex}`;
      }
      const base = document.createElementNS(NS, 'path'); base.setAttribute('d', d); svg.appendChild(base);
      const on = document.createElementNS(NS, 'path'); on.setAttribute('d', d); on.setAttribute('class', 'w-on' + (n.classList.contains('on') ? ' act' : '')); on.dataset.i = i; svg.appendChild(on);
      const L = on.getTotalLength(); on.style.strokeDasharray = L; on.style.strokeDashoffset = drawn ? 0 : L;
      const end = on.getPointAtLength(L), j = document.createElementNS(NS, 'circle'); j.setAttribute('class', 'joint'); j.setAttribute('cx', end.x); j.setAttribute('cy', end.y); j.setAttribute('r', 3.5); svg.appendChild(j);
      const p = document.createElementNS(NS, 'circle'); p.setAttribute('class', 'pulse'); p.setAttribute('r', 3); p.style.opacity = 0; svg.appendChild(p);
      wires.push({ on, L, p, n, t: -i * .22 });
    });
  };
  build();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  if (!anim) { drawn = true; build(); return; }
  ScrollTrigger.create({ trigger: sys, start: 'top 75%', onEnter: () => { build(); drawn = true; wires.forEach((w, i) => gsap.to(w.on, { strokeDashoffset: 0, duration: 1, delay: .2 + i * .12, ease: 'power2.inOut', onComplete: () => { w.n.classList.add('hit'); setTimeout(() => w.n.classList.remove('hit'), 700); } })); },
    onLeaveBack: () => { drawn = false; wires.forEach(w => { gsap.killTweensOf(w.on); w.on.style.strokeDashoffset = w.L; }); } });
  let vis = false; new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(sys);
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!vis || !drawn) return;
    wires.forEach(w => {
      w.t += dt * .55;
      if (w.t >= 1) { w.t = -Math.random() * 1.2; w.n.classList.add('hit'); setTimeout(() => w.n.classList.remove('hit'), 500); }
      if (w.t < 0) { w.p.style.opacity = 0; return; }
      const pt = w.on.getPointAtLength(w.t * w.L); w.p.setAttribute('cx', pt.x); w.p.setAttribute('cy', pt.y); w.p.style.opacity = 1;
    });
  });
});


/* Services : un domaine actif à la fois, défilement automatique quand visible */
(function svcTabs() {
  const sys = $('.sys-v'); if (!sys) return;
  const nodes = $$('.node', sys), panels = $$('.svc-p'); let cur = 0, timer = null, auto = true, vis = false, prog = null;
  const typeTerm = p => { const lis = $$('.term li', p); lis.forEach(l => l.classList.remove('on', 'done'));
    lis.forEach((l, k) => setTimeout(() => { if (!p.classList.contains('on')) return; if (k) lis[k - 1].classList.add('done'); l.classList.add('on'); if (k === lis.length - 1) setTimeout(() => l.classList.add('done'), 900); }, 350 + k * 750)); };
  const go = (i, user) => {
    cur = i;
    nodes.forEach((n, k) => { n.classList.toggle('on', k === i); n.setAttribute('aria-selected', k === i); });
    panels.forEach((p, k) => p.classList.toggle('on', k === i));
    $$('.sys-wires .w-on', sys).forEach(w => w.classList.toggle('act', +w.dataset.i === i));
    typeTerm(panels[i]);
    if (window.gsap && !reduce) {
      gsap.fromTo(panels[i].querySelectorAll('h3, p, .ex li, .term, .mock'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .5, ease: 'power3.out', overwrite: true });
      if (prog) prog.kill(); nodes.forEach(n => gsap.set($('.nd-prog i', n), { scaleX: 0 }));
      if (auto && !user) prog = gsap.to($('.nd-prog i', nodes[i]), { scaleX: 1, duration: 6.5, ease: 'none' });
    }
    if (user) { auto = false; clearInterval(timer); }
  };
  nodes.forEach((n, i) => n.addEventListener('click', () => go(i, true)));
  sys.addEventListener('keydown', e => { if (!/Arrow(Up|Down)/.test(e.key)) return; e.preventDefault(); const i = (cur + (e.key === 'ArrowDown' ? 1 : nodes.length - 1)) % nodes.length; go(i, true); nodes[i].focus(); });
  go(0);
  if (reduce) return;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting;
    clearInterval(timer); if (vis && auto) { go(cur); timer = setInterval(() => { if (!document.hidden) go((cur + 1) % nodes.length); }, 6500); } }, { threshold: .35 }).observe(sys);
})();


/* Tableau à volets : les lettres tournent comme sur un panneau d'aéroport */
(function flapBoard() {
  const board = $('.flap-board'); if (!board) return;
  const words = ['ENTREPRISES', 'INSTITUTIONS', 'COMMERÇANTS', 'MICROFINANCES', 'PORTEURS DE PROJET'];
  const N = Math.max(...words.map(w => w.length)), A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÉ0123456789';
  const cells = Array.from({ length: N }, () => { const c = document.createElement('span'); c.className = 'fc sp'; board.appendChild(c); return c; });
  const cnt = $('.flap-c'); let k = 0, vis = false, busy = false;
  const show = w => {
    const pad = Math.floor((N - w.length) / 2), target = (' '.repeat(pad) + w).padEnd(N, ' ');
    busy = true;
    cells.forEach((c, i) => {
      const ch = target[i];
      if (reduce || !window.gsap) { c.textContent = ch; c.classList.toggle('sp', ch === ' '); return; }
      const flips = 3 + ((Math.random() * 4) | 0); let n = 0;
      const step = () => {
        const last = n >= flips;
        gsap.to(c, { rotateX: -90, duration: .06, ease: 'power1.in', delay: n === 0 ? i * .035 : 0, onComplete: () => {
          if (last) { c.textContent = ch; c.classList.toggle('sp', ch === ' '); c.classList.toggle('hi', ch !== ' ' && i - pad === 0); }
          else { c.textContent = A[(Math.random() * A.length) | 0]; c.classList.remove('sp'); }
          gsap.fromTo(c, { rotateX: 90 }, { rotateX: 0, duration: .07, ease: 'power1.out', onComplete: () => { if (!last) { n++; step(); } } });
        } });
      };
      if (c.textContent === ch && n === 0 && ch === ' ') return;
      step();
    });
    setTimeout(() => { busy = false; }, 1400);
    if (cnt) cnt.textContent = String(k + 1).padStart(2, '0') + ' / ' + String(words.length).padStart(2, '0');
  };
  show(words[0]);
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(board);
  setInterval(() => { if (!vis || document.hidden || busy) return; k = (k + 1) % words.length; show(words[k]); }, 3200);
})();

/* Vitrine : un fil de circuit relie les 5 axes, une impulsion les allume tour à tour */
(function axesCircuit() {
  const ul = $('.sc-axes'); if (!ul || reduce) return;
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'ax-wire'); svg.setAttribute('aria-hidden', 'true'); ul.prepend(svg);
  const lis = $$('li', ul); let path, L = 0, stops = [], t = 0, vis = false;
  const build = () => {
    svg.innerHTML = ''; const U = ul.getBoundingClientRect(), k = U.width / ul.offsetWidth || 1;
    const pts = lis.map(li => { const r = li.getBoundingClientRect(); return [(r.left + r.width / 2 - U.left) / k, (r.top + r.height / 2 - U.top) / k]; });
    let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1]; d += y === py ? ` H${x}` : ` V${(py + y) / 2} H${x} V${y}`; }
    path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); svg.appendChild(path);
    L = path.getTotalLength(); stops = [];
    stops = pts.map(([x, y]) => { let best = 0, bd = 1e9; for (let m = 0; m <= L; m += 2) { const q = path.getPointAtLength(m), dd = (q.x - x) ** 2 + (q.y - y) ** 2; if (dd < bd) { bd = dd; best = m; } } return best; });
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', 3.5); dot.setAttribute('class', 'ax-dot'); svg.appendChild(dot);
  };
  // repère simple : on calcule les arrêts par proximité
  const nearest = len => { let best = -1, bd = 1e9; lis.forEach((li, i) => { const dd = Math.abs((stops[i] || 0) - len); if (dd < bd) { bd = dd; best = i; } }); return bd < 6 ? best : -1; };
  setTimeout(build, 900); addEventListener('resize', () => setTimeout(build, 200));
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(ul);
  let last = performance.now(), lit = -1;
  gsap.ticker.add(() => { const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; if (!vis || !L) return;
    t = (t + dt * 160) % (L + 220); const dot = $('.ax-dot', svg); if (!dot) return;
    if (t > L) { dot.style.opacity = 0; return; } const p = path.getPointAtLength(t); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.style.opacity = 1;
    const i = nearest(t); if (i >= 0 && i !== lit) { lit = i; lis[i].classList.add('lit'); setTimeout(() => lis[i].classList.remove('lit'), 700); } });
})();

/* Souris : point orange + anneau qui suit, grossit sur les liens */
(function cursor() {
  const c = $('.cursor'); if (!c || !fine || reduce || !window.gsap) return;
  const dot = $('.cursor-dot', c), ring = $('.cursor-ring', c);
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });
  document.documentElement.classList.add('has-cursor');
  addEventListener('pointermove', e => { c.classList.add('on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('on'));
  document.addEventListener('pointerover', e => {
    const t = e.target;
    c.classList.toggle('hover', !!t.closest('a, button, summary, .tilt, .tile, .sc-axes li, .tm, .node'));
    c.classList.toggle('text', !!t.closest('input, textarea, select'));
  });
  addEventListener('pointerdown', () => c.classList.add('down')); addEventListener('pointerup', () => c.classList.remove('down'));
})();

/* Où suis-je ? : repère latéral (grand écran) et pastille (mobile) */
(function locator() {
  const loc = $('.locator'), here = $('.here'); if (!loc) return;
  const links = $$('a', loc), ids = links.map(a => a.dataset.s), secs = ids.map(id => document.getElementById(id));
  const names = links.map(a => a.textContent.trim()), hn = $('.here-n', here), ht = $('.here-t', here), hb = $('.here-bar i', here);
  const dark = new Set(['methode']);
  let cur = -1, ticking = false;
  const upd = () => { ticking = false;
    const mid = innerHeight * .45; let k = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= mid) k = i; });
    const first = secs[0].getBoundingClientRect().top, last = secs[secs.length - 1].getBoundingClientRect().bottom;
    const show = first < mid && last > innerHeight * .5;
    loc.classList.toggle('show', show); here.classList.toggle('show', show && k >= 0);
    if (k >= 0) {
      const r = secs[k].getBoundingClientRect(); hb.style.transform = `scaleX(${Math.min(1, Math.max(0, (mid - r.top) / r.height))})`;
      // fond sombre derrière le repère ?
      const under = document.elementFromPoint(30, innerHeight / 2); const sec = under && under.closest('section');
      loc.classList.toggle('on-dark', !!sec && (sec.classList.contains('methode') || sec.classList.contains('meet') || sec.classList.contains('scene-dark')));
    }
    if (k !== cur && k >= 0) { cur = k; links.forEach((a, i) => a.classList.toggle('on', i === k)); hn.textContent = String(k + 1).padStart(2, '0'); ht.textContent = names[k];
      if (window.gsap && !reduce) gsap.fromTo([hn, ht], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'power3.out' }); }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd); upd();
})();

/* =================== Services en grille : icônes, maquette, inclinaison =================== */
if (anim) {
  $$('.tile .ico').forEach(svg => {
    const parts = $$('path, rect, circle', svg);
    parts.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.to(parts, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: .1, scrollTrigger: { trigger: svg, start: 'top 85%' } });
  });
  gsap.to('.mock-chart span', { scaleY: 1, duration: 1.1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.mock', start: 'top 80%' } });
  if (fine) $$('.tilt').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      gsap.to(el, { rotateY: (px - .5) * 6, rotateX: (.5 - py) * 6, transformPerspective: 1000, duration: .5, ease: 'power2.out' }); });
    el.addEventListener('mouseleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }));
  });
  // Recaler tous les déclencheurs une fois la police et les images chargées :
  // sans ça, les animations se déclenchent un peu avant ou après l'endroit où l'on se trouve.
  const refresh = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  document.fonts && document.fonts.ready.then(refresh);
  addEventListener('load', refresh);
  let rr; addEventListener('resize', () => { clearTimeout(rr); rr = setTimeout(refresh, 250); });
} else {
  $$('.mock-chart span').forEach(s => s.style.transform = 'none');
}

/* recalcul final une fois toutes les scènes créées */
if (window.ScrollTrigger) { requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }); }
