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

} catch (error) {
  console.error('❌ Error al actualizar la lista de artículos:', error);
  process.exit(1);
} 