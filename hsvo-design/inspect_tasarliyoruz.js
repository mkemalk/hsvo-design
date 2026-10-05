const fs = require('fs');

const html = fs.readFileSync('C:/Users/kemal.karakaya/.gemini/antigravity/scratch/hsvo-design/index.html', 'utf8');

console.log('--- Match 1 (around 470054) ---');
console.log(html.slice(469000, 471500));

console.log('\n--- Match 2 (around 492855) ---');
console.log(html.slice(492000, 494500));
