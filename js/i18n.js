/* ============================================================
   i18n — نظام تبديل اللغات (عربي / إنجليزي / فرنسي / ألماني)
   ============================================================ */

const I18N = (() => {
  let currentLang = 'ar';
  const cache = {};

  const LANGS = {
    ar: { label: 'العربية', dir: 'rtl', file: 'lang/ar.json' },
    en: { label: 'English', dir: 'ltr', file: 'lang/en.json' },
    fr: { label: 'Français', dir: 'ltr', file: 'lang/fr.json' },
    de: { label: 'Deutsch', dir: 'ltr', file: 'lang/de.json' }
  };

  async function load(lang) {
    if (cache[lang]) return cache[lang];
    const res = await fetch(LANGS[lang].file);
    if (!res.ok) throw new Error('Lang load failed: ' + lang);
    const data = await res.json();
    cache[lang] = data;
    return data;
  }

  function apply(data) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (data[key] !== undefined) {
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = data[key];
        } else {
          el.textContent = data[key];
        }
      }
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (data[key] !== undefined) el.placeholder = data[key];
    });
  }

  async function set(lang) {
    if (!LANGS[lang]) lang = 'ar';
    currentLang = lang;
    const data = await load(lang);
    const meta = LANGS[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;

    apply(data);

    // Update label + active state
    const label = document.getElementById('langLabel');
    if (label) label.textContent = meta.label;

    document.querySelectorAll('#langMenu li').forEach(li => {
      li.classList.toggle('is-active', li.dataset.lang === lang);
    });

    // Notify other modules (e.g., main.js re-render dynamic content)
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang, data } }));

    try { localStorage.setItem('lahza_lang', lang); } catch (e) {}
  }

  function get() { return currentLang; }
  function getData() { return cache[currentLang] || {}; }
  function t(key) { return getData()[key] || key; }

  function init() {
    let saved = 'ar';
    try { saved = localStorage.getItem('lahza_lang') || 'ar'; } catch (e) {}
    set(saved);

    // Language button toggle
    const langWrap = document.querySelector('.lang');
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');

    if (btn && langWrap) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        langWrap.classList.toggle('is-open');
      });
      document.addEventListener('click', () => langWrap.classList.remove('is-open'));
    }

    if (menu) {
      menu.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          set(li.dataset.lang);
          langWrap.classList.remove('is-open');
        });
      });
    }
  }

  return { init, set, get, getData, t, LANGS };
})();

window.I18N = I18N;