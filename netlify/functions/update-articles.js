// Netlify Function para actualizar automáticamente articulos-list.json
// Se ejecuta cuando se detecta un nuevo archivo HTML

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    console.log('🔄 Función de actualización de artículos ejecutada');
    
    // Verificar si es un evento de build
    if (event.body) {
      const body = JSON.parse(event.body);
      console.log('📋 Evento recibido:', body);
      
      // Verificar si hay nuevos archivos HTML
      const hasNewHtml = body.files && body.files.some(file => 
        file.includes('articulos/') && file.endsWith('.html')
      );
      
      if (!hasNewHtml) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'No hay nuevos archivos HTML' })
        };
      }
    }
    
    // Leer archivos HTML de la carpeta articulos
    const articulosDir = path.join(process.cwd(), 'articulos');
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
    
    console.log('📄 Archivos HTML encontrados:', htmlFiles);
    
    // Crear array de artículos
    const articles = htmlFiles.map(fileName => {
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
        imageUrl: "https://placehold.co/800x450/667eea/ffffff?text=Artículo+IA",
        url: `https://news.hgaruna.org/articulos/${fileName}`,
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
    const jsonPath = path.join(process.cwd(), 'articulos-list.json');
    fs.writeFileSync(jsonPath, JSON.stringify(updatedJson, null, 2));
    
    console.log(`✅ JSON actualizado con ${articles.length} artículos`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'JSON actualizado exitosamente',
        articlesCount: articles.length,
        lastUpdated: updatedJson.lastUpdated
      })
    };
    
  } catch (error) {
    console.error('❌ Error actualizando JSON:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error actualizando JSON',
        message: error.message
      })
    };
  }
}; 