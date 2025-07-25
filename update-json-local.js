#!/usr/bin/env node

// Script local para actualizar articulos-list.json
// Ejecutar: node update-json-local.js

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando actualización de lista de artículos...');

// Leer archivos HTML de la carpeta articulos
const articulosDir = './articulos';

try {
  // Verificar si existe la carpeta
  if (!fs.existsSync(articulosDir)) {
    console.log('⚠️  La carpeta articulos no existe, creando...');
    fs.mkdirSync(articulosDir, { recursive: true });
  }

  const htmlFiles = fs.readdirSync(articulosDir)
    .filter(file => file.endsWith('.html'))
    .sort((a, b) => {
      // Ordenar por fecha (más recientes primero)
      const dateA = a.match(/(\d{4})-(\d{2})-(\d{2})/);
      const dateB = b.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateA && dateB) {
        return new Date(dateB[1], dateB[2]-1, dateB[3]) - new Date(dateA[1], dateA[2]-1, dateA[3]);
      }
      return b.localeCompare(a);
    });

  console.log(`📄 Archivos HTML encontrados: ${htmlFiles.length}`);
  console.log('📋 Archivos:', htmlFiles);

  // Crear array de artículos
  const articles = htmlFiles.map(fileName => {
    const filePath = path.join(articulosDir, fileName);
    let imageUrl = "https://placehold.co/800x450/667eea/ffffff?text=Artículo+IA";

    try {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      // Buscar og:image
      const ogImageMatch = htmlContent.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1];
      }
    } catch (e) {
      // Si hay error leyendo el archivo, se usa la imagen por defecto
    }

    const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
    const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : new Date().toISOString().split('T')[0];

    // Generar título desde el nombre del archivo
    const title = fileName
      .replace(/\.html$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return {
      fileName: fileName,
      title: title,
      description: "Artículo analizado y procesado por inteligencia artificial.",
      imageUrl: imageUrl,
      url: `/articulos/${fileName}`,
      date: date,
      isAI: true
    };
  });

  // Crear JSON actualizado
  const updatedJson = {
    articles: articles,
    lastUpdated: new Date().toISOString(),
    totalArticles: articles.length
  };

  // Escribir archivo JSON
  fs.writeFileSync('./articulos-list.json', JSON.stringify(updatedJson, null, 2));

  console.log(`✅ JSON actualizado con ${articles.length} artículos`);
  console.log('📋 Artículos:', articles.map(a => a.title));
  console.log('📁 Archivo guardado: articulos-list.json');

  // --- Generar sitemap XML ---
  const baseUrl = 'https://news.hgaruna.org';
  const mainPages = [
    'index.html',
    'deportes.html',
    'tecnologia.html',
    'cultura.html',
    'autos.html',
    'ultimo.html',
    'politica_derechos_autor.html',
    'politica_privacidad.html'
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Páginas principales
  mainPages.forEach(page => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/${page}</loc>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;
  });

  // Artículos
  articles.forEach(article => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/articulos/${article.fileName}</loc>\n`;
    sitemap += `    <lastmod>${article.date}</lastmod>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += `</urlset>\n`;

  // Escribir sitemap
  fs.writeFileSync('./sistemapGNRAL.xml', sitemap);
  console.log(`✅ Sitemap actualizado con ${articles.length} artículos y ${mainPages.length} páginas principales`);

  // --- Generar news-sitemap.xml para Google News y Bing News ---
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const newsArticles = articles.filter(article => {
    const pubDate = new Date(article.date);
    return now - pubDate <= TWO_DAYS_MS;
  });

  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  newsSitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  newsArticles.forEach(article => {
    // Extraer título real del HTML si es posible
    let realTitle = article.title;
    try {
      const htmlContent = fs.readFileSync(path.join(articulosDir, article.fileName), 'utf8');
      const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        realTitle = titleMatch[1];
      }
    } catch (e) {}
    // Fecha en formato ISO completo
    const pubDate = new Date(article.date);
    const pubDateIso = pubDate.toISOString();
    newsSitemap += `  <url>\n`;
    newsSitemap += `    <loc>${baseUrl}/articulos/${article.fileName}</loc>\n`;
    newsSitemap += `    <news:news>\n`;
    newsSitemap += `      <news:publication>\n`;
    newsSitemap += `        <news:name>HGARUNA News</news:name>\n`;
    newsSitemap += `        <news:language>es</news:language>\n`;
    newsSitemap += `      </news:publication>\n`;
    newsSitemap += `      <news:publication_date>${pubDateIso}</news:publication_date>\n`;
    newsSitemap += `      <news:title>${realTitle}</news:title>\n`;
    newsSitemap += `    </news:news>\n`;
    newsSitemap += `  </url>\n`;
  });

  newsSitemap += `</urlset>\n`;
  fs.writeFileSync('./news-sitemap.xml', newsSitemap);
  console.log(`✅ News sitemap generado con ${newsArticles.length} artículos recientes`);

} catch (error) {
  console.error('❌ Error al actualizar la lista de artículos:', error);
  process.exit(1);
} 