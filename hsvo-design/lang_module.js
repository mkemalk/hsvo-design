const fs = require('fs');

const dict = JSON.parse(fs.readFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/translation_dictionary.json', 'utf8'));

const switcherHtml = `
<div class="hsvo-lang-switcher" data-framer-name="Language Switcher">
  <button type="button" class="hsvo-lang-btn active" data-lang="tr" aria-label="Türkçe">TR</button>
  <button type="button" class="hsvo-lang-btn" data-lang="en" aria-label="English">EN</button>
</div>
`;

const switcherStyles = `
<style id="hsvo-lang-switcher-style">
  .hsvo-lang-switcher {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 3px !important;
    margin-right: 14px !important;
    padding: 3px !important;
    background: #111111 !important;
    border: 1px solid rgba(255, 255, 255, 0.22) !important;
    border-radius: 999px !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35) !important;
    z-index: 1000 !important;
    user-select: none !important;
    box-sizing: border-box !important;
    height: 32px !important;
    position: relative !important;
  }
  .hsvo-lang-switcher:hover {
    border-color: rgba(255, 255, 255, 0.45) !important;
    background: #181818 !important;
  }
  .hsvo-lang-btn {
    background: transparent !important;
    border: none !important;
    color: #a5a5a5 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.05em !important;
    padding: 4px 10px !important;
    border-radius: 999px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    line-height: 1 !important;
    outline: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .hsvo-lang-btn:hover {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.12) !important;
  }
  .hsvo-lang-btn.active {
    background: rgb(237, 28, 36) !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    box-shadow: 0 1px 6px rgba(237, 28, 36, 0.6) !important;
  }
</style>
`;

const switcherScript = `
<script id="hsvo-lang-switcher-script">
(function() {
  var DICTIONARY = ${JSON.stringify(dict)};

  function norm(str) {
    if (!str) return '';
    return String(str)
      .replace(/[\\u00a0\\u1680\\u180e\\u2000-\\u200b\\u202f\\u205f\\u3000\\ufeff]/g, ' ')
      .replace(/[‘’‛\`]/g, "'")
      .replace(/[“”‟]/g, '"')
      .replace(/\\s+/g, ' ')
      .trim();
  }

  var NORM_TR_DICT = {};
  var NORM_EN_DICT = {};
  for (var k in DICTIONARY) {
    if (DICTIONARY.hasOwnProperty(k)) {
      var nTr = norm(k);
      var nEn = norm(DICTIONARY[k]);
      NORM_TR_DICT[nTr] = DICTIONARY[k];
      NORM_EN_DICT[nEn] = k;
    }
  }

  // Sort keys by length descending to match longest phrases first
  var TR_KEYS = Object.keys(NORM_TR_DICT).sort(function(a, b) { return b.length - a.length; });
  var EN_KEYS = Object.keys(NORM_EN_DICT).sort(function(a, b) { return b.length - a.length; });

  function translateText(text, targetLang) {
    if (!text || !text.trim()) return text;
    var trimmed = norm(text);

    if (targetLang === 'en') {
      if (NORM_TR_DICT[trimmed]) {
        return text.replace(text.trim(), NORM_TR_DICT[trimmed]);
      }
      for (var i = 0; i < TR_KEYS.length; i++) {
        var key = TR_KEYS[i];
        if (key.length >= 4 && text.indexOf(key) !== -1) {
          text = text.split(key).join(NORM_TR_DICT[key]);
        }
      }
      return text;
    } else {
      if (NORM_EN_DICT[trimmed]) {
        return text.replace(text.trim(), NORM_EN_DICT[trimmed]);
      }
      for (var j = 0; j < EN_KEYS.length; j++) {
        var eKey = EN_KEYS[j];
        if (eKey.length >= 4 && text.indexOf(eKey) !== -1) {
          text = text.split(eKey).join(NORM_EN_DICT[eKey]);
        }
      }
      return text;
    }
  }

  function applyLanguage(targetLang) {
    // 1. Handle multi-span compound headings and rich text containers
    var compoundElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, [data-framer-component-type="RichTextContainer"], .framer-text'
    );
    compoundElements.forEach(function(el) {
      if (el.closest('.hsvo-lang-switcher')) return;
      var txt = norm(el.textContent);
      if (!txt) return;

      if (typeof el._hsvoOrigHtml === 'undefined') {
        el._hsvoOrigHtml = el.innerHTML;
        el._hsvoOrigText = txt;
      }

      if (targetLang === 'en') {
        var enTrans = NORM_TR_DICT[el._hsvoOrigText];
        if (enTrans) {
          el.textContent = enTrans;
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      } else {
        if (typeof el._hsvoOrigHtml !== 'undefined' && el._hsvoOrigText) {
          if (NORM_TR_DICT[el._hsvoOrigText]) {
            el.innerHTML = el._hsvoOrigHtml;
          }
        }
      }
    });

    // 2. TreeWalker on all individual text nodes
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          var p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript') return NodeFilter.FILTER_REJECT;
          if (p.closest('.hsvo-lang-switcher')) return NodeFilter.FILTER_REJECT;
          if (node.nodeValue && node.nodeValue.trim().length > 0) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    var nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(function(node) {
      if (typeof node._hsvoOrigTr === 'undefined') {
        node._hsvoOrigTr = node.nodeValue;
      }
      if (targetLang === 'en') {
        node.nodeValue = translateText(node._hsvoOrigTr, 'en');
      } else {
        node.nodeValue = node._hsvoOrigTr;
      }
    });

    // 3. Inputs & Textareas (placeholders)
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function(inp) {
      if (typeof inp._hsvoOrigPlaceholder === 'undefined') {
        inp._hsvoOrigPlaceholder = inp.getAttribute('placeholder');
      }
      if (targetLang === 'en') {
        inp.setAttribute('placeholder', translateText(inp._hsvoOrigPlaceholder, 'en'));
      } else {
        inp.setAttribute('placeholder', inp._hsvoOrigPlaceholder);
      }
    });

    // 4. Document Title
    if (typeof document._hsvoOrigTitle === 'undefined') {
      document._hsvoOrigTitle = document.title;
    }
    if (targetLang === 'en') {
      document.title = translateText(document._hsvoOrigTitle, 'en');
    } else {
      document.title = document._hsvoOrigTitle;
    }

    // 5. Update active class on all switchers
    document.querySelectorAll('.hsvo-lang-switcher').forEach(function(sw) {
      var trBtn = sw.querySelector('.hsvo-lang-btn[data-lang="tr"]');
      var enBtn = sw.querySelector('.hsvo-lang-btn[data-lang="en"]');
      if (trBtn && enBtn) {
        if (targetLang === 'tr') {
          trBtn.classList.add('active');
          enBtn.classList.remove('active');
        } else {
          enBtn.classList.add('active');
          trBtn.classList.remove('active');
        }
      }
    });

    document.documentElement.lang = targetLang;
  }

  window.hsvoSetLanguage = function(lang) {
    try {
      localStorage.setItem('hsvo_lang', lang);
    } catch(e) {}
    applyLanguage(lang);
  };

  // Global event delegation for reliable clicking
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.hsvo-lang-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var lang = btn.getAttribute('data-lang');
    if (lang === 'tr' || lang === 'en') {
      window.hsvoSetLanguage(lang);
    }
  });

  function initSwitcher() {
    var savedLang = 'tr';
    try {
      savedLang = localStorage.getItem('hsvo_lang') || 'tr';
    } catch(e) {}

    if (savedLang === 'en') {
      applyLanguage('en');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitcher);
  } else {
    initSwitcher();
  }
})();
</script>
`;

module.exports = {
  switcherHtml,
  switcherStyles,
  switcherScript
};
