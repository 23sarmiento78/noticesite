import Parser from 'rss-parser';
import axios from 'axios';

export default defineComponent({
  async run({ steps, $ }) {
    // URL del feed RSS de Clarín Política
    const RSS_FEED_URL = "https://www.clarin.com/rss/politica/";

    const parser = new Parser();
    let feed;
    let rawXmlContent = '';

    // --- 1. Descargar y parsear el feed RSS ---
    try {
      console.log("DEBUG: Descargando el feed RSS de:", RSS_FEED_URL);
      // Añadimos un encabezado User-Agent para evitar ser bloqueados
      const response = await axios.get(RSS_FEED_URL, {
        timeout: 15000, // 15 segundos de timeout
        headers: {
          'User-Agent': 'Pipedream RSS Reader/1.0 (+https://pipedream.com)'
        }
      });
      rawXmlContent = response.data;
      console.log("✅ Feed descargado con éxito (primeros 200 caracteres):", rawXmlContent.substring(0, 200));

      // Usamos parseString para manejar el XML directamente
      feed = await parser.parseString(rawXmlContent);
      console.log("✅ Feed RSS parseado con éxito.");
    } catch (error) {
      console.error("❌ Error al descargar o parsear el feed RSS:", error.message);
      // Proporcionamos más detalles del error si es de Axios
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error Axios:", error.response?.status, error.response?.data);
      }
      $.flow.exit(`Fallo al leer el feed RSS: ${error.message}`);
      return;
    }

    // --- 2. Verificar que el feed tiene elementos ---
    if (!feed || !feed.items || feed.items.length === 0) {
      console.log("❌ El feed RSS no tiene elementos o está vacío.");
      $.flow.exit("El feed RSS está vacío o no es válido.");
      return;
    }

    // Tomamos el primer artículo, que suele ser el más reciente.
    const latestArticle = feed.items[0];
    console.log("📰 Artículo más reciente encontrado:", latestArticle.title);

    // --- 3. MEJORADA: Búsqueda exhaustiva de imágenes ---
    let articleImageUrl = null;
    
    console.log("DEBUG: Buscando imagen en el artículo...");
    console.log("DEBUG: Estructura del artículo:", Object.keys(latestArticle));
    
    // Método 1: Buscar en media:content (formato Media RSS)
    if (latestArticle['media:content']) {
      if (Array.isArray(latestArticle['media:content'])) {
        // Si es un array, buscar el primer elemento con URL
        for (const media of latestArticle['media:content']) {
          if (media['$'] && media['$'].url) {
            articleImageUrl = media['$'].url;
            console.log("✅ Imagen encontrada en media:content (array):", articleImageUrl);
            break;
          }
        }
      } else if (latestArticle['media:content']['$'] && latestArticle['media:content']['$'].url) {
        // Si es un objeto directo
        articleImageUrl = latestArticle['media:content']['$'].url;
        console.log("✅ Imagen encontrada en media:content (objeto):", articleImageUrl);
      }
    }
    
    // Método 2: Buscar en media:thumbnail
    if (!articleImageUrl && latestArticle['media:thumbnail']) {
      if (Array.isArray(latestArticle['media:thumbnail'])) {
        for (const thumb of latestArticle['media:thumbnail']) {
          if (thumb['$'] && thumb['$'].url) {
            articleImageUrl = thumb['$'].url;
            console.log("✅ Imagen encontrada en media:thumbnail (array):", articleImageUrl);
            break;
          }
        }
      } else if (latestArticle['media:thumbnail']['$'] && latestArticle['media:thumbnail']['$'].url) {
        articleImageUrl = latestArticle['media:thumbnail']['$'].url;
        console.log("✅ Imagen encontrada en media:thumbnail (objeto):", articleImageUrl);
      }
    }
    
    // Método 3: Buscar en enclosure (formato RSS estándar)
    if (!articleImageUrl && latestArticle.enclosure) {
      if (Array.isArray(latestArticle.enclosure)) {
        // Si es un array, buscar el primer elemento de imagen
        for (const enc of latestArticle.enclosure) {
          if (enc.url && enc.type && enc.type.startsWith('image')) {
            articleImageUrl = enc.url;
            console.log("✅ Imagen encontrada en enclosure (array):", articleImageUrl);
            break;
          }
        }
      } else if (latestArticle.enclosure.url && latestArticle.enclosure.type && latestArticle.enclosure.type.startsWith('image')) {
        // Si es un objeto directo
        articleImageUrl = latestArticle.enclosure.url;
        console.log("✅ Imagen encontrada en enclosure (objeto):", articleImageUrl);
      }
    }
    
    // Método 4: Buscar en el contenido HTML usando regex
    if (!articleImageUrl) {
      const contentToSearchForImage = latestArticle.content || latestArticle.contentSnippet || latestArticle.description || '';
      console.log("DEBUG: Buscando imagen en contenido HTML (primeros 200 chars):", contentToSearchForImage.substring(0, 200));
      
      // Buscar etiquetas img
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
      const match = contentToSearchForImage.match(imgRegex);
      if (match && match[1]) {
        articleImageUrl = match[1];
        console.log("✅ Imagen encontrada mediante regex en contenido:", articleImageUrl);
      }
      
      // Si no se encontró con src, buscar con data-src (lazy loading)
      if (!articleImageUrl) {
        const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/i;
        const dataSrcMatch = contentToSearchForImage.match(dataSrcRegex);
        if (dataSrcMatch && dataSrcMatch[1]) {
          articleImageUrl = dataSrcMatch[1];
          console.log("✅ Imagen encontrada mediante regex en data-src:", articleImageUrl);
        }
      }
    }
    
    // Método 5: Buscar en campos específicos de diferentes fuentes
    if (!articleImageUrl) {
      // Para Clarín específicamente
      if (latestArticle['clarin:image']) {
        articleImageUrl = latestArticle['clarin:image'];
        console.log("✅ Imagen encontrada en clarin:image:", articleImageUrl);
      }
      // Para otros formatos
      else if (latestArticle.image) {
        articleImageUrl = latestArticle.image;
        console.log("✅ Imagen encontrada en campo image:", articleImageUrl);
      }
      else if (latestArticle.thumbnail) {
        articleImageUrl = latestArticle.thumbnail;
        console.log("✅ Imagen encontrada en campo thumbnail:", articleImageUrl);
      }
    }
    
    // Método 6: Intentar obtener imagen desde la URL del artículo
    if (!articleImageUrl && latestArticle.link) {
      try {
        console.log("DEBUG: Intentando obtener imagen desde la URL del artículo:", latestArticle.link);
        const articleResponse = await axios.get(latestArticle.link, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Pipedream RSS Reader/1.0 (+https://pipedream.com)'
          }
        });
        
        const articleHtml = articleResponse.data;
        // Buscar og:image meta tag
        const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i;
        const ogMatch = articleHtml.match(ogImageRegex);
        if (ogMatch && ogMatch[1]) {
          articleImageUrl = ogMatch[1];
          console.log("✅ Imagen encontrada en og:image meta tag:", articleImageUrl);
        }
        
        // Si no se encontró og:image, buscar la primera imagen del artículo
        if (!articleImageUrl) {
          const firstImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
          const firstImgMatch = articleHtml.match(firstImgRegex);
          if (firstImgMatch && firstImgMatch[1]) {
            articleImageUrl = firstImgMatch[1];
            console.log("✅ Primera imagen encontrada en el artículo:", articleImageUrl);
          }
        }
      } catch (error) {
        console.log("⚠️ No se pudo obtener imagen desde la URL del artículo:", error.message);
      }
    }

    // Si no se encontró ninguna imagen, usar fallback
    if (!articleImageUrl) {
      articleImageUrl = 'https://placehold.co/800x450/cccccc/333333?text=Imagen+No+Disponible';
      console.log("⚠️ No se encontró imagen. Usando imagen por defecto.");
    } else {
      console.log("✅ URL de imagen final:", articleImageUrl);
    }

    // --- 4. Extraer el contenido principal del artículo ---
    // Priorizamos content, luego contentSnippet, y finalmente description.
    let extractedArticleContent = latestArticle.content || latestArticle.contentSnippet || latestArticle.description || '';

    console.log("DEBUG: Longitud de 'content':", latestArticle.content?.length);
    console.log("DEBUG: Longitud de 'contentSnippet':", latestArticle.contentSnippet?.length);
    console.log("DEBUG: Longitud de 'description':", latestArticle.description?.length);
    console.log("DEBUG: Contenido extraído para el prompt (primeros 500 caracteres):", extractedArticleContent.substring(0, 500));

    // --- 5. Manejar contenido vacío (Fallback) ---
    if (extractedArticleContent.trim() === '') {
      console.warn("⚠️ El contenido del artículo está vacío. Usando un texto genérico de relleno.");
      extractedArticleContent = `
        Parece que el contenido principal del artículo no se pudo extraer del feed RSS.
        Este es un texto de relleno temporal para que el proceso de generación de IA pueda continuar.
        La política argentina continúa siendo un tema de gran relevancia nacional, con múltiples actores y perspectivas que influyen en el desarrollo del país.
        En este artículo analizamos las últimas noticias políticas, sus implicaciones y el impacto en la sociedad argentina.
        También exploramos las diferentes posturas y debates que surgen en torno a estos temas.
        La información política es fundamental para mantener una ciudadanía informada y participativa.
      `;
    }

    // --- 6. Exportar datos relevantes para pasos posteriores ---
    $.export("article_link", latestArticle.link || "https://www.clarin.com/");
    $.export("article_title", latestArticle.title || "Título no disponible");
    $.export("article_content", extractedArticleContent);
    // Exportamos la URL de la imagen, con un fallback genérico si no se encontró ninguna
    $.export("article_image_url", articleImageUrl);
    console.log("DEBUG: article_image_url exportado:", articleImageUrl);

    // --- 7. Generar el prompt para Gemini ---
    // Hemos mejorado el prompt para que pida explícitamente el campo 'articulo_completo'
    // que es el que se usa en code1.
    const prompt_for_gemini = `
Actúa como un redactor SEO profesional y experto en marketing de contenidos. Tu tarea es procesar el siguiente artículo y transformarlo en un formato JSON listo para ser publicado, optimizado para posicionamiento web y fácil integración.

El JSON DEBE contener las siguientes claves y seguir este formato EXACTAMENTE:

{
  "titulo": "string",          // Titulo principal del artículo. Debe ser atractivo, incluir palabras clave relevantes y no exceder los 70 caracteres.
  "resumen": "string",         // Descripción corta o subtítulo (meta-description). Debe ser una sinopsis concisa de 2 a 3 frases, optimizada para SEO (aprox. 150-160 caracteres).
  "slug": "string",            // Versión amigable para URL del título. Minúsculas, sin espacios (guiones en su lugar), sin caracteres especiales, longitud máxima 50 caracteres.
  "keywords": ["string", "string"], // Array de strings. Contiene entre 5 y 10 palabras clave y frases relevantes para el artículo, separadas por comas.
  "fuente": "string",          // URL o nombre de la fuente original del artículo.
  "articulo_completo": "string" // Contenido extenso del artículo. DEBE estar en formato HTML bien estructurado con etiquetas <p>, <h2>, <h3>, <ul>, <ol>, <blockquote>, etc. No incluyas <head>, <body>, <html> ni otros elementos de página completa. Solo el contenido del body. ASEGÚRATE DE QUE ESTE CAMPO SIEMPRE EXISTA Y CONTENGA EL TEXTO DEL ARTÍCULO.
}

Criterios adicionales para la generación:
- El 'titulo' debe ser llamativo y relevante al contenido original.
- El 'resumen' debe ser persuasivo y contener las principales palabras clave del artículo.
- Las 'keywords' deben ser una mezcla de palabras clave de cola corta y cola larga.
- El 'articulo_completo' debe ser una reescritura o expansión del contenido original si es posible, aportando valor adicional y con formato HTML semántico. Si el contenido original es muy corto, expande la información de manera coherente.
- Asegúrate de que el JSON resultante sea VÁLIDO y pueda ser parseado directamente.

Aquí está el contenido del artículo a procesar:
---
Título del Artículo Original: ${latestArticle.title || "Título no disponible"}
Contenido Original:
${extractedArticleContent}
Fuente Original: ${latestArticle.link || "https://www.clarin.com/"}
---

Por favor, genera SÓLO el objeto JSON. No añadas texto introductorio ni explicaciones fuera del JSON.
`;

    // Exportamos el prompt para ser utilizado por el siguiente paso (Gemini)
    $.export("prompt_for_gemini", prompt_for_gemini);
    console.log("DEBUG: prompt_for_gemini exportado (primeros 500 caracteres):", prompt_for_gemini.substring(0, 500));
  },
}); 