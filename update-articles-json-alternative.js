// Script alternativo para actualizar articulos-list.json
// Usa las variables del Twitter Publisher como respaldo
// Este script debe ejecutarse DESPUÉS de plantilla.html en tu flujo de Piper

import fs from 'fs';
import path from 'path';

export default defineComponent({
  async run({ steps, $ }) {
    console.log('🔄 Iniciando actualización del JSON de artículos (versión alternativa)...');
    
    // --- Obtener datos del artículo con múltiples fuentes ---
    // Primero intentar con plantilla, luego con code1, luego con variables del Twitter Publisher
    
    let articleTitle, articleUrl, articleDescription, articleImageUrl, fileName;
    
    // Intento 1: Variables de plantilla
    if (steps.plantilla) {
      articleTitle = steps.plantilla.titulo_articulo_final;
      articleUrl = steps.plantilla.article_final_url;
      articleDescription = steps.plantilla.meta_description_final;
      articleImageUrl = steps.plantilla.article_image_url_final;
      fileName = steps.plantilla.file_name;
      console.log('📋 Usando variables de plantilla');
    }
    
    // Intento 2: Variables de code1
    if (!articleTitle && steps.code1) {
      articleTitle = steps.code1.titulo_articulo_final;
      articleUrl = steps.code1.article_final_url;
      articleDescription = steps.code1.meta_description_final;
      articleImageUrl = steps.code1.article_image_url_final;
      fileName = steps.code1.file_name;
      console.log('📋 Usando variables de code1');
    }
    
    // Intento 3: Construir URL desde variables del Twitter Publisher
    if (!articleUrl && steps.code1?.file_name) {
      const NETLIFY_BASE_URL = "https://es.hgaruna.org";
      articleUrl = `${NETLIFY_BASE_URL}/articulos/${steps.code1.file_name}`;
      fileName = steps.code1.file_name;
      console.log('📋 Construyendo URL desde variables del Twitter Publisher');
    }
    
    console.log('📋 Datos del artículo obtenidos:', {
      title: articleTitle,
      url: articleUrl,
      fileName: fileName,
      hasImage: !!articleImageUrl,
      source: steps.plantilla ? 'plantilla' : steps.code1 ? 'code1' : 'unknown'
    });
    
    // Validación de datos mínimos
    if (!articleTitle || !articleUrl || !fileName) {
      console.error("❌ Faltan datos críticos para actualizar JSON:", { 
        articleTitle, 
        articleUrl, 
        fileName 
      });
      
      // Log de todos los pasos disponibles para debugging
      console.log('🔍 Pasos disponibles:', Object.keys(steps));
      if (steps.plantilla) {
        console.log('📄 Contenido de plantilla:', Object.keys(steps.plantilla));
      }
      if (steps.code1) {
        console.log('📄 Contenido de code1:', Object.keys(steps.code1));
      }
      
      $.flow.exit("Fallo: Datos del artículo incompletos para actualizar JSON.");
      return;
    }
    
    try {
      // --- Leer el JSON actual ---
      const jsonPath = './articulos-list.json';
      let currentData = { articles: [], lastUpdated: '', totalArticles: 0 };
      
      try {
        const existingContent = fs.readFileSync(jsonPath, 'utf8');
        currentData = JSON.parse(existingContent);
        console.log(`📄 JSON actual leído: ${currentData.articles.length} artículos existentes`);
      } catch (readError) {
        console.log('⚠️ No se pudo leer el JSON existente, creando uno nuevo...');
      }
      
      // --- Crear el nuevo artículo ---
      const newArticle = {
        fileName: fileName,
        title: articleTitle,
        description: articleDescription || "Artículo analizado y procesado por inteligencia artificial.",
        imageUrl: articleImageUrl || "https://placehold.co/800x450/667eea/ffffff?text=Artículo+IA",
        url: articleUrl,
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        isAI: true
      };
      
      console.log('📝 Nuevo artículo a agregar:', newArticle);
      
      // --- Verificar si el artículo ya existe ---
      const existingIndex = currentData.articles.findIndex(
        article => article.fileName === fileName
      );
      
      if (existingIndex !== -1) {
        // Actualizar artículo existente
        console.log('🔄 Actualizando artículo existente...');
        currentData.articles[existingIndex] = newArticle;
      } else {
        // Agregar nuevo artículo al inicio
        console.log('➕ Agregando nuevo artículo...');
        currentData.articles.unshift(newArticle);
      }
      
      // --- Ordenar por fecha (más recientes primero) ---
      currentData.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // --- Actualizar metadatos ---
      currentData.lastUpdated = new Date().toISOString();
      currentData.totalArticles = currentData.articles.length;
      
      // --- Escribir el JSON actualizado ---
      const updatedJson = JSON.stringify(currentData, null, 2);
      fs.writeFileSync(jsonPath, updatedJson, 'utf8');
      
      console.log(`✅ JSON actualizado exitosamente:`);
      console.log(`   - Total de artículos: ${currentData.totalArticles}`);
      console.log(`   - Última actualización: ${currentData.lastUpdated}`);
      console.log(`   - Nuevo artículo: ${newArticle.title}`);
      
      // --- Exportar datos para referencia ---
      $.export("json_updated", true);
      $.export("total_articles", currentData.totalArticles);
      $.export("new_article_title", newArticle.title);
      $.export("json_file_path", jsonPath);
      $.export("data_source", steps.plantilla ? 'plantilla' : 'code1');
      
      // --- Log del contenido actualizado ---
      console.log('📋 Contenido actual del JSON:');
      currentData.articles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} (${article.date})`);
      });
      
    } catch (error) {
      console.error('❌ Error actualizando JSON:', error.message);
      $.export("json_update_error", error.message);
      
      // No detener el flujo, solo reportar el error
      console.log('⚠️ Continuando con el flujo a pesar del error en JSON...');
    }
  },
}); 