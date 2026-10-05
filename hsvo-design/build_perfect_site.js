const fs = require('fs');
const langModule = require('./lang_module.js');
const croppedLogos = require('./cropped_logos.js');

console.log('Reading pristine original.html...');
let html = fs.readFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/original.html', 'utf8');

// Helper for balancing div tags
function getMatchingDivEnd(str, startIdx) {
  let depth = 0;
  let tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = startIdx;
  let m;
  while ((m = tagRegex.exec(str)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth++;
    }
  }
  return -1;
}

// 1. Locate the desktop team chunk (children [10] to [13])
let bodyIdx = html.indexOf('<body');
let mainIdx = html.indexOf('<main class="framer-jpdxmw"', bodyIdx);
let chunkStart = html.indexOf('<div class="framer-1nf011s', mainIdx);
let gufmgkIdx = html.indexOf('framer-gufmgk', chunkStart);
let gufmgkTagStart = html.lastIndexOf('<div', gufmgkIdx);
let chunkEnd = getMatchingDivEnd(html, gufmgkTagStart);

let oldTeamChunk = html.slice(chunkStart, chunkEnd);

// 2. Exactly ordered team members:
// Row 1 (5 people): Cihan Demirel, Çağrı Demirbaş, Tuğçe Oğuztürk (Image 1) + Mert Gürsoy, Çağlar Saatli (Image 2)
// Row 2 (5 people): Mustafa Kemal Karakaya, Samet Karaca, Büşra Akçay, Yağmur Ovacık, Ümit Sevilmiş
const teamMembersOrdered = [
  'Cihan Demirel',
  'Çağrı Demirbaş',
  'Tuğçe Oğuztürk',
  'Mert Gürsoy',
  'Çağlar Saatli',
  'Mustafa Kemal Karakaya',
  'Samet Karaca',
  'Büşra Akçay',
  'Yağmur Ovacık',
  'Ümit Sevilmiş'
];

let cardsHtmlArray = [];

for (const person of teamMembersOrdered) {
  let pIdx = oldTeamChunk.indexOf(person);
  if (pIdx === -1) {
    throw new Error(`Could not find ${person} in oldTeamChunk`);
  }
  let cardInner = oldTeamChunk.lastIndexOf('framer-v-1cqr495', pIdx);
  let cardStart = oldTeamChunk.lastIndexOf('<div class="ssr-variant">', cardInner);
  if (cardStart === -1 || (cardInner - cardStart > 200)) {
    cardStart = oldTeamChunk.lastIndexOf('<div class="framer-', cardInner);
  }
  let cardEnd = getMatchingDivEnd(oldTeamChunk, cardStart);
  let cardHtml = oldTeamChunk.slice(cardStart, cardEnd);

  // Clean card HTML:
  // - Remove hidden- breakpoint classes so it's visible on all devices
  let cleaned = cardHtml
    .replace(/\bhidden-[a-z0-9]+\b/g, '')
    .replaceAll('Mustafa Kemal Karakaya', 'M. Kemal Karakaya');

  cardsHtmlArray.push(`
    <!-- Team Member Card: ${person === 'Mustafa Kemal Karakaya' ? 'M. Kemal Karakaya' : person} -->
    <div class="hsvo-card-item">
      ${cleaned}
    </div>
  `);
}

console.log(`Extracted and prepped ${cardsHtmlArray.length} cards.`);

// 3. Construct the clean 5 and 5 team grid
const newTeamSection = `
<div class="hsvo-team-section-wrapper" id="ekibimiz">
  <div class="hsvo-team-grid">
    ${cardsHtmlArray.join('\n')}
  </div>
</div>
`;

// Replace the old team chunk with the new unified 5 and 5 grid
html = html.slice(0, chunkStart) + newTeamSection + html.slice(chunkEnd);

// 4. Remove the PreLoader splash screen element from HTML
let preloaderStart = html.indexOf('<div class="framer-143iyx0-container');
if (preloaderStart !== -1) {
  let preloaderEnd = getMatchingDivEnd(html, preloaderStart);
  if (preloaderEnd !== -1) {
    console.log(`Removing PreLoader container from ${preloaderStart} to ${preloaderEnd}`);
    html = html.slice(0, preloaderStart) + '<!-- PreLoader Removed -->' + html.slice(preloaderEnd);
  }
}

// 5. Basic typo and bug fixes
html = html.replace(/555-666-7777/g, '+90 (505) 735 31 16');
html = html.replace(/hello@fabrica\.com/g, 'iletisim@hsvo.com.tr');
html = html.replace(/hsvo-design-and-sofware/g, 'hsvo-design-and-software');

// 6. PREVENT REACT HYDRATION FROM WIPING OUT THE DOM:
html = html.replace(
  /<script type="module" async data-framer-bundle="main"[^>]*src="[^"]*script_main[^"]*"[^>]*><\/script>/gi,
  '<!-- React Hydration Bundle Neutralized to prevent layout reversion -->'
);

// 6b. UNHIDE CLIENT LOGOS & CAROUSEL (Reveal hidden inline opacity)
html = html.replace(
  /<div class="framer-([a-z0-9]+)-container" style="will-change:transform;opacity:0;/g,
  '<div class="framer-$1-container" style="will-change:transform;opacity:1;'
);
html = html.replace(
  /<div class="framer-vkupn2-container hidden-72rtr7" style="will-change:transform;opacity:0;transform:translateY\(120px\)">/g,
  '<div class="framer-vkupn2-container hidden-72rtr7" style="will-change:transform;opacity:1;transform:none">'
);

// 6c. UNHIDE SERVICE ACCORDION TITLES & CONTAINERS (Reveal hidden inline opacity)
html = html.replace(/<div class="framer-1pna3mw"([^>]*)style="([^"]*)opacity:\s*0([^"]*)"/g, '<div class="framer-1pna3mw"$1style="$2opacity:1$3"');
html = html.replace(/<div class="framer-e483A([^>]*)style="([^"]*)opacity:\s*0([^"]*)"/g, '<div class="framer-e483A"$1style="$2opacity:1$3"');

// 6d. UNHIDE FAQ (SSS) SECTION
html = html.replace(/class="framer-ajhzzt[^"]*"/g, 'class="framer-ajhzzt"');
html = html.replace(/<div class="framer-1euscwr"([^>]*)style="([^"]*)"/g, '<div class="framer-1euscwr"$1style="opacity:1;transform:none;"');
html = html.replace(/<div class="framer-pj2cdc"([^>]*)style="([^"]*)opacity:\s*0([^"]*)"/g, '<div class="framer-pj2cdc"$1style="$2opacity:1$3"');
html = html.replace(/<div class="framer-12yhnwq-container"([^>]*)style="([^"]*)"/g, '<div class="framer-12yhnwq-container"$1style="opacity:1;transform:none;"');
html = html.replace(/<div class="framer-dg5a4l-container([^>]*)style="([^"]*)opacity:\s*0([^"]*)"/g, '<div class="framer-dg5a4l-container$1style="$2opacity:1$3"');
html = html.replace(/<div class="framer-4gfh02-container([^>]*)style="([^"]*)opacity:\s*0([^"]*)"/g, '<div class="framer-4gfh02-container$1style="$2opacity:1$3"');

// 6e. REPLACE CLIENT LOGOS WITH TIGHTLY CROPPED IMAGES TO FIT FRAME PERFECTLY
html = croppedLogos.replaceLogos(html);

// 7. Master Styling for 5-and-5 Layout, Perfect Frame Fitting, Overlap Fixes, Responsiveness, and Visual Perfection
const masterStyles = `
<style id="hsvo-master-perfection-styles">
  /* ========================================================
     1. PRELOADER REMOVAL (Clean, instant site load)
     ======================================================== */
  .framer-143iyx0-container,
  [data-framer-name="PreLoader"],
  .framer-8zof89,
  .framer-cbfyvf,
  .framer-1dsur25-container {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }

  /* ========================================================
     2. HIDE DUPLICATE MOBILE & TABLET TEAM FRAGMENTS
     ======================================================== */
  .framer-q05768-container,
  .framer-103ic4r-container,
  .framer-mkha42-container,
  .framer-ymdhbf-container,
  .framer-1glbhag-container,
  .framer-13t0t5o-container,
  .framer-1wk3hns-container,
  .framer-6a71vw-container,
  .framer-1cfbu7y-container,
  .framer-19s1rcz-container {
    display: none !important;
  }

  /* ========================================================
     3. REVEAL ALL INLINE ANIMATED TEXT
     ======================================================== */
  [style*="opacity: 0.001"],
  [style*="opacity:0.001"] {
    opacity: 1 !important;
  }

  /* ========================================================
     4. FIX OVERLAPPING SECTIONS (ÜST ÜSTE BİNME DÜZELTMESİ)
     Eliminate Framer's broken absolute positioning & fixed heights
     ======================================================== */
  /* "Ürünleri ve deneyimleri nasıl tasarlıyoruz" Section */
  .framer-bxcwxi,
  .framer-1nn4ga1 {
    display: none !important;
  }

  .framer-qWTzE .framer-rnmq4t,
  .framer-rnmq4t {
    order: 4 !important;
    height: auto !important;
    min-height: min-content !important;
    width: 100% !important;
    max-width: 1200px !important;
    margin: 50px auto 30px auto !important;
    padding: 10px 24px !important;
    box-sizing: border-box !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    clear: both !important;
    z-index: 2 !important;
  }

  /* "Neden bizi seçmelisiniz" & "Hizmet Alanlarımız" Section Gap Balance */
  .framer-3enyfc {
    height: auto !important;
    min-height: min-content !important;
    gap: 24px !important;
    margin-top: 40px !important;
    margin-bottom: 20px !important;
    padding: 0 24px !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .framer-1xayq43 {
    height: auto !important;
    min-height: min-content !important;
    gap: 20px !important;
    max-width: 1200px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .framer-lftblh {
    height: auto !important;
    min-height: min-content !important;
  }

  .framer-3fyghz-container {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .framer-qWTzE .framer-2nc9bx,
  .framer-2nc9bx {
    position: static !important;
    width: 100% !important;
    max-width: 1000px !important;
    height: auto !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    text-align: center !important;
  }

  .framer-2nc9bx h2 {
    text-align: center !important;
    margin: 0 auto !important;
    line-height: 1.35 !important;
    font-size: 38px !important;
  }

  .framer-2nc9bx span {
    opacity: 1 !important;
    transform: none !important;
    display: inline-block !important;
  }

  .framer-qWTzE .framer-1dky0xr,
  .framer-1dky0xr {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    width: 100% !important;
    max-width: 760px !important;
    height: auto !important;
    margin: 14px auto 0 auto !important;
    text-align: center !important;
    opacity: 0.7 !important;
  }

  .framer-1dky0xr p {
    font-size: 16px !important;
    line-height: 1.55 !important;
    color: rgba(10, 10, 10, 0.7) !important;
    text-align: center !important;
    margin: 0 auto !important;
  }

  /* "Yaklaşımımız nettir" & "Fonksiyonel, düşünceli..." Section */
  .framer-qWTzE .framer-pck459,
  .framer-pck459 {
    order: 6 !important;
    height: auto !important;
    min-height: min-content !important;
    width: 100% !important;
    max-width: 1200px !important;
    margin: 60px auto 40px auto !important;
    padding: 10px 24px !important;
    box-sizing: border-box !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 24px !important;
    clear: both !important;
    z-index: 2 !important;
  }

  .framer-1vd8r3h,
  .framer-2oyn2o {
    position: static !important;
    width: 100% !important;
    max-width: 1000px !important;
    height: auto !important;
    margin: 0 auto !important;
    display: block !important;
    text-align: center !important;
  }

  .framer-1vd8r3h h2,
  .framer-1vd8r3h p,
  .framer-2oyn2o h2,
  .framer-2oyn2o p {
    text-align: center !important;
    margin: 0 auto !important;
    line-height: 1.4 !important;
  }

  /* ========================================================
     5. THE UNIFIED 5 AND 5 TEAM GRID (CENTERED ON PAGE)
     ======================================================== */
  .hsvo-team-section-wrapper {
    order: 7 !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 30px auto 50px auto !important;
    padding: 0 20px !important;
    box-sizing: border-box !important;
    position: relative !important;
    z-index: 10 !important;
    overflow: visible !important;
    clear: both !important;
  }

  /* Exactly 5 items per row, centered horizontally on the page */
  .hsvo-team-grid {
    display: grid !important;
    grid-template-columns: repeat(5, 212px) !important;
    justify-content: center !important;
    align-content: center !important;
    gap: 16px !important;
    width: auto !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
  }

  .hsvo-card-item {
    width: 212px !important;
    height: 302px !important;
    display: block !important;
    position: relative !important;
  }

  /* Outer card wrappers */
  .hsvo-card-item > .ssr-variant,
  .hsvo-card-item > .ssr-variant > div {
    width: 212px !important;
    height: 302px !important;
    position: relative !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* ========================================================
     6. FIT IMAGES TO THE FRAME (ÇERÇEVEYE TAM OTURTMA)
     ======================================================== */
  .hsvo-card-item .framer-9j5N0 {
    width: 212px !important;
    height: 302px !important;
    border-radius: 18px !important;
    overflow: hidden !important;
    position: relative !important;
    padding: 0 !important;
    margin: 0 !important;
    background-color: #111111 !important;
    box-shadow: none !important;
    filter: none !important;
    -webkit-filter: none !important;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    display: block !important;
    cursor: pointer !important;
  }

  .hsvo-card-item:hover .framer-9j5N0 {
    transform: translateY(-6px) scale(1.02) !important;
    box-shadow: none !important;
    filter: none !important;
  }

  .hsvo-team-grid,
  .hsvo-team-grid *,
  .hsvo-card-item,
  .hsvo-card-item * {
    box-shadow: none !important;
  }

  /* The image container fills the whole card frame edge-to-edge */
  .hsvo-card-item .framer-1q2o2ve,
  .hsvo-card-item [data-framer-name="Image"] {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 18px !important;
    overflow: hidden !important;
    z-index: 1 !important;
    pointer-events: none !important;
  }

  .hsvo-card-item [data-framer-background-image-wrapper="true"] {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 18px !important;
    overflow: hidden !important;
  }

  /* The actual img fills the whole frame completely */
  .hsvo-card-item [data-framer-name="Image"] img,
  .hsvo-card-item img {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
    border-radius: 18px !important;
    display: block !important;
    opacity: 0.9 !important;
    transition: opacity 0.3s ease, transform 0.3s ease !important;
  }

  .hsvo-card-item:hover img {
    opacity: 0.8 !important;
    transform: scale(1.03) !important;
  }

  /* Card Content Overlay */
  .hsvo-card-item .framer-xay1xx {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 16px 14px !important;
    box-sizing: border-box !important;
    z-index: 2 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    border-radius: 18px !important;
    pointer-events: auto !important;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.05) 30%,
      rgba(0, 0, 0, 0) 55%,
      rgba(0, 0, 0, 0.85) 100%
    ) !important;
  }

  .hsvo-card-item .framer-18ljq4s {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    width: 100% !important;
  }

  .hsvo-card-item .framer-1uuohjq-container {
    width: auto !important;
    height: auto !important;
    flex: none !important;
  }

  .hsvo-card-item .framer-s6mhms {
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
    width: 100% !important;
  }

  /* Member Name Typography */
  .hsvo-card-item .framer-5i0ff7 {
    width: 100% !important;
    max-width: 100% !important;
  }

  .hsvo-card-item .framer-5i0ff7 p {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    text-shadow: none !important;
    line-height: 1.15 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* Member Role Typography */
  .hsvo-card-item .framer-1n8kojk p {
    font-size: 11px !important;
    font-weight: 500 !important;
    color: rgba(255, 255, 255, 0.95) !important;
    text-shadow: none !important;
    line-height: 1.2 !important;
  }

  /* Hide bio description */
  .hsvo-card-item .framer-1cxinh3 {
    display: none !important;
  }

  /* ========================================================
     7. RESPONSIVE BREAKPOINTS (Tablet & Mobile)
     ======================================================== */
  @media (max-width: 1180px) {
    .hsvo-team-grid {
      grid-template-columns: repeat(3, 212px) !important;
      gap: 14px !important;
    }
  }

  @media (max-width: 740px) {
    .hsvo-team-grid {
      grid-template-columns: repeat(2, 175px) !important;
      gap: 12px !important;
    }
    .hsvo-card-item,
    .hsvo-card-item > .ssr-variant,
    .hsvo-card-item > .ssr-variant > div,
    .hsvo-card-item .framer-9j5N0 {
      width: 175px !important;
      height: 250px !important;
    }
    .hsvo-card-item .framer-5i0ff7 p {
      font-size: 15px !important;
    }
    .hsvo-card-item .framer-1n8kojk p {
      font-size: 10px !important;
    }
  }

  @media (max-width: 400px) {
    .hsvo-team-grid {
      grid-template-columns: repeat(1, 230px) !important;
      gap: 12px !important;
    }
    .hsvo-card-item,
    .hsvo-card-item > .ssr-variant,
    .hsvo-card-item > .ssr-variant > div,
    .hsvo-card-item .framer-9j5N0 {
      width: 230px !important;
      height: 320px !important;
    }
  }

  /* ========================================================
     8. SERVICES & CATEGORIES ACCORDION & RED CONTAINER FLUID LAYOUT
     ======================================================== */
  /* Red Section Outer Wrapper */
  .framer-qWTzE .framer-xokryt,
  .framer-xokryt {
    order: 8 !important;
    height: auto !important;
    min-height: 560px !important;
    width: 100% !important;
    max-width: 1520px !important;
    margin: 40px auto !important;
    padding: 60px 40px 80px 40px !important;
    box-sizing: border-box !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    overflow: visible !important;
  }

  /* Red card background stretches automatically to match content height */
  .framer-x82qki-container {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 0 !important;
    pointer-events: none !important;
  }

  .framer-x82qki-container > div,
  .framer-x82qki-container .framer-Kg96D {
    width: 100% !important;
    height: 100% !important;
    border-radius: 25px !important;
    background-color: rgb(213, 66, 61) !important;
  }

  /* Accordion wrapper flows naturally */
  .framer-1hh6mhy-container {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
    max-width: 1128px !important;
    height: auto !important;
    min-height: min-content !important;
    margin: 30px auto 20px auto !important;
    padding: 0 !important;
    z-index: 2 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }

  .framer-xGW5X.framer-x5wmst {
    width: 100% !important;
    max-width: 1128px !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    position: relative !important;
  }

  /* Service item containers */
  .framer-1rzj7xg-container,
  .framer-1bfpaot-container,
  .framer-1sy2cyp-container,
  .framer-8xpe05-container {
    width: 100% !important;
    height: auto !important;
    position: relative !important;
    display: block !important;
  }

  /* Each accordion row */
  .framer-e483A.framer-1nd063s {
    width: 100% !important;
    height: auto !important;
    opacity: 1 !important;
    cursor: pointer !important;
    display: block !important;
    position: relative !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    box-sizing: border-box !important;
    transition: padding 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .framer-e483A.framer-1nd063s:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  /* OPEN STATE */
  .framer-e483A.framer-1nd063s.framer-v-1nd063s,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop open"] {
    padding: 30px 0 35px 0 !important;
  }

  .framer-e483A.framer-1nd063s.framer-v-1nd063s .framer-174h6l6,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop open"] .framer-174h6l6 {
    display: flex !important;
    opacity: 1 !important;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    pointer-events: auto !important;
    width: 100% !important;
    height: auto !important;
    padding-right: 60px !important;
    box-sizing: border-box !important;
    transition: opacity 0.3s ease !important;
  }

  .framer-e483A.framer-1nd063s.framer-v-1nd063s .framer-1pna3mw,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop open"] .framer-1pna3mw {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* CLOSED STATE */
  .framer-e483A.framer-1nd063s.framer-v-1cek2le,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop closed"] {
    padding: 18px 0 !important;
  }

  .framer-e483A.framer-1nd063s.framer-v-1cek2le .framer-174h6l6,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop closed"] .framer-174h6l6 {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    top: -9999px !important;
  }

  .framer-e483A.framer-1nd063s.framer-v-1cek2le .framer-1pna3mw,
  .framer-e483A.framer-1nd063s[data-framer-name="Desktop closed"] .framer-1pna3mw {
    display: block !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    width: auto !important;
    height: auto !important;
  }

  .framer-e483A.framer-1nd063s.framer-v-1cek2le .framer-1pna3mw p {
    opacity: 1 !important;
    color: #ffffff !important;
    font-size: 20px !important;
    font-weight: 500 !important;
    margin: 0 !important;
  }

  /* Row content flex layout */
  .framer-e483A .framer-1ox4qjh {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100% !important;
    height: auto !important;
    padding: 0 !important;
  }

  /* Plus / Minus Button */
  .framer-e483A .framer-koycop {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    flex: none !important;
    width: 44px !important;
    height: 44px !important;
    border-radius: 50% !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    background-color: transparent !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: transform 0.2s ease, background-color 0.2s ease !important;
  }

  .framer-e483A:hover .framer-koycop {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  /* In OPEN state, hide vertical bar V so it becomes a minus sign - */
  .framer-e483A.framer-v-1nd063s .framer-2rakpf,
  .framer-e483A.framer-v-1nd063s [data-framer-name="V"],
  .framer-e483A[data-framer-name="Desktop open"] .framer-2rakpf,
  .framer-e483A[data-framer-name="Desktop open"] [data-framer-name="V"] {
    display: none !important;
    opacity: 0 !important;
  }

  /* In CLOSED state, show vertical bar V so it is a plus sign + */
  .framer-e483A.framer-v-1cek2le .framer-2rakpf,
  .framer-e483A.framer-v-1cek2le [data-framer-name="V"],
  .framer-e483A[data-framer-name="Desktop closed"] .framer-2rakpf,
  .framer-e483A[data-framer-name="Desktop closed"] [data-framer-name="V"] {
    display: block !important;
    opacity: 1 !important;
  }

  .framer-e483A .framer-48ytin,
  .framer-e483A [data-framer-name="H"] {
    display: block !important;
    opacity: 1 !important;
  }

  /* Categories & Tags */
  [data-framer-name="Categories"],
  .framer-obmt7x,
  .framer-1mst7mf {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  [data-framer-name="Categories"] p,
  [data-framer-name="Variant 1"] p {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* "Başlayın" button is positioned cleanly below the accordions */
  .framer-r9wof4-container {
    position: relative !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    margin: 30px auto 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 5 !important;
    width: auto !important;
  }

  /* "Ne yapıyoruz" badge at top-left */
  .framer-66gr9q-container {
    position: absolute !important;
    top: 40px !important;
    left: 50px !important;
    z-index: 2 !important;
  }

  /* ========================================================
     9. LOGO CLIPPING FIX (Fix H V and R E cut off)
     ======================================================== */
  .framer-126vq0d,
  .framer-a6y0h,
  .framer-1ppeyn8,
  .framer-kxb2zt-container {
    width: 154px !important;
    height: 42px !important;
    min-width: 154px !important;
    max-width: unset !important;
    overflow: visible !important;
  }

  .framer-126vq0d > div,
  .framer-126vq0d [data-framer-background-image-wrapper="true"],
  .framer-126vq0d img,
  a[data-framer-name="Link"] img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    object-position: left center !important;
    display: block !important;
  }

  /* ========================================================
     10. CLIENT LOGOS (+ Müşterilerimiz) REVEAL & STYLING
     ======================================================== */
  .framer-obv19p {
    height: auto !important;
    min-height: min-content !important;
    overflow: visible !important;
    margin-top: 15px !important;
    margin-bottom: 35px !important;
    padding: 10px 24px !important;
    gap: 0 !important;
  }

  .framer-u2mvzk {
    height: auto !important;
    min-height: min-content !important;
    width: 100% !important;
    max-width: 1400px !important;
    margin: 0 auto !important;
    padding: 32px 30px !important;
    box-sizing: border-box !important;
    border-radius: 20px !important;
    background-color: #ffffff !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 20px !important;
    overflow: visible !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
  }

  .framer-1h7dt48 {
    width: 100% !important;
    display: flex !important;
    justify-content: flex-start !important;
    align-items: center !important;
    margin-bottom: 4px !important;
  }

  .framer-ttgy44,
  [data-framer-name="Logo"] {
    display: grid !important;
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
    gap: 16px !important;
    width: 100% !important;
    max-width: 1360px !important;
    height: auto !important;
    min-height: 120px !important;
    opacity: 1 !important;
    visibility: visible !important;
    overflow: visible !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }

  .framer-ttgy44 > div,
  .framer-fpt5vu-container,
  .framer-p15glg-container,
  .framer-1dvpa5m-container,
  .framer-h62ty1-container,
  .framer-b7eioi-container,
  .framer-mkf0oc-container,
  .framer-1qn9kvf-container,
  .framer-1kttizo-container {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 120px !important;
    aspect-ratio: auto !important;
    position: relative !important;
  }

  .framer-ttgy44 .framer-zX1jS,
  .framer-ttgy44 .framer-sjdfbs {
    width: 100% !important;
    height: 100% !important;
    border-radius: 14px !important;
    background-color: #f7f7f8 !important;
    border: 1px solid rgba(0, 0, 0, 0.06) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px 18px !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
  }

  .framer-ttgy44 .framer-zX1jS:hover {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
    background-color: #ffffff !important;
  }

  .framer-ttgy44 .framer-1mce2ck {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: visible !important;
  }

  .framer-ttgy44 [data-framer-background-image-wrapper="true"] {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: visible !important;
  }

  .framer-ttgy44 img {
    display: block !important;
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    object-position: center !important;
    opacity: 1 !important;
    position: static !important;
    margin: auto !important;
    transform: none !important;
    transition: transform 0.25s ease !important;
  }

  .framer-ttgy44 .framer-zX1jS:hover img {
    transform: scale(1.06) !important;
  }

  /* 1 Process Carousel only: Hide the duplicate carousel */
  .framer-vkupn2-container {
    display: none !important;
  }

  /* Canonical Process Carousel (Showreel) */
  .framer-qWTzE .framer-1dgpip1,
  .framer-1dgpip1 {
    order: 5 !important;
    display: block !important;
    height: auto !important;
    min-height: min-content !important;
    width: 100% !important;
    margin-top: 10px !important;
    margin-bottom: 70px !important;
    padding: 0 !important;
    overflow: visible !important;
    position: relative !important;
    z-index: 2 !important;
  }

  .framer-qWTzE .framer-osccpf,
  .framer-osccpf {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    max-width: 1520px !important;
    height: auto !important;
    min-height: min-content !important;
    margin: 0 auto !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .framer-qWTzE .framer-1wb3w75-container,
  .framer-1wb3w75-container {
    width: 100% !important;
    height: auto !important;
    min-height: min-content !important;
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    overflow: visible !important;
    position: relative !important;
  }

  .framer-1wb3w75-container section[aria-roledescription="carousel"] {
    display: flex !important;
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: min-content !important;
    overflow: visible !important;
    padding: 0 20px !important;
    box-sizing: border-box !important;
  }

  .framer-1wb3w75-container ul.framer--carousel {
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch !important;
    width: 100% !important;
    height: auto !important;
    min-height: 640px !important;
    gap: 42px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-behavior: smooth !important;
    scroll-snap-type: x mandatory !important;
    padding: 10px 0 20px 0 !important;
    margin: 0 !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .framer--carousel li {
    scroll-snap-align: center !important;
    flex-shrink: 0 !important;
    height: auto !important;
    display: flex !important;
  }

  .framer--carousel .framer-croto4 {
    height: 100% !important;
    min-height: min-content !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* Carousel Next / Prev Controls */
  .framer--carousel-controls {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    pointer-events: none !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
    z-index: 25 !important;
    border: 0 !important;
    margin: 0 !important;
  }

  .framer--carousel-controls button {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    background-color: #0a0a0a !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: transform 0.2s ease, background-color 0.2s ease, opacity 0.25s ease !important;
    pointer-events: auto !important;
  }

  .framer--carousel-controls button:hover {
    transform: scale(1.12) !important;
    background-color: #222222 !important;
  }

  .framer--carousel-controls button:active {
    transform: scale(0.95) !important;
  }

  .framer--carousel-controls button[aria-label="Next"] {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  .framer--carousel-controls button img {
    width: 22px !important;
    height: 22px !important;
    display: block !important;
    pointer-events: none !important;
  }

  @media (max-width: 1200px) {
    .framer-ttgy44,
    [data-framer-name="Logo"] {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 12px !important;
    }
    .framer-ttgy44 > div,
    .framer-ttgy44 [class*="-container"] {
      height: 90px !important;
    }
  }

  @media (max-width: 650px) {
    .framer-ttgy44,
    [data-framer-name="Logo"] {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
    }
    .framer-ttgy44 > div,
    .framer-ttgy44 [class*="-container"] {
      height: 80px !important;
    }
  }

  /* ========================================================
     11. FAQ (SSS) SECTION REVEAL & FLUID LAYOUT
     ======================================================== */
  /* Hide duplicate mobile variant */
  .framer-1k48nf0,
  .framer-10live1 {
    display: none !important;
  }

  /* Main SSS Outer Section */
  .framer-qWTzE .framer-ajhzzt,
  .framer-ajhzzt {
    order: 9 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
    max-width: 1360px !important;
    height: auto !important;
    min-height: min-content !important;
    margin: 80px auto 60px auto !important;
    padding: 0 40px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    position: relative !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* SSS Heading Row */
  .framer-9elpr3 {
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    min-height: min-content !important;
    position: relative !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-end !important;
    justify-content: space-between !important;
    gap: 30px !important;
    margin-bottom: 40px !important;
    padding: 0 !important;
    background: transparent !important;
  }

  /* "SSS." Heading */
  .framer-1euscwr {
    position: relative !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    flex: none !important;
    width: auto !important;
    height: auto !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    display: block !important;
  }

  .framer-1euscwr h2 {
    font-size: 54px !important;
    font-weight: 700 !important;
    color: rgb(213, 66, 61) !important;
    line-height: 1 !important;
    margin: 0 !important;
    letter-spacing: -0.02em !important;
  }

  /* Subtitle paragraph */
  .framer-1xjiuvd {
    position: relative !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    width: auto !important;
    max-width: 650px !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-end !important;
    overflow: visible !important;
  }

  .framer-1xjiuvd > .ssr-variant:first-child {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  .framer-1xjiuvd > .ssr-variant:nth-child(2) {
    display: none !important;
  }

  .framer-mxm94s {
    width: 100% !important;
    height: auto !important;
    opacity: 1 !important;
  }

  .framer-mxm94s h2 {
    font-size: 16px !important;
    font-weight: 400 !important;
    line-height: 1.5 !important;
    color: rgba(10, 10, 10, 0.6) !important;
    margin: 0 !important;
  }

  /* FAQ Accordion List Outer Wrapper */
  .framer-1ez9tmr {
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    min-height: min-content !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: visible !important;
    background: transparent !important;
  }

  .framer-1ez9tmr > .ssr-variant:first-child {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    height: auto !important;
  }

  .framer-1ez9tmr > .ssr-variant:nth-child(2) {
    display: none !important;
  }

  .framer-12yhnwq-container {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    display: block !important;
  }

  .framer-12yhnwq-container .framer-C423S,
  .framer-12yhnwq-container .framer-mbtw9f-container {
    width: 100% !important;
    height: auto !important;
  }

  /* Each FAQ Item */
  [class*="force-styles-"][class*="-item-"] {
    width: 100% !important;
    margin-bottom: 12px !important;
    border-radius: 14px !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    background-color: #f7f7f8 !important;
    overflow: hidden !important;
    transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease !important;
  }

  [class*="force-styles-"][class*="-item-"]:hover {
    background-color: #ffffff !important;
    border-color: rgba(213, 66, 61, 0.3) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
  }

  [class*="force-styles-"][class*="-item-"] > div:first-child {
    padding: 24px 28px !important;
    user-select: none !important;
  }

  [class*="force-styles-"][class*="-item-"] span {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: rgb(10, 10, 10) !important;
  }

  [class*="force-styles-"][class*="-item-"] p {
    font-size: 15px !important;
    line-height: 1.6 !important;
    color: rgba(10, 10, 10, 0.7) !important;
  }

  @media (max-width: 768px) {
    .framer-ajhzzt {
      padding: 0 20px !important;
      margin: 50px auto 40px auto !important;
    }
    .framer-9elpr3 {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 16px !important;
      margin-bottom: 24px !important;
    }
    .framer-1euscwr h2 {
      font-size: 40px !important;
    }
    [class*="force-styles-"][class*="-item-"] > div:first-child {
      padding: 18px 20px !important;
    }
    [class*="force-styles-"][class*="-item-"] span {
      font-size: 16px !important;
    }
  }

  /* ========================================================
     12. GOOGLE MAP SECTION - Positioned right above Footer with balanced gap
     ======================================================== */
  .framer-qWTzE .framer-n6zanm-container,
  .framer-n6zanm-container {
    order: 10 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 480px !important;
    min-height: 420px !important;
    margin-top: 60px !important;
    margin-bottom: 50px !important; /* "biraz boşluk bırakarak üstünde kalması gerekiyor" */
    padding: 0 !important;
    box-sizing: border-box !important;
    position: relative !important;
    z-index: 5 !important;
    clear: both !important;
  }

  .framer-n6zanm-container > div,
  .framer-n6zanm-container #QlB_SQryz {
    width: 100% !important;
    height: 100% !important;
    border-radius: 0px !important;
    overflow: hidden !important;
    position: relative !important;
    display: block !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
  }

  .framer-n6zanm-container iframe {
    width: 100% !important;
    height: 100% !important;
    border: 0 !important;
    display: block !important;
  }

  /* Hide duplicate mobile map and spacers */
  .framer-9qzca9-container,
  .framer-15cocei,
  .framer-1vwmyy5,
  .framer-d4ac2u {
    display: none !important;
  }

  @media (max-width: 800px) {
    .framer-qWTzE .framer-n6zanm-container,
    .framer-n6zanm-container {
      height: 380px !important;
      min-height: 320px !important;
      margin-top: 40px !important;
      margin-bottom: 35px !important;
    }
  }

  /* Prevent horizontal scroll */
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    scroll-behavior: smooth !important;
  }
</style>
`;

// 8. Lightweight client-side helper for FAQ accordions & video playback
const clientRuntimeScript = `
<script id="hsvo-runtime-script">
  document.addEventListener('DOMContentLoaded', function() {
    // 1. Ensure all videos play
    document.querySelectorAll('video').forEach(function(vid) {
      vid.muted = true;
      vid.play().catch(function() {});
    });

    // 2. Interactive FAQ (SSS) accordions
    document.querySelectorAll('[class*="force-styles-"][class*="-item-"]').forEach(function(item) {
      item.style.cursor = 'pointer';
      var answer = item.querySelector('div[style*="height:0px"], div[style*="height: 0px"], div[style*="will-change:height"]');
      var arrowIcon = item.querySelector('img[src*="j6H7CUu4CDaOQoux5xCbVztY18"], img[alt="icon"]');

      if (arrowIcon) {
        arrowIcon.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      if (answer) {
        answer.style.overflow = 'hidden';
        answer.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

        item.addEventListener('click', function(e) {
          if (e.target.closest('a')) return;
          var isCurrentlyOpen = answer.style.height !== '0px' && answer.style.height !== '';

          if (isCurrentlyOpen) {
            answer.style.height = '0px';
            if (arrowIcon) arrowIcon.style.transform = 'rotate(0deg)';
          } else {
            var fullHeight = answer.scrollHeight;
            answer.style.height = fullHeight + 'px';
            if (arrowIcon) arrowIcon.style.transform = 'rotate(180deg)';
          }
        });
      }
    });

    // 3. Ensure all text spans are visible
    document.querySelectorAll('[style*="opacity: 0.001"], [style*="opacity:0.001"]').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // 4. Interactive Services & Categories accordions (Controlled single-open accordion)
    var serviceContainers = document.querySelectorAll('.framer-xGW5X, .framer-1hh6mhy-container');
    if (!serviceContainers || serviceContainers.length === 0) {
      serviceContainers = [document.body];
    }

    serviceContainers.forEach(function(container) {
      var items = container.querySelectorAll('.framer-e483A.framer-1nd063s');
      if (!items || items.length === 0) {
        items = container.querySelectorAll('.framer-e483A');
      }
      if (!items || items.length === 0) return;

      function updateItem(item, open) {
        var openDetails = item.querySelector('.framer-174h6l6');
        var closedTitle = item.querySelector('.framer-1pna3mw');
        var vBar = item.querySelector('.framer-2rakpf, [data-framer-name="V"]');

        if (open) {
          item.classList.remove('framer-v-1cek2le');
          item.classList.add('framer-v-1nd063s');
          item.setAttribute('data-framer-name', 'Desktop open');
          if (openDetails) {
            openDetails.style.setProperty('display', 'flex', 'important');
            openDetails.style.setProperty('opacity', '1', 'important');
            openDetails.style.setProperty('pointer-events', 'auto', 'important');
          }
          if (closedTitle) {
            closedTitle.style.setProperty('display', 'none', 'important');
            closedTitle.style.setProperty('opacity', '0', 'important');
            closedTitle.style.setProperty('pointer-events', 'none', 'important');
          }
          if (vBar) {
            vBar.style.setProperty('display', 'none', 'important');
          }
        } else {
          item.classList.remove('framer-v-1nd063s');
          item.classList.add('framer-v-1cek2le');
          item.setAttribute('data-framer-name', 'Desktop closed');
          if (openDetails) {
            openDetails.style.setProperty('display', 'none', 'important');
            openDetails.style.setProperty('opacity', '0', 'important');
            openDetails.style.setProperty('pointer-events', 'none', 'important');
          }
          if (closedTitle) {
            closedTitle.style.setProperty('display', 'block', 'important');
            closedTitle.style.setProperty('opacity', '1', 'important');
            closedTitle.style.setProperty('pointer-events', 'auto', 'important');
          }
          if (vBar) {
            vBar.style.setProperty('display', 'block', 'important');
          }
        }
      }

      // Initialize: Item 1 open by default, all others closed
      items.forEach(function(item, idx) {
        if (idx === 0) {
          updateItem(item, true);
        } else {
          updateItem(item, false);
        }

        item.addEventListener('click', function(e) {
          if (e.target.closest('a')) return;

          var isCurrentlyOpen = item.getAttribute('data-framer-name') === 'Desktop open' || 
                                item.classList.contains('framer-v-1nd063s');

          if (isCurrentlyOpen) {
            // If already open, toggle it closed
            updateItem(item, false);
          } else {
            // Close all other items in this accordion container first
            items.forEach(function(otherItem) {
              updateItem(otherItem, false);
            });
            // Open ONLY the clicked item
            updateItem(item, true);
          }
        });
      });
    });

    // 5. Ensure all client logos and canonical carousel are unhidden
    document.querySelectorAll('.framer-ttgy44, .framer-ttgy44 > div, .framer-ttgy44 [style*="opacity:0"], .framer-ttgy44 [style*="opacity: 0"], .framer-1dgpip1, .framer-osccpf, .framer-1wb3w75-container').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });

    // 6. Ensure FAQ (SSS) elements are fully visible
    document.querySelectorAll('.framer-ajhzzt, .framer-1euscwr, .framer-12yhnwq-container, .framer-1ez9tmr').forEach(function(el) {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
    });

    // 7. Interactive Process Carousel (Cards Slide Right / Left)
    function setupProcessCarousel() {
      var carousels = document.querySelectorAll('.framer-1dgpip1, .framer-1wb3w75-container');
      carousels.forEach(function(container) {
        var list = container.querySelector('ul.framer--carousel') || container.querySelector('ul');
        if (!list) return;

        var nextBtn = container.querySelector('button[aria-label="Next"]');
        var prevBtn = container.querySelector('button[aria-label="Previous"]');

        function getCardStep() {
          var firstCard = list.querySelector('li');
          if (firstCard) {
            var gap = 42;
            try {
              var g = window.getComputedStyle(list).gap;
              if (g && parseFloat(g)) gap = parseFloat(g);
            } catch (err) {}
            return firstCard.offsetWidth + gap;
          }
          return 412;
        }

        function updateButtonStates() {
          var maxScroll = list.scrollWidth - list.clientWidth;
          var cur = list.scrollLeft;

          if (prevBtn) {
            if (cur > 15) {
              prevBtn.style.setProperty('opacity', '1', 'important');
              prevBtn.style.setProperty('pointer-events', 'auto', 'important');
              prevBtn.style.setProperty('cursor', 'pointer', 'important');
            } else {
              prevBtn.style.setProperty('opacity', '0', 'important');
              prevBtn.style.setProperty('pointer-events', 'none', 'important');
              prevBtn.style.setProperty('cursor', 'default', 'important');
            }
          }

          if (nextBtn) {
            if (cur < maxScroll - 15) {
              nextBtn.style.setProperty('opacity', '1', 'important');
              nextBtn.style.setProperty('pointer-events', 'auto', 'important');
              nextBtn.style.setProperty('cursor', 'pointer', 'important');
            } else {
              nextBtn.style.setProperty('opacity', '0.4', 'important');
            }
          }
        }

        if (nextBtn && !nextBtn.dataset.bound) {
          nextBtn.dataset.bound = 'true';
          nextBtn.style.setProperty('pointer-events', 'auto', 'important');
          nextBtn.style.setProperty('cursor', 'pointer', 'important');
          nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var step = getCardStep();
            var maxScroll = list.scrollWidth - list.clientWidth;
            if (list.scrollLeft >= maxScroll - 15) {
              list.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              list.scrollBy({ left: step, behavior: 'smooth' });
            }
          });
        }

        if (prevBtn && !prevBtn.dataset.bound) {
          prevBtn.dataset.bound = 'true';
          prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var step = getCardStep();
            if (list.scrollLeft <= 15) {
              list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' });
            } else {
              list.scrollBy({ left: -step, behavior: 'smooth' });
            }
          });
        }

        list.addEventListener('scroll', updateButtonStates, { passive: true });
        window.addEventListener('resize', updateButtonStates);
        updateButtonStates();

        // Mouse drag scrolling support
        var isDown = false;
        var startX, scrollLeftVal;
        list.addEventListener('mousedown', function(e) {
          if (e.target.closest('button') || e.target.closest('a')) return;
          isDown = true;
          list.style.cursor = 'grabbing';
          list.style.userSelect = 'none';
          startX = e.pageX - list.offsetLeft;
          scrollLeftVal = list.scrollLeft;
        });
        window.addEventListener('mouseup', function() {
          if (!isDown) return;
          isDown = false;
          list.style.cursor = '';
          list.style.userSelect = '';
        });
        list.addEventListener('mouseleave', function() {
          if (!isDown) return;
          isDown = false;
          list.style.cursor = '';
          list.style.userSelect = '';
        });
        list.addEventListener('mousemove', function(e) {
          if (!isDown) return;
          e.preventDefault();
          var x = e.pageX - list.offsetLeft;
          var walk = (x - startX) * 1.5;
          list.scrollLeft = scrollLeftVal - walk;
        });
      });
    }

    // 8. Ensure Google Map is visible and correctly initialized
    document.querySelectorAll('.framer-n6zanm-container, .framer-n6zanm-container > div, .framer-n6zanm-container iframe').forEach(function(el) {
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('transform', 'none', 'important');
    });

    setupProcessCarousel();
    setTimeout(setupProcessCarousel, 300);
  });
</script>
`;

// Insert master styles right before </head>
html = html.replace('</head>', `${masterStyles}\n${langModule.switcherStyles}\n</head>`);

// Insert language switcher markup right before the hamburger button container in each navbar
html = html.replaceAll(
  '<div class="framer-ednsow" data-framer-name="Button container"',
  `${langModule.switcherHtml}\n<div class="framer-ednsow" data-framer-name="Button container"`
);

// Insert runtime script & language script right before </body>
html = html.replace('</body>', `${clientRuntimeScript}\n${langModule.switcherScript}\n</body>`);

// Replace Mustafa Kemal Karakaya with M. Kemal Karakaya
html = html.replaceAll('Mustafa Kemal Karakaya', 'M. Kemal Karakaya');

// Write out the perfected index.html
fs.writeFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/index.html', html, 'utf8');
console.log('Successfully written index.html with language switcher.');

