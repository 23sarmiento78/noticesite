// Importamos las librerías necesarias
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

export default defineComponent({
  async run({ steps, $ }) {
    // --- CONFIGURACIÓN Y VALIDACIÓN DE CREDENCIALES ---
    const requiredEnvVars = {
      TWITTER_APP_KEY: process.env.TWITTER_APP_KEY,
      TWITTER_APP_SECRET: process.env.TWITTER_APP_SECRET,
      TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
      TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
    };

    // Validar que todas las credenciales estén presentes
    const missingCredentials = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingCredentials.length > 0) {
      console.error("❌ Credenciales de Twitter faltantes:", missingCredentials);
      $.flow.exit("Fallo: Credenciales de Twitter no configuradas.");
      return;
    }

    // Inicializar cliente de Twitter con manejo de errores
    let client;
    try {
      client = new TwitterApi({
        appKey: requiredEnvVars.TWITTER_APP_KEY,
        appSecret: requiredEnvVars.TWITTER_APP_SECRET,
        accessToken: requiredEnvVars.TWITTER_ACCESS_TOKEN,
        accessSecret: requiredEnvVars.TWITTER_ACCESS_SECRET,
      });

      // Verificar que las credenciales son válidas
      const me = await client.v2.me();
      console.log("✅ Cliente de Twitter inicializado correctamente para:", me.data.username);
    } catch (error) {
      console.error("❌ Error al inicializar cliente de Twitter:", error.message);
      $.flow.exit("Fallo: Credenciales de Twitter inválidas.");
      return;
    }

    // --- CONFIGURACIÓN DEL SITIO ---
    const NETLIFY_BASE_URL = "https://es.hgaruna.org";
    const ARTICLES_SUBFOLDER = "articulos/";

    // --- OBTENER Y VALIDAR DATOS DEL ARTÍCULO ---
    const articleData = {
      titulo: steps.plantilla?.titulo_articulo_final || steps.code1?.titulo_articulo_final,
      nombreArchivo: steps.plantilla?.file_name || steps.code1?.file_name,
      imagenUrl: steps.plantilla?.article_image_url_final || steps.code1?.article_image_url_final,
      metaDescription: steps.plantilla?.meta_description_final || steps.code1?.meta_description_final,
      urlFinal: steps.plantilla?.article_final_url || steps.code1?.article_final_url,
    };

    console.log("📋 Datos del artículo obtenidos:", {
      titulo: articleData.titulo,
      nombreArchivo: articleData.nombreArchivo,
      imagenUrl: articleData.imagenUrl,
      urlFinal: articleData.urlFinal
    });

    // Validaciones exhaustivas
    const validationErrors = [];
    if (!articleData.titulo || articleData.titulo.trim() === '') {
      validationErrors.push("Título del artículo vacío o undefined");
    }
    if (!articleData.nombreArchivo || articleData.nombreArchivo.trim() === '') {
      validationErrors.push("Nombre de archivo vacío o undefined");
    }

    if (validationErrors.length > 0) {
      console.error("❌ Errores de validación:", validationErrors);
      $.flow.exit("Fallo: Datos del artículo incompletos.");
      return;
    }

    // --- CONSTRUIR URL DEL ARTÍCULO ---
    let articleUrl;
    if (articleData.urlFinal) {
      articleUrl = articleData.urlFinal;
    } else {
      articleUrl = `${NETLIFY_BASE_URL}/${ARTICLES_SUBFOLDER}${articleData.nombreArchivo}`;
    }

    console.log("🔗 URL del artículo:", articleUrl);

    // --- FUNCIÓN MEJORADA PARA DESCARGAR Y SUBIR IMAGEN ---
    const uploadImageToTwitter = async (imageUrl) => {
      if (!imageUrl || imageUrl === 'https://placehold.co/800x450/cccccc/333333?text=Imagen+por+Defecto') {
        console.log("ℹ️ No hay imagen válida para subir a Twitter");
        return null;
      }

      try {
        console.log("📥 Descargando imagen de:", imageUrl);
        
        // Configurar timeout y headers para la descarga
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 segundos
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        // Validar que la respuesta sea una imagen
        const contentType = imageResponse.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          console.warn("⚠️ La URL no devuelve una imagen válida:", contentType);
          return null;
        }

        const imageBuffer = Buffer.from(imageResponse.data);
        
        // Validar tamaño de imagen (Twitter tiene límites)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageBuffer.length > maxSize) {
          console.warn("⚠️ Imagen demasiado grande para Twitter:", (imageBuffer.length / 1024 / 1024).toFixed(2) + "MB");
          return null;
        }

        console.log("📤 Subiendo imagen a Twitter...");
        const uploadResult = await client.v1.uploadMedia(imageBuffer, { 
          mimeType: contentType 
        });
        
        console.log("✅ Imagen subida exitosamente con Media ID:", uploadResult.media_id_string);
        return uploadResult.media_id_string;
      } catch (error) {
        console.error("❌ Error al procesar imagen:", error.message);
        return null;
      }
    };

    // --- FUNCIÓN PARA GENERAR TEXTO DEL TWEET ---
    const generateTweetText = (title, url, description = null) => {
      // Calcular longitud disponible considerando URL acortada
      const urlLength = 23; // Twitter acorta URLs a ~23 caracteres
      const hashtags = "\n\n#Noticias #IA #HGARUNANews #PeriodismoDigital";
      const hashtagsLength = hashtags.length;
      
      // Texto base del tweet
      const baseText = "¡Nueva noticia en HGARUNA News! 📰\n\n";
      const baseLength = baseText.length + urlLength + hashtagsLength;
      
      // Calcular espacio disponible para el título
      const maxTitleLength = 280 - baseLength - 10; // 10 caracteres de margen
      
      let displayTitle = title;
      if (title.length > maxTitleLength) {
        displayTitle = title.substring(0, maxTitleLength - 3) + "...";
      }

      // Construir tweet con descripción si hay espacio
      let tweetText = baseText + displayTitle;
      
      if (description && (tweetText.length + description.length + urlLength + hashtagsLength) < 280) {
        const shortDesc = description.length > 100 ? description.substring(0, 97) + "..." : description;
        tweetText += "\n\n" + shortDesc;
      }
      
      tweetText += "\n\nLee el artículo completo aquí: " + url + hashtags;
      
      return tweetText;
    };

    // --- PROCESO PRINCIPAL ---
    try {
      // 1. Subir imagen si está disponible
      const mediaId = await uploadImageToTwitter(articleData.imagenUrl);

      // 2. Generar texto del tweet
      const tweetText = generateTweetText(
        articleData.titulo, 
        articleUrl, 
        articleData.metaDescription
      );

      console.log("📝 Tweet a publicar:");
      console.log("Texto:", tweetText);
      console.log("Longitud:", tweetText.length);
      console.log("Media ID:", mediaId || "Sin imagen");

      // 3. Publicar tweet
      const tweetOptions = mediaId ? { media: { media_ids: [mediaId] } } : {};
      const { data: createdTweet } = await client.v2.tweet(tweetText, tweetOptions);

      console.log("✅ Tweet publicado exitosamente!");
      console.log("Tweet ID:", createdTweet.id);
      console.log("URL del tweet:", `https://twitter.com/user/status/${createdTweet.id}`);

      // 4. Exportar resultados
      $.export("tweet_id", createdTweet.id);
      $.export("tweet_text", createdTweet.text);
      $.export("tweet_url", `https://twitter.com/user/status/${createdTweet.id}`);
      $.export("article_url", articleUrl);
      $.export("published_at", new Date().toISOString());

      // 5. Log de éxito
      console.log("🎉 Publicación en Twitter completada exitosamente");
      
    } catch (error) {
      console.error("❌ Error durante la publicación:", error);
      
      // Intentar obtener más detalles del error
      if (error.data) {
        console.error("Detalles del error:", JSON.stringify(error.data, null, 2));
      }
      
      // No detener el flujo, solo reportar el error
      $.export("error", error.message);
      $.export("error_details", error.data || {});
    }
  },
}); 