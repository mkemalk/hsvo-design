const fs = require('fs');

const dir = 'C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/images/logos';

const logoMap = {
  'SWnYQy6wY1o2mfNOjVIdl1JYsA': 'data:image/png;base64,' + fs.readFileSync(`${dir}/fakir.png`).toString('base64'),
  'uDkuNaNjIZRtt32sRaY4VW7pLzQ': 'data:image/png;base64,' + fs.readFileSync(`${dir}/kaave.png`).toString('base64'),
  'vLABSkJfupghW3iiMuGkb3ZLWk': 'data:image/png;base64,' + fs.readFileSync(`${dir}/range.png`).toString('base64'),
  'joLx8dHMHMSBWZrNvUhdT29jQ9c': 'data:image/png;base64,' + fs.readFileSync(`${dir}/nilco.png`).toString('base64'),
  'mqvU58BbcKyu4hOA5zzGOwd2t4': 'data:image/png;base64,' + fs.readFileSync(`${dir}/saruhan.png`).toString('base64'),
  '0FP7IfwxJdH7qhtaC2m7xDjA9Fo': 'data:image/png;base64,' + fs.readFileSync(`${dir}/saruhan_kimya.png`).toString('base64'),
  'aoPbG9v6Eob78uRSpPibpcUSSFI': 'data:image/png;base64,' + fs.readFileSync(`${dir}/berrplas.png`).toString('base64'),
  'uVX8LUqyw7cs9Ggr47UEtNiYzk': 'data:image/png;base64,' + fs.readFileSync(`${dir}/iyo.png`).toString('base64')
};

function replaceLogos(html) {
  for (const [key, dataUri] of Object.entries(logoMap)) {
    // Replace srcset occurrences
    const srcsetRegex = new RegExp('https:\\/\\/framerusercontent\\.com\\/images\\/' + key + '\\.png[^"\\s]+', 'g');
    html = html.replace(srcsetRegex, dataUri);
    // Replace src occurrences
    const srcRegex = new RegExp('https:\\/\\/framerusercontent\\.com\\/images\\/' + key + '\\.png[^"]*', 'g');
    html = html.replace(srcRegex, dataUri);
  }
  return html;
}

module.exports = { logoMap, replaceLogos };
