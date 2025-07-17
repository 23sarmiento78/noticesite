// auto-article-generator.js
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

// --- CONFIGURACIÓN ---
const RSS_FEED_URL = "https://www.clarin.com/rss/politica/";
const ARTICLES_DIR = path.join(__dirname, 'articulos');
const NETLIFY_BASE_URL = "https://news.hgaruna.org";

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
<<html lang="es">
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
    <style>
        :root {
            --primary-color: #1e40af;
            --secondary-color: #f59e0b;
            --accent-color: #3b82f6;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --border-radius: 20px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-gradient);
            color: var(--text-dark);
            line-height: 1.8;
            min-height: 100vh;
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
            z-index: -1;
        }

        .static-container {
            max-width: 1000px;
            margin: 40px auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 50px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
        }

        .static-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color), var(--primary-color));
        }

        .static-header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 40px;
            border-bottom: 2px solid rgba(245, 158, 11, 0.2);
            position: relative;
        }

        .static-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
        }

        .static-title {
            font-family: 'Playfair Display', serif;
            color: var(--primary-color);
            font-size: 3.2em;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            line-height: 1.2;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .static-subtitle {
            color: var(--text-light);
            font-size: 1.3em;
            font-weight: 400;
            font-style: italic;
            margin-bottom: 30px;
        }

        .static-badges {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .static-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, var(--secondary-color), #fbbf24);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9em;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            transition: var(--transition);
            border: none;
            cursor: pointer;
        }

        .static-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }

        .static-badge i {
            font-size: 1.1em;
        }

        .static-divider {
            border: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color), var(--primary-color));
            margin: 50px 0;
            border-radius: 2px;
            position: relative;
        }

        .static-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .static-content {
            position: relative;
        }

        .static-highlight {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(59, 130, 246, 0.1));
            padding: 30px;
            border-radius: 15px;
            border-left: 5px solid var(--secondary-color);
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }

        .static-highlight::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
        }

        .static-highlight h3 {
            color: var(--primary-color);
            font-family: 'Playfair Display', serif;
            font-size: 1.5em;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .static-highlight h3 i {
            color: var(--secondary-color);
            font-size: 1.2em;
        }

        .static-content h2 {
            font-family: 'Playfair Display', serif;
            color: var(--primary-color);
            border-bottom: 3px solid var(--secondary-color);
            padding-bottom: 15px;
            margin-top: 50px;
            font-size: 2.2em;
            font-weight: 600;
            position: relative;
        }

        .static-content h2::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 50px;
            height: 3px;
            background: var(--accent-color);
        }

        .static-content h3 {
            font-family: 'Playfair Display', serif;
            color: var(--accent-color);
            margin-top: 35px;
            font-size: 1.6em;
            font-weight: 600;
            position: relative;
            padding-left: 20px;
        }

        .static-content h3::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: var(--secondary-color);
            border-radius: 2px;
        }

        .static-content p {
            margin-bottom: 25px;
            text-align: justify;
            font-size: 1.1em;
            line-height: 1.9;
            color: var(--text-dark);
            position: relative;
            padding-left: 20px;
        }

        .static-content p::before {
            content: '';
            position: absolute;
            left: 0;
            top: 12px;
            width: 6px;
            height: 6px;
            background: var(--secondary-color);
            border-radius: 50%;
            opacity: 0.6;
        }

        .static-content ul, .static-content ol {
            margin: 25px 0;
            padding-left: 40px;
        }

        .static-content li {
            margin-bottom: 10px;
            line-height: 1.8;
            position: relative;
        }

        .static-content ul li::before {
            content: '•';
            color: var(--secondary-color);
            font-weight: bold;
            position: absolute;
            left: -20px;
        }

        .static-content blockquote {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(59, 130, 246, 0.05));
            border-left: 4px solid var(--secondary-color);
            padding: 25px;
            margin: 30px 0;
            border-radius: 0 10px 10px 0;
            font-style: italic;
            position: relative;
        }

        .static-content blockquote::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 4em;
            color: var(--secondary-color);
            opacity: 0.3;
            font-family: 'Playfair Display', serif;
        }

        .static-footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid rgba(245, 158, 11, 0.2);
            font-size: 1em;
            color: var(--text-light);
            position: relative;
        }

        .static-footer::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 2px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
        }

        .static-footer p {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .static-footer p i {
            color: var(--secondary-color);
        }

        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
            z-index: 1000;
            transition: width 0.3s ease;
        }

        .floating-share {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }

        .share-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
            color: white;
            font-size: 1.2em;
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .share-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .back-to-top {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            font-size: 1.2em;
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            opacity: 0;
            visibility: hidden;
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .back-to-top:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        /* Nuevo estilo para la imagen del artículo */
        .article-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            display: block; /* Para centrar si es necesario */
            margin-left: auto;
            margin-right: auto;
            border: 2px solid var(--accent-color);
        }

        @media (max-width: 768px) {
            .static-container {
                margin: 20px;
                padding: 30px;
            }
            .static-title {
                font-size: 2.4em;
            }
            .static-content h2 {
                font-size: 1.8em;
            }
            .static-content h3 {
                font-size: 1.4em;
            }
            .static-badges {
                flex-direction: column;
                align-items: center;
            }
            .floating-share {
                bottom: 20px;
                right: 20px;
            }
            .back-to-top {
                bottom: 20px;
                left: 20px;
            }
        }

        @media (max-width: 480px) {
            .static-container {
                margin: 10px;
                padding: 20px;
            }
            .static-title {
                font-size: 2em;
            }
            .static-content p {
                font-size: 1em;
                padding-left: 15px;
            }
        }

        /* Animaciones */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .static-container {
            animation: fadeInUp 0.8s ease-out;
        }

        .static-content > * {
            animation: fadeInUp 0.6s ease-out;
            animation-fill-mode: both;
        }

        .static-content > *:nth-child(1) { animation-delay: 0.1s; }
        .static-content > *:nth-child(2) { animation-delay: 0.2s; }
        .static-content > *:nth-child(3) { animation-delay: 0.3s; }
        .static-content > *:nth-child(4) { animation-delay: 0.4s; }
        .static-content > *:nth-child(5) { animation-delay: 0.5s; }
    </style>
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
