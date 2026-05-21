const FORM_ENDPOINT = '';

document.getElementById('menuBtn').addEventListener('click', function () {
  var open = document.getElementById('nav').classList.toggle('open');
  this.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav a').forEach(function (link) {
  link.addEventListener('click', function () {
    document.getElementById('nav').classList.remove('open');
    document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
  });
});

var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

(function initHeroPhoto() {
  var heroImg = document.getElementById('hero-photo') || document.querySelector('.hero__photo img');
  var heroFallback = document.querySelector('.hero__photo-fallback');
  if (!heroImg) return;

  var baseEl = document.querySelector('base');
  var base = (baseEl && baseEl.href)
    || (location.pathname.replace(/\/[^/]*$/, '/') || '/');
  if (!base.endsWith('/')) base += '/';

  var sources = [
    base + 'photo.png',
    'photo.png',
    base + 'photo.jpg',
    'photo.jpg',
    'https://gorunova-masha.github.io/Lending_for_psyhology_Maria_Ridzel/photo.png',
    'https://raw.githubusercontent.com/gorunova-masha/Lending_for_psyhology_Maria_Ridzel/main/photo.png'
  ];

  var index = 0;

  function showFallback() {
    heroImg.style.display = 'none';
    if (heroFallback) {
      heroFallback.hidden = false;
      heroFallback.removeAttribute('hidden');
    }
  }

  function applySrc() {
    if (index >= sources.length) {
      showFallback();
      return;
    }
    heroImg.style.display = 'block';
    if (heroFallback) {
      heroFallback.hidden = true;
      heroFallback.setAttribute('hidden', '');
    }
    heroImg.src = sources[index];
  }

  heroImg.addEventListener('error', function () {
    index += 1;
    applySrc();
  });

  heroImg.addEventListener('load', function () {
    if (heroImg.naturalWidth > 0 && heroFallback) heroFallback.hidden = true;
  });

  index = 0;
  applySrc();
})();

var phone = document.getElementById('phone');
phone.addEventListener('input', function (e) {
  var d = e.target.value.replace(/\D/g, '');
  if (d.charAt(0) === '8') d = '7' + d.slice(1);
  if (d.charAt(0) !== '7') d = '7' + d;
  d = d.slice(0, 11);
  var m = d.match(/^(\d)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
  e.target.value = !m[2] ? '+7' : '+7 (' + m[2] + (m[3] ? ') ' + m[3] : '') + (m[4] ? '-' + m[4] : '') + (m[5] ? '-' + m[5] : '');
});

var modal = document.getElementById('modal');

function closeModal() {
  modal.classList.remove('on');
  modal.setAttribute('aria-hidden', 'true');
}

function openModal() {
  modal.classList.add('on');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('modalX').focus();
}

document.getElementById('modalX').addEventListener('click', closeModal);
modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (document.getElementById('hp').value) return;

  var nameEl = document.getElementById('name');
  var formatEl = document.getElementById('format');
  ['err-name', 'err-phone', 'err-format'].forEach(function (id) {
    document.getElementById(id).textContent = '';
  });
  nameEl.classList.remove('err');
  phone.classList.remove('err');
  var ok = true;

  if (!nameEl.value.trim()) {
    document.getElementById('err-name').textContent = 'Укажите имя';
    nameEl.classList.add('err');
    ok = false;
  }
  if (phone.value.replace(/\D/g, '').length < 11) {
    document.getElementById('err-phone').textContent = 'Введите номер';
    phone.classList.add('err');
    ok = false;
  }
  if (!formatEl.value) {
    document.getElementById('err-format').textContent = 'Выберите формат';
    ok = false;
  }
  if (!ok) return;

  var btn = document.getElementById('submitBtn');
  btn.classList.add('btn--loading');
  btn.disabled = true;
  var payload = { name: nameEl.value.trim(), phone: phone.value, format: formatEl.value };

  try {
    if (FORM_ENDPOINT) {
      var res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('fail');
    } else {
      await new Promise(function (r) { setTimeout(r, 800); });
    }
    e.target.reset();
    phone.value = '';
    openModal();
  } catch (err) {
    document.getElementById('err-phone').textContent = 'Ошибка отправки. Позвоните или напишите в мессенджер.';
  } finally {
    btn.classList.remove('btn--loading');
    btn.disabled = false;
  }
});
