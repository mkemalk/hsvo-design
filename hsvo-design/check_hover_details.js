const fs = require('fs');

const html = fs.readFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/works.html', 'utf8');

['framer-fTdiX', 'framer-12nyrxi', 'framer-zgvrqz', 'framer-1nwqy7f', 'framer-ybsvxe'].forEach(cls => {
  let idx = 0;
  while ((idx = html.indexOf('.' + cls, idx + 1)) !== -1) {
    let end = html.indexOf('}', idx);
    console.log(html.slice(idx, end + 1));
  }
});
