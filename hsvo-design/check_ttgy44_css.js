const fs = require('fs');

const html = fs.readFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('.framer-ttgy44', idx + 1)) !== -1) {
  let end = html.indexOf('}', idx);
  console.log(html.slice(idx, end + 1));
}
