const throttle = (fn, wait = 16) => {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last > wait) {
      last = now;
      fn(...args);
    }
  };
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setTopOffset() {
  const nav = $('.nav');
  const h = nav ? nav.getBoundingClientRect().height : 64;
  document.documentElement.style.setProperty('--spa-top', `${h}px`);
}

function setActiveLink(id) {
  $$('.menu a, .offcanvas a').forEach((a) => {
    a.toggleAttribute('aria-current', a.getAttribute('href') === `#${id}`);
    if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'page');
  });
}

function showScreen(id, updateHash = false) {
  const target = document.getElementById(id);
  if (!target) return;
  document.body.classList.add('spa-on');
  $$('main .screen').forEach((screen) => {
    screen.setAttribute('data-spa-panel', '');
    screen.classList.toggle('is-active', screen.id === id);
  });
  setActiveLink(id);
  if (updateHash && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  const wipe = $('#wipe');
  if (wipe) {
    wipe.classList.add('show');
    setTimeout(() => wipe.classList.remove('show'), 450);
  }
}

function bootSpa() {
  setTopOffset();
  const id = (location.hash || '#inicio').slice(1);
  showScreen(document.getElementById(id) ? id : 'inicio', false);
}

function initNavigation() {
  setTopOffset();
  window.addEventListener('resize', setTopOffset);
  const burger = $('#burger');
  const offcanvas = $('#offcanvas');

  if (burger && offcanvas) {
    burger.addEventListener('click', () => {
      const open = !offcanvas.classList.contains('show');
      offcanvas.classList.toggle('show', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      burger.textContent = open ? '✕' : '☰';
    });
  }

  $$('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.length <= 1) return;
    link.addEventListener('click', (e) => {
      const id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      showScreen(id, true);
      if (offcanvas) offcanvas.classList.remove('show');
      if (burger) { burger.textContent = '☰'; burger.setAttribute('aria-expanded', 'false'); }
      document.body.classList.remove('menu-open');
    });
  });

  window.addEventListener('popstate', bootSpa);
  window.addEventListener('hashchange', bootSpa);
  bootSpa();
}

function initCursor() {
  const dot = $('#cursorDot');
  if (!dot) return;
  window.addEventListener('mousemove', throttle((e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    dot.style.opacity = '0.9';
  }));
}

function initParallax() {
  const parallaxEls = $$('[data-parallax]');
  if (!parallaxEls.length || matchMedia('(max-width: 900px)').matches) return;
  window.addEventListener('mousemove', throttle((e) => {
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `perspective(900px) rotateY(${dx * 4}deg) rotateX(${dy * -4}deg)`;
    });
  }));

  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', throttle((e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) translateY(-3px)`;
    }));
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

function initNewsletter() {
  const modal = $('#modalNewsletter');
  const open = $('#openNewsletter');
  const close = $('#closeModal');
  const modalForm = $('#modalForm');
  const contactForm = $('#contactForm');
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    $('#modalEmail')?.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    open?.focus();
  }

  if (open) open.addEventListener('click', openModal);
  if (close) close.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name', contactForm).value.trim();
      const email = $('#email', contactForm).value.trim();
      const message = $('#msg', contactForm).value.trim();
      if (name.length < 2) return alert('Escribe tu nombre (mínimo 2 caracteres).');
      if (!validateEmail(email)) return alert('Introduce un correo válido.');
      if (message.length < 10) return alert('El mensaje debe tener al menos 10 caracteres.');
      alert('¡Mensaje enviado!');
      contactForm.reset();
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#modalEmail', modalForm).value.trim();
      if (!validateEmail(email)) return alert('Introduce un correo válido');
      alert('¡Suscripción confirmada!');
      modalForm.reset();
      closeModal();
    });
  }
}

function initLineup() {
  const scroller = $('#lineup');
  const track = scroller ? $('.track', scroller) : null;
  if (!scroller || !track) return;

  const prog = [
    { day: 'Vie 11 JUN', slots: [
      { time: '22:00', stage: 'A', dj: 'Basswell' },
      { time: '23:30', stage: 'A', dj: 'Sara Landry' },
      { time: '01:00', stage: 'A', dj: 'Trym' },
      { time: '02:30', stage: 'A', dj: 'Kobosil' },
      { time: '22:00', stage: 'B', dj: 'AZYR' },
      { time: '23:30', stage: 'B', dj: 'VII Circle' },
      { time: '01:00', stage: 'B', dj: 'CLTX' },
      { time: '02:30', stage: 'B', dj: 'Cera Khin' }
    ]},
    { day: 'Sáb 12 JUN', slots: [
      { time: '22:00', stage: 'A', dj: 'Farrago' },
      { time: '23:30', stage: 'A', dj: 'Shlømo' },
      { time: '01:00', stage: 'A', dj: 'Quelza' },
      { time: '02:30', stage: 'A', dj: 'I Hate Models' },
      { time: '22:00', stage: 'B', dj: 'Parsa Jafari' },
      { time: '23:30', stage: 'B', dj: 'CLOUDY' },
      { time: '01:00', stage: 'B', dj: 'Adrián Mills' },
      { time: '02:30', stage: 'B', dj: 'VENDEX' }
    ]},
    { day: 'Dom 13 JUN', slots: [
      { time: '22:00', stage: 'A', dj: 'Dyen' },
      { time: '23:30', stage: 'A', dj: 'Klangkuenstler' },
      { time: '01:00', stage: 'A', dj: 'Sara Landry' },
      { time: '02:30', stage: 'A', dj: 'Nico Moreno' },
      { time: '22:00', stage: 'B', dj: 'AZYR' },
      { time: '23:30', stage: 'B', dj: 'CLOUDY' },
      { time: '01:00', stage: 'B', dj: 'FANTASM' },
      { time: '02:30', stage: 'B', dj: 'VII Circle' }
    ]}
  ];

  const dayOrder = Object.fromEntries(prog.map((d, i) => [d.day, i]));
  const mins = (t) => {
    let [h, m] = t.split(':').map(Number);
    if (h < 6) h += 24;
    return h * 60 + m;
  };
  const normalize = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const artistPhotos = {
    'Basswell': 'https://cdn.bugece.co/8d6925ae-5e0b-4c43-9e97-92417a566285',
    'AZYR': 'https://mixmag.es/assets/uploads/images/_columns2/92-min_250811_100359.png',
    'Sara Landry': 'https://photos.bandsintown.com/large/24684761.jpeg',
    'VII Circle': 'https://imgproxy.ra.co/_/quality:66/aHR0cHM6Ly9zdGF0aWMucmEuY28vaW1hZ2VzL3Byb2ZpbGVzL2xnLzdjaXJjbGUuanBnP2RhdGVVcGRhdGVkPTE3ODczNDU2MDc0ODM=',
    'Trym': 'https://images.squarespace-cdn.com/content/v1/52caf22ee4b05977ab043ee9/67942d5c-54e7-4183-a73b-407525039c56/-PRESS%2BPIC%2B%2APlease%2BUse%2A.jpg',
    'Kobosil': 'https://is1-ssl.mzstatic.com/image/thumb/Features124/v4/56/69/d0/5669d0df-0bfc-2ab4-ce28-e1b5b74122c1/pr_source.png/1080x1080bb.jpg',
    'CLTX': 'https://images.ra.co/f9dff7baf4a8e6cb7f15fdaf7b6ee319c5f43a0a.jpg',
    'Cera Khin': 'https://www.warehouse-nantes.fr/media/cache/square_1000/images/artist_image/65b28b0102a4f172275350.webp',
    'Farrago': 'https://cms.piknicelectronik.com/uploads/Artistes/_AUTOxAUTO_crop_center-center_80_none/farrago790x385.jpg',
    'Shlømo': 'https://ra.co/images/profiles/square/shlomo.jpg?dateUpdated=1503896745000',
    'Quelza': 'https://telpa.lv/_next/image?q=75&url=%2Fassets%2Fartists%2Fquelza.jpg&w=3840',
    'I Hate Models': 'https://www.subtronic.fr/web/wp-content/uploads/2024/01/I-Hate-Models.jpg',
    'Parsa Jafari': 'https://static.ra.co/images/profiles/square/parsajafari.jpg?dateUpdated=1635244093557',
    'CLOUDY': 'https://www.warehouse-nantes.fr/media/cache/square_1000/images/artist_image/67af0ddac40d5897650038.webp',
    'Adrián Mills': 'https://i1.sndcdn.com/avatars-YY1Oywfuk2SW2lyu-8mtvrw-t1080x1080.jpg',
    'VENDEX': 'https://i1.sndcdn.com/avatars-NhBd3ZH7MRhIlUsU-YL45PQ-t1080x1080.jpg',
    'Dyen': 'https://api.wegoout.com.br/images/artists/869/large_dyen.png',
    'Klangkuenstler': 'https://static.moshtix.com.au/uploads/b5b313bf-9f54-47dc-8ffd-e9c71ad72f5ax600x600',
    'FANTASM': 'https://www.regoon.com/manager/uploads/artista/ec0b0594c9c2dcfd79bac5ebe6729193.jpg',
    'Nico Moreno': 'https://www.time-warp.de/imgdb/1280/nicomoreno-website-800x550.png'
  };
  const allSlots = prog.flatMap((d) => d.slots.map((s) => ({ ...s, day: d.day }))).sort((a, b) => dayOrder[a.day] - dayOrder[b.day] || mins(a.time) - mins(b.time));

  function card(s) {
    const photo = artistPhotos[s.dj];
    return `<article class="slot">
      <h3>${s.dj}</h3>
      <span class="time">${s.day} · ${s.time}</span>
      <span class="stage-badge ${s.stage === 'A' ? 'stage-a' : 'stage-b'}">Esc. ${s.stage}</span>
      <img class="slot-img" src="${photo}" alt="${s.dj}, artista de NIGHTHRIVE 2027" loading="lazy" decoding="async">
    </article>`;
  }

  track.innerHTML = allSlots.map(card).join('') + allSlots.map(card).join('');

  function setDuration() {
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    track.style.setProperty('--end', `-${half}px`);
    track.style.animationDuration = `${Math.max(half / 90, 24)}s`;
  }
  requestAnimationFrame(setDuration);
  window.addEventListener('resize', setDuration);
}

function initCart() {
  const state = { items: new Map() };
  const euros = (n) => Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);
  const toast = (msg) => {
    let t = $('#nh-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'nh-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(8px)';
    }, 1050);
  };

  function render() {
    const list = $('#cartList');
    const total = $('#cartTotal');
    const pay = $('#cartPay');
    if (!list || !total || !pay) return;
    list.innerHTML = '';
    let sum = 0;
    state.items.forEach(({ name, price, qty }, id) => {
      sum += price * qty;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `<span class="name">${name}</span><span class="meta">${euros(price)}</span><div class="cart-qty" data-id="${id}"><button class="dec" aria-label="Quitar">−</button><span class="q">${qty}</span><button class="inc" aria-label="Añadir">+</button></div><button class="rm" data-rm="${id}" aria-label="Eliminar">✕</button>`;
      list.appendChild(li);
    });
    total.textContent = `Total: ${euros(sum)}`;
    pay.disabled = sum <= 0;
  }

  function add(btn) {
    const id = btn.dataset.ticket;
    if (!id) return;
    const name = btn.dataset.name || 'Entrada';
    const price = Number(btn.dataset.price) || 0;
    const row = state.items.get(id) || { name, price, qty: 0 };
    row.qty += 1;
    state.items.set(id, row);
    render();
    toast(`Añadido: ${name}`);
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart[data-ticket]');
    if (addBtn) {
      e.preventDefault();
      add(addBtn);
      return;
    }
    const panel = e.target.closest('#cartPanel');
    if (panel) {
      const qty = e.target.closest('.cart-qty');
      const id = qty ? qty.dataset.id : null;
      if (e.target.closest('.inc') && id) {
        const row = state.items.get(id);
        if (row) row.qty += 1;
      } else if (e.target.closest('.dec') && id) {
        const row = state.items.get(id);
        if (row) {
          row.qty -= 1;
          if (row.qty <= 0) state.items.delete(id);
        }
      } else {
        const rm = e.target.closest('[data-rm]');
        if (rm) state.items.delete(rm.dataset.rm);
      }
      render();
    }
  });

  const clear = $('#cartClear');
  const pay = $('#cartPay');
  if (clear) clear.addEventListener('click', (e) => { e.preventDefault(); state.items.clear(); render(); });
  if (pay) pay.addEventListener('click', (e) => { e.preventDefault(); if (!pay.disabled) alert('Demo: continuar a pago'); });
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCursor();
  initParallax();
  initNewsletter();
  initLineup();
  initCart();
});
