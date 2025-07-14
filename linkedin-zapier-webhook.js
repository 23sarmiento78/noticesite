// Importamos la librería 'axios' para hacer solicitudes HTTP.
// Pipedream la instalará automáticamente si no está.
import axios from 'axios';

export default defineComponent({
  async run({ steps, $ }) {
    // --- ¡ATENCIÓN! CONFIGURACIÓN CRÍTICA: PEGA AQUÍ TU URL DE WEBHOOK DE ZAPIER ---
    // Reemplaza con tu URL personalizada de Zapier.
    const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/23769440/u2blqt5/"; 

    // --- Obtener datos del artículo del paso 'plantilla' (nombre estándar del flujo) ---
    // Si tu paso se llama diferente, ajusta 'steps.plantilla' por el nombre correcto.
    // También intentamos con 'code1' como fallback, igual que en twitter-publisher.js
    const articleTitle = steps.plantilla?.titulo_articulo_final || steps.code1?.titulo_articulo_final;
    const articleUrl = steps.plantilla?.article_final_url || steps.code1?.article_final_url;
    const articleDescription = steps.plantilla?.meta_description_final || steps.code1?.meta_description_final;
    const articleImageUrl = steps.plantilla?.article_image_url_final || steps.code1?.article_image_url_final;

    // Validación de datos mínimos
    if (!articleTitle || !articleUrl) {
      console.error("❌ Faltan datos críticos para la publicación en LinkedIn:", { articleTitle, articleUrl });
      $.flow.exit("Fallo: Título o URL del artículo no disponible.");
      return;
    }

    // --- Construir el payload para el webhook ---
    const payload = {
      title: articleTitle,
      url: articleUrl,
      description: articleDescription || "Descubre la última noticia de HGARUNA News.",
      imageUrl: articleImageUrl,
      source_name: "HGARUNA News",
      hashtags: "#NoticiasAI #HGARUNANews #Innovación #Noticias #Actualidad #Información #ÚltimaHora #NoticiasDelDía #Periodismo #Análisis #Reportaje",
    };

    console.log("DEBUG: Payload enviado al webhook de Zapier:", payload);

    // --- Enviar el webhook ---
    try {
      const response = await axios.post(ZAPIER_WEBHOOK_URL, payload);
      console.log("✅ Webhook enviado a Zapier con éxito. Respuesta:", response.data);
      $.export("webhook_status", response.status);
      $.export("webhook_response", response.data);
    } catch (error) {
      console.error("❌ Error al enviar el webhook a Zapier:", error.message);
      if (error.response) {
        console.error("Respuesta de error de Zapier:", error.response.status, error.response.data);
      }
      // Puedes decidir si quieres que el flujo falle aquí o continúe
      // $.flow.exit("Fallo al enviar el webhook a Zapier.");
    }
  },
}); 