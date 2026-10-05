const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Decode URI component (e.g. spaces or Turkish characters if any)
  try {
    reqPath = decodeURIComponent(reqPath);
  } catch (e) {}

  // Strip leading /tr if present (for localized URLs)
  if (reqPath.startsWith('/tr/')) {
    reqPath = reqPath.slice(3);
  } else if (reqPath === '/tr') {
    reqPath = '/';
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, reqPath);

  // If file doesn't exist, check if appending .html works (for clean URLs like /services, /works)
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404</title></head><body><h1>404 Not Found</h1><p>Aradığınız sayfa bulunamadı: ${reqPath}</p><p><a href="/">Ana Sayfa</a> | <a href="/services">Hizmetler</a> | <a href="/works">Çalışmalar</a></p></body></html>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error: ' + err.message);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 HSVO Design Web Sitesi Başlatıldı:`);
  console.log(`🔗 Yerel Önizleme: http://localhost:${PORT}`);
  console.log(`🔗 Hizmetler & Kategoriler: http://localhost:${PORT}/services`);
  console.log(`🔗 Çalışmalar: http://localhost:${PORT}/works`);
  console.log(`🔗 Stüdyo: http://localhost:${PORT}/studio`);
  console.log(`🔗 Ödüller: http://localhost:${PORT}/awards`);
  console.log(`🔗 İletişim: http://localhost:${PORT}/contact`);
  console.log(`======================================================`);
});
