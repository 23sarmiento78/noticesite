const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Cambia el nombre si tu archivo JSON tiene otro nombre
const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'indexing-service-account.json');

// Verificar que el archivo de credenciales existe
if (!fs.existsSync(KEYFILEPATH)) {
  console.error('❌ Error: No se encontró el archivo de credenciales en:', KEYFILEPATH);
  console.error('Verifica que la variable GOOGLE_APPLICATION_CREDENTIALS esté configurada correctamente.');
  process.exit(1);
}

console.log('✅ Archivo de credenciales encontrado en:', KEYFILEPATH);

// Dominio base de tu sitio
const BASE_URL = 'https://news.hgaruna.org/';

// Archivos importantes en la raíz (ajusta según tus necesidades)
const ROOT_FILES = [
  'index.html',
  'deportes.html',
  'tecnologia.html',
  'cultura.html',
  'autos.html',
  'contacto.html',
  'politica_derechos_autor.html',
  'politica_privacidad.html',
  // Puedes agregar más archivos importantes aquí
];

// Lista de archivos a omitir en la raíz (privados, plantillas, temporales, etc.)
const OMIT_ROOT = [
  'README.md', 'README.txt', 'plantilla.html', 'AI_ARTICLES_SETUP.md', 'GITHUB_ACTIONS_SETUP.md',
  'IMPLEMENTACION_JSON_AUTOMATICO.md', 'pipedream-flow-config.md', 'requirements.txt',
  'package.json', 'package-lock.json', 'webpack.config.js', 'sitemaps_todo.csv',
  'robots.txt', 'sitemap.xml', 'news-sitemap.xml', 'sistemapGNRAL.xml', 'update_sitemap_gnral.py',
  'update-articles-json.js', 'update-articles-json-alternative.js', 'update-json-local.js',
  'indexnow.js', 'rss-step.js', 'gemini-step.js', 'gorgojeo.js', 'server.js',
  'twitter-publisher.js', 'linkedin-zapier-webhook.js', 'instagramapi.js',
  'auto-article-generator.js', 'f19e638cbb894184b7144ebce7626e1b.txt', 'netlify.toml',
  '_footer.html', '_nav.html', '_redirects', 'main.css',
];

// Obtiene todos los archivos .html en la raíz, omitiendo los no importantes
const rootHtmlFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.html') && !OMIT_ROOT.includes(file));

// Junta los archivos importantes definidos y los detectados automáticamente (sin duplicados)
const rootUrls = Array.from(new Set([...ROOT_FILES, ...rootHtmlFiles]))
  .map(file => BASE_URL + file);

// Obtiene todas las URLs de la carpeta articulos/
const articulosDir = path.join(__dirname, 'articulos');
let articulosUrls = [];
if (fs.existsSync(articulosDir)) {
  articulosUrls = fs.readdirSync(articulosDir)
    .filter(file => file.endsWith('.html') && !file.startsWith('plantilla'))
    .map(file => BASE_URL + 'articulos/' + file);
}

// Junta todas las URLs
const URLS_TO_INDEX = [...rootUrls, ...articulosUrls];

console.log(`📋 Total de URLs a indexar: ${URLS_TO_INDEX.length}`);

async function indexUrl(url) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    console.log('🔐 Autenticando con Google...');
    const client = await auth.getClient();
    console.log('✅ Autenticación exitosa');
    
    const indexing = google.indexing({ version: 'v3', auth: client });

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    console.log('✅ URL enviada a Google:', url);
    // console.log(res.data); // Puedes descomentar para ver la respuesta completa
  } catch (err) {
    if (err.code === 401) {
      console.error('❌ Error de autenticación (401) para URL:', url);
      console.error('   - Verifica que la cuenta de servicio esté agregada en Search Console');
      console.error('   - Verifica que la API de Indexing esté habilitada en Google Cloud');
      console.error('   - Verifica que el archivo de credenciales sea válido');
      console.error('   Detalles:', err.message);
    } else {
      console.error('❌ Error al enviar la URL:', url, err.response?.data || err.message);
    }
  }
}

// Enviar todas las URLs del array
(async () => {
  console.log('🚀 Iniciando proceso de indexación...');
  for (const url of URLS_TO_INDEX) {
    await indexUrl(url);
    // Pequeña pausa entre requests para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('🏁 Proceso de indexación completado');
})();
