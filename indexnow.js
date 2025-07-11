const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const INDEXNOW_API = 'https://api.indexnow.org/indexnow';
const KEY = 'f19e638cbb894184b7144ebce7626e1b';
const HOST = 'es.hgaruna.org';

function extractUrlsFromSitemap(xmlPath) {
  try {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    // Extrae <loc>URL</loc>
    const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
    return urls;
  } catch (err) {
    console.error(`[IndexNow] Error leyendo ${xmlPath}:`, err);
    return [];
  }
}

async function sendToIndexNow(urls) {
  if (!urls || !urls.length) {
    console.log('[IndexNow] No hay URLs para enviar.');
    return;
  }
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls
  };
  try {
    const res = await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      console.log(`[IndexNow] URLs enviadas correctamente (${urls.length}):`, urls);
    } else {
      const text = await res.text();
      console.error(`[IndexNow] Error al enviar URLs: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error('[IndexNow] Error de red:', err);
  }
}

// --- MAIN: Leer ambos sitemaps y enviar URLs ---
const sitemapFiles = ['sitemap.xml', 'sistemapGNRAL.xml'];
let allUrls = [];
for (const file of sitemapFiles) {
  const absPath = path.resolve(__dirname, file);
  const urls = extractUrlsFromSitemap(absPath);
  allUrls = allUrls.concat(urls);
}
// Eliminar duplicados
allUrls = Array.from(new Set(allUrls));

sendToIndexNow(allUrls); 