// auto-article-generator.js
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

// --- CONFIGURACIÓN ---
const RSS_FEED_URL = "https://www.clarin.com/rss/politica/";
const ARTICLES_DIR = path.join(__dirname, 'articulos');
const NETLIFY_BASE_URL = "https://es.hgaruna.org";

// --- CARGAR CLAVES DESDE VARIABLES DE ENTORNO ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TWITTER_APP_KEY = process.env.TWITTER_APP_KEY;
const TWITTER_APP_SECRET = process.env.TWITTER_APP_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

if (!GEMINI_API_KEY || !TWITTER_APP_KEY || !TWITTER_APP_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
  console.error('❌ Faltan variables de entorno para Gemini o Twitter.');
  process.exit(1);
}

(async () => {
  // --- 1. Descargar y parsear el feed RSS ---
  const parser = new Parser();
  let feed;
  let rawXmlContent = '';
  try {
    const response = await axios.get(RSS_FEED_URL, {
      timeout: 15000,
      headers: { 'User-Agent': 'GitHubActions RSS Reader/1.0' }
    });
    rawXmlContent = response.data;
    feed = await parser.parseString(rawXmlContent);
  } catch (error) {
    console.error('❌ Error al descargar o parsear el feed RSS:', error.message);
    process.exit(1);
  }
  if (!feed || !feed.items || feed.items.length === 0) {
    console.error('❌ El feed RSS está vacío o no es válido.');
    process.exit(1);
  }
  const latestArticle = feed.items[0];
  // --- Buscar imagen del artículo (igual que en tu código de Piper) ---
  let articleImageUrl = null;
  if (latestArticle['media:content']) {
    if (Array.isArray(latestArticle['media:content'])) {
      for (const media of latestArticle['media:content']) {
        if (media['$'] && media['$'].url) {
          articleImageUrl = media['$'].url;
          break;
        }
      }
    } else if (latestArticle['media:content']['$'] && latestArticle['media:content']['$'].url) {
      articleImageUrl = latestArticle['media:content']['$'].url;
    }
  }
  if (!articleImageUrl && latestArticle['media:thumbnail']) {
    if (Array.isArray(latestArticle['media:thumbnail'])) {
      for (const thumb of latestArticle['media:thumbnail']) {
        if (thumb['$'] && thumb['$'].url) {
          articleImageUrl = thumb['$'].url;
          break;
        }
      }
    } else if (latestArticle['media:thumbnail']['$'] && latestArticle['media:thumbnail']['$'].url) {
      articleImageUrl = latestArticle['media:thumbnail']['$'].url;
    }
  }
  if (!articleImageUrl && latestArticle.enclosure) {
    if (Array.isArray(latestArticle.enclosure)) {
      for (const enc of latestArticle.enclosure) {
        if (enc.url && enc.type && enc.type.startsWith('image')) {
          articleImageUrl = enc.url;
          break;
        }
      }
    } else if (latestArticle.enclosure.url && latestArticle.enclosure.type && latestArticle.enclosure.type.startsWith('image')) {
      articleImageUrl = latestArticle.enclosure.url;
    }
  }
  if (!articleImageUrl) {
    const contentToSearchForImage = latestArticle.content || latestArticle.contentSnippet || latestArticle.description || '';
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = contentToSearchForImage.match(imgRegex);
    if (match && match[1]) {
      articleImageUrl = match[1];
    }
    if (!articleImageUrl) {
      const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/i;
      const dataSrcMatch = contentToSearchForImage.match(dataSrcRegex);
      if (dataSrcMatch && dataSrcMatch[1]) {
        articleImageUrl = dataSrcMatch[1];
      }
    }
  }
  if (!articleImageUrl) {
    articleImageUrl = 'https://placehold.co/800x450/cccccc/333333?text=Imagen+No+Disponible';
  }
  // --- Extraer contenido principal ---
  let extractedArticleContent = latestArticle.content || latestArticle.contentSnippet || latestArticle.description || '';
  if (extractedArticleContent.trim() === '') {
    extractedArticleContent = 'Contenido no disponible.';
  }
  // --- Generar prompt para Gemini ---
  const prompt_for_gemini = `
Actúa como un redactor SEO profesional y experto en marketing de contenidos. Tu tarea es procesar el siguiente artículo y transformarlo en un formato JSON listo para ser publicado, optimizado para posicionamiento web y fácil integración.

El JSON DEBE contener las siguientes claves y seguir este formato EXACTAMENTE:
{
  "titulo": "string",          // Titulo principal del artículo. Debe ser atractivo, incluir palabras clave relevantes y no exceder los 70 caracteres.
  "resumen": "string",         // Descripción corta o subtítulo (meta-description). Debe ser una sinopsis concisa de 2 a 3 frases, optimizada para SEO (aprox. 150-160 caracteres).
  "slug": "string",            // Versión amigable para URL del título. Minúsculas, sin espacios (guiones en su lugar), sin caracteres especiales, longitud máxima 50 caracteres.
  "keywords": ["string", "string"], // Array de strings. Contiene entre 5 y 10 palabras clave y frases relevantes para el artículo, separadas por comas.
  "fuente": "string",          // URL o nombre de la fuente original del artículo.
  "articulo_completo": "string" // Contenido extenso del artículo. DEBE estar en formato HTML bien estructurado con etiquetas <p>, <h2>, <h3>, <ul>, <ol>, <blockquote>, etc. No incluyas <head>, <body>, <html> ni otros elementos de página completa. Solo el contenido del body. ASEGÚRATE DE QUE ESTE CAMPO SIEMPRE EXISTA Y CONTENGA EL TEXTO DEL ARTÍCULO. El artículo debe tener al menos 8000 palabras.
}

Criterios adicionales para la generación:
- El 'titulo' debe ser llamativo y relevante al contenido original.
- El 'resumen' debe ser persuasivo y contener las principales palabras clave del artículo.
- Las 'keywords' deben ser una mezcla de palabras clave de cola corta y cola larga.
- El 'articulo_completo' debe ser una reescritura o expansión del contenido original si es posible, aportando valor adicional y con formato HTML semántico. Si el contenido original es muy corto, expande la información de manera coherente.
- Asegúrate de que el JSON resultante sea VÁLIDO y pueda ser parseado directamente.
- El artículo debe tener al menos 8000 palabras.

Aquí está el contenido del artículo a procesar:
---
Título del Artículo Original: ${latestArticle.title || "Título no disponible"}
Contenido Original:
${extractedArticleContent}
Fuente Original: ${latestArticle.link || "https://www.clarin.com/"}
---

Por favor, genera SÓLO el objeto JSON. No añadas texto introductorio ni explicaciones fuera del JSON.
`;
  // --- 2. Llamar a Gemini API ---
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  let geminiResponse = null;
  try {
    const result = await model.generateContent(prompt_for_gemini);
    const response = await result.response;
    geminiResponse = response.text();
  } catch (error) {
    console.error('❌ Error en Gemini:', error.message);
    process.exit(1);
  }
  // --- 3. Parsear respuesta de Gemini ---
  let articleData = {};
  try {
    // Limpieza de bloques markdown si existen
    let cleanGeminiResponse = geminiResponse
      .replace(/```json\s*/gi, '') // quita ```json al inicio
      .replace(/```/g, '');         // quita ``` al final
    articleData = JSON.parse(cleanGeminiResponse);
  } catch (e) {
    console.error('❌ Error al parsear JSON de Gemini:', e.message);
    process.exit(1);
  }
  // --- 4. Construir HTML del artículo ---
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const createSlug = (text) => {
    if (!text || typeof text !== 'string') return 'articulo-generado-ia';
    const slug = text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .substring(0, 50);
    return slug || 'articulo-generado-ia';
  };
  let articleSlug = articleData.slug || createSlug(articleData.titulo);
  if (!articleSlug || articleSlug === 'articulo-generado-ia') {
    const fecha = new Date().toISOString().slice(0,10).replace(/-/g, '');
    articleSlug = `noticia-${fecha}`;
  }
  const nombreArchivo = `${articleSlug}-${year}-${month}-${day}.html`;
  const finalArticleUrl = `${NETLIFY_BASE_URL}/articulos/${nombreArchivo}`;
  const metaTitle = articleData.titulo;
  const metaDescription = articleData.resumen;
  const metaKeywords = Array.isArray(articleData.keywords) ? articleData.keywords.join(', ') : '';
  // Plantilla avanzada
  const htmlFinal = `
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTitle}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${metaKeywords}">
    <meta name="author" content="HGARUNA News">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${metaTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${finalArticleUrl}">
    <meta property="og:image" content="${articleImageUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metaTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${articleImageUrl}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="../main.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" />
    <style>/* ... (aquí va el CSS de la plantilla avanzada, igual que en tu ejemplo) ... */</style>
</head>
<body>
    <div class="reading-progress" id="readingProgress"></div>
    <div class="static-container">
        <div class="static-header">
            <h1 class="static-title">
                <i class="bi bi-newspaper"></i> ${metaTitle}
            </h1>
            <p class="static-subtitle">
                <i class="bi bi-calendar3"></i> ${hoy.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div class="static-badges">
                <span class="static-badge">
                    <i class="bi bi-robot"></i> Generado por IA
                </span>
                <span class="static-badge">
                    <i class="bi bi-clock"></i> ${hoy.toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span class="static-badge">
                    <i class="bi bi-eye"></i> Lectura Inteligente
                </span>
            </div>
        </div>
        ${articleImageUrl && articleImageUrl !== 'https://placehold.co/800x450/cccccc/333333?text=Imagen+No+Disponible' ? `<img src="${articleImageUrl}" alt="${metaTitle}" class="article-image">` : ''}
        <div class="static-divider"></div>
        <div class="static-content">
            <div class="static-highlight">
                <h3><i class="bi bi-lightbulb"></i> Análisis Inteligente</h3>
                <p>Este contenido ha sido analizado y procesado por inteligencia artificial para proporcionar insights relevantes y contextualizados. Nuestro sistema de IA garantiza la precisión y relevancia de la información presentada.</p>
            </div>
            <div class="article-body">
                ${articleData.articulo_completo}
            </div>
        </div>
        <div class="static-divider"></div>
        <div class="static-footer">
            <p>
                <i class="bi bi-gear-fill"></i> Generado automáticamente por IA con Gemini
            </p>
            <p>
                <i class="bi bi-shield-check"></i> HGARUNA News - Tu Periódico Digital Inteligente
            </p>
            <p>
                <i class="bi bi-heart"></i> Gracias por leer nuestro contenido
            </p>
        </div>
    </div>
    <div class="floating-share">
        <button class="share-btn" onclick="shareOnTwitter()" title="Compartir en Twitter">
            <i class="bi bi-twitter"></i>
        </button>
        <button class="share-btn" onclick="shareOnFacebook()" title="Compartir en Facebook">
            <i class="bi bi-facebook"></i>
        </button>
        <button class="share-btn" onclick="shareOnLinkedIn()" title="Compartir en LinkedIn">
            <i class="bi bi-linkedin"></i>
        </button>
    </div>
    <button class="back-to-top" id="backToTop" title="Volver arriba">
        <i class="bi bi-arrow-up"></i>
    </button>
    <script>/* ... (aquí va el JS de la plantilla avanzada, igual que en tu ejemplo) ... */</script>
</body>
</html>
  `;
  // --- 5. Guardar el archivo HTML en articulos/ ---
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }
  const filePath = path.join(ARTICLES_DIR, nombreArchivo);
  fs.writeFileSync(filePath, htmlFinal);
  console.log(`✅ Artículo guardado en: articulos/${nombreArchivo}`);
  // --- 6. Publicar en Twitter ---
  try {
    const client = new TwitterApi({
      appKey: TWITTER_APP_KEY,
      appSecret: TWITTER_APP_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET,
    });
    let mediaId = null;
    if (articleImageUrl && !articleImageUrl.includes('No+Disponible')) {
      try {
        const imageResponse = await axios.get(articleImageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);
        const uploadResult = await client.v1.uploadMedia(imageBuffer, { mimeType: imageResponse.headers['content-type'] });
        mediaId = uploadResult.media_id_string;
      } catch (e) {
        console.error('❌ Error al subir imagen a Twitter:', e.message);
      }
    }
    const tweetText = `¡Nueva noticia en HGARUNA News! 📰\n\n${metaTitle}\n\nLee el artículo completo aquí: ${finalArticleUrl}\n\n#Noticias #IA #HGARUNANews`;
    const tweetOptions = mediaId ? { media: { media_ids: [mediaId] } } : {};
    await client.v2.tweet(tweetText, tweetOptions);
    console.log('✅ Artículo publicado en Twitter');
  } catch (e) {
    console.error('❌ Error al publicar en Twitter:', e.message);
  }
})(); 