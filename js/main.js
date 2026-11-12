/* Усадьба Korschenruh — скрипты. © 2026 Полунин Лев. Все права защищены (см. README.md) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }

  /* ---------- header + dock ---------- */
  var header = $('.header'), dock = $('.dock'), heroH = 0;
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    header.classList.toggle('is-solid', y > 40 && !header.classList.contains('menu-open'));
    if (dock) dock.classList.toggle('is-on', y > (heroH || 500) * 0.7);
  }
  heroH = ($('.hero') || {}).offsetHeight || 600;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { heroH = ($('.hero') || {}).offsetHeight || 600; }, { passive: true });
  onScroll();

  /* ---------- burger ---------- */
  var burger = $('.burger'), nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    d.body.classList.toggle('lock', open);
    header.classList.toggle('menu-open', open); onScroll();
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { if (nav.classList.contains('is-open')) setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width: 1081px)').addListener && window.matchMedia('(min-width: 1081px)').addListener(function (m) { if (m.matches) setMenu(false); });

  /* ---------- garlands ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  $$('.garland').forEach(function (g) {
    var n = +g.getAttribute('data-bulbs') || 12, dAttr = g.getAttribute('data-path');
    var svg = d.createElementNS(SVGNS, 'svg'); svg.setAttribute('viewBox', '0 0 1200 120'); svg.setAttribute('preserveAspectRatio', 'none');
    var p = d.createElementNS(SVGNS, 'path'); p.setAttribute('d', dAttr); svg.appendChild(p); g.appendChild(svg);
    var len = p.getTotalLength();
    for (var i = 0; i < n; i++) {
      var pt = p.getPointAtLength(len * (i + 0.5) / n), b = d.createElement('span');
      b.className = 'bulb'; b.style.left = (pt.x / 12) + '%'; b.style.top = (pt.y / 1.2) + '%';
      b.style.transitionDelay = (i * 0.08) + 's'; b.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      g.appendChild(b);
    }
  });

  /* ---------- reveal on scroll ---------- */
  var rvSel = '.h2, .lead, .state, .house, .season__txt, .fest__grid figure, .versus__col, .menu, .ledger, .calc, .review, .acc, .rules, .book, .contacts__info';
  if (hasIO && !reduce) {
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$(rvSel).forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = ((i % 4) * 0.07) + 's'; rvIO.observe(el); });
    var gIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-on'); gIO.unobserve(e.target); } });
    }, { threshold: 0.2 });
    $$('.garland').forEach(function (g) { gIO.observe(g); });
  } else {
    $$('.garland').forEach(function (g) { g.classList.add('is-on'); });
  }

  /* ---------- word-by-word text ---------- */
  var rt = $('[data-reveal]');
  if (rt && !reduce) {
    var words = rt.textContent.trim().split(/\s+/);
    rt.setAttribute('aria-label', rt.textContent.trim());
    rt.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    var ws = $$('.w', rt), ticking = false;
    var paint = function () {
      ticking = false;
      var r = rt.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var k = Math.round(p * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < k);
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }

  /* ---------- house galleries ---------- */
  $$('[data-gallery]').forEach(function (g) {
    var main = $('.house__main', g), img = $('img', main), src = $('source', main);
    $$('.house__thumbs button', g).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;
        $$('.house__thumbs button', g).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var name = btn.getAttribute('data-src'), alt = btn.getAttribute('aria-label');
        var pre = new Image();
        main.classList.add('is-swap');
        pre.onload = pre.onerror = function () {
          setTimeout(function () {
            if (src) src.srcset = 'img/' + name + '-sm.webp 800w, img/' + name + '.webp 1600w';
            img.src = 'img/' + name + '.jpg'; img.alt = alt;
            main.classList.remove('is-swap');
          }, reduce ? 0 : 250);
        };
        pre.src = 'img/' + name + (window.innerWidth < 900 ? '-sm' : '') + '.webp';
      });
    });
  });

  /* ---------- ritual sticky images ---------- */
  var steps = $$('.step'), stack = $$('.ritual__stack img');
  if (hasIO && steps.length) {
    var sIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = +e.target.getAttribute('data-step');
        steps.forEach(function (s) { s.classList.toggle('is-on', s === e.target); });
        stack.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { sIO.observe(s); });
  } else { steps.forEach(function (s) { s.classList.add('is-on'); }); }

  /* ---------- tabs (seasons + menu) ---------- */
  function tabs(list) {
    var btns = $$('[role="tab"]', list);
    function select(b, focus) {
      btns.forEach(function (x) {
        var on = x === b, panel = d.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        panel.hidden = !on; panel.classList.toggle('is-on', on);
      });
      if (focus) b.focus();
      if (b.scrollIntoView && list.scrollWidth > list.clientWidth) {
        list.scrollTo ? list.scrollTo({ left: b.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' }) : (list.scrollLeft = b.offsetLeft - 20);
      }
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? btns.length - 1 : null;
        if (j === null) return; e.preventDefault(); select(btns[(j + btns.length) % btns.length], true);
      });
    });
  }
  $$('[role="tablist"]').forEach(tabs);

  /* ---------- calculator ---------- */
  var calc = $('#calc');
  if (calc) {
    var guests = $('#guests'), gOut = $('#guestsOut'), nOut = $('#nights'), total = $('#total'), nights = 1;
    var LIMITS = { big: 24, small: 8, all: 32 };
    var banyaS = calc.querySelector('[name="banyaS"]'), banya = calc.querySelector('[name="banya"]'),
      chan = calc.querySelector('[name="chan"]'), fill = calc.querySelector('[name="fill"]');
    function house() { return calc.querySelector('[name="house"]:checked').value; }
    function lock(input, off) { input.disabled = off; if (off) input.checked = false; input.parentNode.classList.toggle('is-off', off); }
    function calcTotal() {
      var h = house(), max = LIMITS[h];
      guests.max = max; if (+guests.value > max) guests.value = max;
      var g = +guests.value;
      lock(banyaS, h === 'big'); lock(banya, h === 'small'); lock(chan, h === 'small'); lock(fill, h === 'small' || !chan.checked);
      var base = h === 'big' ? 20000 + Math.max(0, g - 8) * 500
        : h === 'small' ? 15000
        : 35000 + Math.max(0, g - 16) * 500;
      var extras = 0;
      $$('.calc__extras input[type="checkbox"]', calc).forEach(function (c) { if (c.checked) extras += +c.value; });
      extras += +calc.querySelector('[name="pool"]').value;
      var sum = (base + extras) * nights;
      gOut.textContent = g; nOut.textContent = nights;
      guests.style.setProperty('--p', ((g - 1) / (max - 1) * 100) + '%');
      total.textContent = fmt(sum);
      calc.dataset.summary = ({ big: 'Большой дом', small: 'Лесной дом', all: 'Вся усадьба' })[h] + ', гостей: ' + g + ', суток: ' + nights +
        $$('.calc__extras input:checked', calc).map(function (c) { return ', ' + c.nextElementSibling.textContent.toLowerCase(); }).join('') +
        (+calc.querySelector('[name="pool"]').value ? ', бассейн ' + calc.querySelector('[name="pool"]').selectedOptions[0].text.split(' —')[0] : '') +
        '. Предварительно: ' + total.textContent.replace(/ /g, ' ');
    }
    calc.addEventListener('input', calcTotal);
    calc.addEventListener('change', calcTotal);
    $$('.stepper button', calc).forEach(function (b) {
      b.addEventListener('click', function () { nights = Math.min(14, Math.max(1, nights + +b.getAttribute('data-n'))); calcTotal(); });
    });
    $$('[data-pick]').forEach(function (a) {
      a.addEventListener('click', function () { calc.querySelector('[value="' + a.getAttribute('data-pick') + '"]').checked = true; calcTotal(); });
    });
    $('[data-to-form]').addEventListener('click', function () {
      var c = $('#book [name="comment"]'), gi = $('#book [name="guests"]');
      c.value = 'Расчёт с сайта: ' + calc.dataset.summary; gi.value = guests.value;
      $('#kontakty').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { $('#book [name="name"]').focus({ preventScroll: true }); }, 700);
    });
    calcTotal();
  }

  /* ---------- reviews slider ---------- */
  var slider = $('[data-slider]');
  if (slider) {
    var slides = $$('.review', slider), dotsBox = $('.slider__dots'), prev = $('.slider__btn[data-dir="-1"]'), next = $('.slider__btn[data-dir="1"]');
    slides.forEach(function () { dotsBox.appendChild(d.createElement('span')); });
    var dots = $$('span', dotsBox);
    function step() { return slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : slider.clientWidth; }
    function update() {
      var i = Math.round(slider.scrollLeft / step()), maxS = slider.scrollWidth - slider.clientWidth - 4;
      dots.forEach(function (dt, j) { dt.classList.toggle('is-on', j === Math.min(i, dots.length - 1)); });
      prev.disabled = slider.scrollLeft < 4; next.disabled = slider.scrollLeft >= maxS;
    }
    function go(dir) { slider.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    slider.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    var t; slider.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- booking form -> Telegram ---------- */
  var toastEl = $('.toast'), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4200); }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      d.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } d.body.removeChild(ta);
    });
  }
  var book = $('#book');
  if (book) {
    var phone = book.querySelector('[name="phone"]');
    phone.addEventListener('input', function () {
      var v = phone.value.replace(/\D/g, ''); if (!v) { phone.value = ''; return; }
      if (v[0] === '8') v = '7' + v.slice(1); if (v[0] !== '7') v = '7' + v; v = v.slice(0, 11);
      var o = '+7'; if (v.length > 1) o += ' ' + v.slice(1, 4); if (v.length > 4) o += ' ' + v.slice(4, 7);
      if (v.length > 7) o += '-' + v.slice(7, 9); if (v.length > 9) o += '-' + v.slice(9, 11); phone.value = o;
    });
    book.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = book.elements, ok = true;
      [f.name, f.phone].forEach(function (el) {
        var bad = !el.value.trim() || (el === f.phone && el.value.replace(/\D/g, '').length < 11);
        el.classList.toggle('is-err', bad); if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { $('.book__msg').textContent = 'Укажите имя и телефон — мы перезвоним.'; return; }
      var msg = 'Здравствуйте! Заявка на бронь усадьбы Korschenruh.\nИмя: ' + f.name.value.trim() + '\nТелефон: ' + f.phone.value +
        (f.dates.value ? '\nДаты: ' + f.dates.value : '') + (f.guests.value ? '\nГостей: ' + f.guests.value : '') +
        '\nПовод: ' + f.occasion.value + (f.comment.value.trim() ? '\nКомментарий: ' + f.comment.value.trim() : '');
      var copying = copy(msg);
      var win = window.open('https://t.me/+79316124445', '_blank');
      if (win) { try { win.opener = null; } catch (er) {} }
      copying.then(function () {
        $('.book__msg').textContent = 'Текст заявки скопирован — вставьте его в открывшийся чат.';
        toast('Заявка скопирована. Вставьте её в чат Telegram');
      }, function () {
        $('.book__msg').textContent = 'Позвоните нам: +7 905 243-40-10 — или отправьте заявку в Telegram.';
      });
      if (!win) location.href = 'https://t.me/+79316124445';
    });
  }

  /* ---------- map (lazy) ---------- */
  var map = $('[data-map]');
  if (map) {
    var loaded = false;
    var load = function () {
      if (loaded) return; loaded = true;
      var f = d.createElement('iframe');
      f.src = 'https://yandex.ru/map-widget/v1/?text=' + encodeURIComponent('Калининградская область, посёлок Ладыгино') + '&z=12';
      f.title = 'Усадьба Korschenruh на карте: посёлок Ладыгино, Калининградская область';
      f.loading = 'lazy'; f.setAttribute('allowfullscreen', '');
      map.appendChild(f); var b = $('.map__load', map); if (b) b.remove();
    };
    $('.map__load', map).addEventListener('click', load);
    if (hasIO) {
      var mIO = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); mIO.disconnect(); } }, { rootMargin: '300px' });
      mIO.observe(map);
    }
  }
})();
