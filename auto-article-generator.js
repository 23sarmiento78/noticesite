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
  "titulo": "string",
  "resumen": "string",
  "slug": "string",
  "keywords": ["string", "string"],
  "fuente": "string",
  "articulo_completo": "string"
}

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
    articleData = JSON.parse(geminiResponse);
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
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').substring(0, 50) || 'articulo-generado-ia';
  };
  let articleSlug = articleData.slug || createSlug(articleData.titulo);
  const nombreArchivo = `${articleSlug}-${year}-${month}-${day}.html`;
  const finalArticleUrl = `${NETLIFY_BASE_URL}/articulos/${nombreArchivo}`;
  const metaTitle = articleData.titulo;
  const metaDescription = articleData.resumen;
  const metaKeywords = Array.isArray(articleData.keywords) ? articleData.keywords.join(', ') : '';
  const htmlFinal = `<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"UTF-8\">\n<title>${metaTitle}</title>\n<meta name=\"description\" content=\"${metaDescription}\">\n<meta name=\"keywords\" content=\"${metaKeywords}\">\n<meta property=\"og:title\" content=\"${metaTitle}\">\n<meta property=\"og:description\" content=\"${metaDescription}\">\n<meta property=\"og:image\" content=\"${articleImageUrl}\">\n<meta property=\"og:url\" content=\"${finalArticleUrl}\">\n<link rel=\"stylesheet\" href=\"../main.css\" />\n</head>\n<body>\n<h1>${metaTitle}</h1>\n<p>${metaDescription}</p>\n${articleImageUrl ? `<img src=\"${articleImageUrl}\" alt=\"${metaTitle}\" style=\"max-width:100%;margin-bottom:20px;\">` : ''}\n${articleData.articulo_completo}\n</body>\n</html>`;
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