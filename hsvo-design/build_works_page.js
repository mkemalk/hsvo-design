const fs = require('fs');
const https = require('https');
const langModule = require('./lang_module.js');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchPage(res.headers.location));
      }
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function rebuildWorks() {
  console.log('Fetching pristine works page from https://hsvo.com.tr/tr/works ...');
  let html = await fetchPage('https://hsvo.com.tr/tr/works');

  // 1. Basic typo & contact bug fixes
  html = html.replace(/555-666-7777/g, '+90 (505) 735 31 16');
  html = html.replace(/hello@fabrica\.com/g, 'iletisim@hsvo.com.tr');
  html = html.replace(/hsvo-design-and-sofware/g, 'hsvo-design-and-software');

  // 2. Comprehensive styling to ensure:
  // - Project cards are 100% visible (never hidden by opacity 0 or transform)
  // - Images are 100% visible, fully rendered, and not blocked by any blackout overlay
  const worksMasterStyles = `
<style id="hsvo-works-master-styles">
  /* 1. Page & Section Visibility */
  .framer-1dhcjqj,
  .framer-jwokfp,
  .framer-1gbfokw,
  .framer-1cfsi94,
  .framer-1cc0n5q,
  .framer-mnwswr-container,
  [data-framer-appear-id],
  [data-framer-name="Intro"],
  [data-framer-name="Cards"],
  [data-framer-name="Project header"],
  [data-framer-name="Project info"],
  [data-framer-name="Desktop"],
  [data-framer-name="Phone"] {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }

  /* Specific opacity fixes WITHOUT breaking partial opacities like opacity: 0.15 */
  [style*="opacity:0.001"],
  [style*="opacity: 0.001"] {
    opacity: 1 !important;
    transform: none !important;
  }

  .framer-mnwswr-container {
    opacity: 1 !important;
    transform: none !important;
    display: block !important;
    visibility: visible !important;
  }

  /* 2. Sizing & Grid Layout (Compact, balanced cards) */
  .framer-jwokfp,
  [data-framer-name="Container"] {
    max-width: 1060px !important;
    width: 92% !important;
    margin: 0 auto !important;
  }

  .framer-1cfsi94 {
    gap: 18px !important;
    width: 100% !important;
  }

  .framer-1nwqy7f {
    height: 320px !important;
    max-height: 340px !important;
    min-height: unset !important;
    aspect-ratio: unset !important;
    width: 100% !important;
    position: relative !important;
    display: block !important;
    overflow: hidden !important;
    background-color: #1a1a1a !important;
    border-radius: 16px !important;
  }

  .framer-f2jpip,
  [data-framer-name="Project header"] {
    padding: 12px 16px !important;
  }

  .framer-1cjq3al p {
    font-size: 15px !important;
    font-weight: 600 !important;
  }

  .framer-ybsvxe,
  [data-framer-name="Image container"] {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    overflow: hidden !important;
    z-index: 1 !important;
  }

  .framer-jh1lcx,
  [data-framer-name="Image"] {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    z-index: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  /* Image wrappers and actual img tags */
  [data-framer-background-image-wrapper="true"],
  .framer-jh1lcx > div {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    opacity: 1 !important;
  }

  .framer-jh1lcx img,
  [data-framer-name="Image"] img,
  [data-framer-background-image-wrapper="true"] img {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* 3. Disable blackout overlay so images are bright, crisp, and 100% visible */
  [data-framer-name="blackout"],
  .framer-16bbbzt {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }

  /* 4. Fix Logo Clipping (H V and R E cut off) */
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

  /* 5. Freeze Product Cards (Strictly No Movement on Hover or Page Open) */
  .framer-fTdiX,
  .framer-fTdiX *,
  .framer-fTdiX:hover,
  .framer-fTdiX.hover,
  .framer-mnwswr-container,
  .framer-mnwswr-container *,
  .framer-1cc0n5q,
  .framer-1cc0n5q *,
  .framer-1nwqy7f,
  .framer-1nwqy7f *,
  .framer-ybsvxe,
  .framer-ybsvxe:hover,
  .framer-jh1lcx,
  .framer-jh1lcx:hover,
  [data-framer-name="Desktop"],
  [data-framer-name="Desktop"]:hover,
  [data-framer-name="Phone"],
  [data-framer-name="Phone"]:hover,
  [data-framer-name="Image container"],
  [data-framer-name="Image container"]:hover,
  [data-framer-name="Image"],
  [data-framer-name="Image"]:hover,
  [data-framer-name="Image"] img,
  [data-framer-name="Image"]:hover img,
  [data-framer-name="Project header"],
  [data-framer-name="Project header"]:hover,
  .framer-12nyrxi,
  .framer-1cjq3al,
  .framer-zgvrqz {
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
    animation: none !important;
  }

  .framer-ybsvxe,
  .framer-fTdiX .framer-ybsvxe,
  .framer-fTdiX:hover .framer-ybsvxe,
  .framer-fTdiX.hover .framer-ybsvxe,
  [data-framer-name="Image container"] {
    inset: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .framer-fTdiX img,
  .framer-fTdiX:hover img,
  [data-framer-name="Desktop"]:hover img {
    transform: none !important;
    scale: 1 !important;
    transition: none !important;
  }

  /* Prevent page horizontal scroll */
  html, body {
    overflow-x: hidden !important;
    scroll-behavior: smooth !important;
  }
</style>
`;

  const freezeMotionScript = `
<script id="hsvo-freeze-motion">
  document.addEventListener('DOMContentLoaded', function() {
    function freezeElements() {
      var elements = document.querySelectorAll('.framer-fTdiX, .framer-mnwswr-container, .framer-1nwqy7f, .framer-ybsvxe, .framer-jh1lcx, [data-framer-name="Desktop"]');
      elements.forEach(function(el) {
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.addEventListener('mousemove', function(e) {
          el.style.transform = 'none';
        }, true);
        el.addEventListener('mouseenter', function(e) {
          el.style.transform = 'none';
        }, true);
        el.addEventListener('mouseleave', function(e) {
          el.style.transform = 'none';
        }, true);
      });
    }
    freezeElements();
    setTimeout(freezeElements, 500);
    setTimeout(freezeElements, 1500);
  });
</script>
`;

  // Insert styles
  html = html.replace('</head>', `${worksMasterStyles}\n${langModule.switcherStyles}\n</head>`);

  // 3. Insert TR / EN language switcher right before the hamburger button container in each navbar
  html = html.replaceAll(
    '<div class="framer-ednsow" data-framer-name="Button container"',
    `${langModule.switcherHtml}\n<div class="framer-ednsow" data-framer-name="Button container"`
  );

  // 4. Insert language switcher script & freeze script before </body>
  html = html.replace('</body>', `${freezeMotionScript}\n${langModule.switcherScript}\n</body>`);

  fs.writeFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/works.html', html, 'utf8');
  console.log('Successfully written pristine works.html with frozen cards & images 100% visible!');
}

rebuildWorks().catch(console.error);
