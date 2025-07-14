// Paso de Gemini AI para procesar el contenido del RSS
export default defineComponent({
  async run({ steps, $ }) {
    // --- CONFIGURACIÓN ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY no está configurada");
      $.flow.exit("Fallo: API Key de Gemini no configurada");
      return;
    }

    // --- OBTENER DATOS DEL PASO RSS ---
    const rssStep = steps.code2; // Asumiendo que el paso RSS se llama 'code2'
    
    if (!rssStep) {
      console.error("❌ No se encontró el paso RSS (code2)");
      $.flow.exit("Fallo: Paso RSS no encontrado");
      return;
    }

    const promptForGemini = rssStep.prompt_for_gemini;
    const articleContent = rssStep.article_content;
    const articleTitle = rssStep.article_title;
    const articleLink = rssStep.article_link;

    console.log("📋 Datos obtenidos del paso RSS:");
    console.log("- Título:", articleTitle);
    console.log("- Contenido (primeros 200 chars):", articleContent?.substring(0, 200));
    console.log("- Link:", articleLink);
    console.log("- Prompt disponible:", !!promptForGemini);

    // --- VALIDACIONES ---
    if (!promptForGemini) {
      console.error("❌ No se encontró el prompt para Gemini");
      $.flow.exit("Fallo: Prompt para Gemini no disponible");
      return;
    }

    if (!articleContent || articleContent.trim() === '') {
      console.error("❌ Contenido del artículo vacío");
      $.flow.exit("Fallo: Contenido del artículo vacío");
      return;
    }

    // --- CONFIGURAR GEMINI ---
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Configurar el modelo con parámetros optimizados
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
      },
    });

    try {
      console.log("🤖 Iniciando generación con Gemini...");
      
      // Generar contenido usando el prompt del paso RSS
      const result = await model.generateContent(promptForGemini);
      const response = await result.response;
      const generatedText = response.text();
      
      console.log("✅ Respuesta de Gemini obtenida");
      console.log("📝 Respuesta (primeros 500 chars):", generatedText.substring(0, 500));
      
      // Validar que la respuesta no esté vacía
      if (!generatedText || generatedText.trim() === '') {
        throw new Error("Respuesta de Gemini vacía");
      }

      // --- EXPORTAR RESULTADOS ---
      $.export("gemini_response", generatedText);
      $.export("gemini_response_length", generatedText.length);
      $.export("processed_at", new Date().toISOString());
      
      // También exportar los datos originales para referencia
      $.export("original_title", articleTitle);
      $.export("original_content", articleContent);
      $.export("original_link", articleLink);
      
      console.log("🎉 Paso de Gemini completado exitosamente");
      
    } catch (error) {
      console.error("❌ Error en Gemini:", error.message);
      
      // Crear una respuesta de fallback
      const fallbackResponse = JSON.stringify({
        titulo: articleTitle || "Artículo de Noticias",
        resumen: "Análisis de noticias actuales con información relevante y contextualizada.",
        slug: "articulo-noticias",
        keywords: ["noticias", "actualidad", "información", "análisis"],
        fuente: articleLink || "Fuente no disponible",
        articulo_completo: `<p>${articleContent || "Contenido no disponible."}</p><p>Este artículo ha sido procesado por nuestro sistema de inteligencia artificial para proporcionar información relevante y actualizada.</p>`
      });
      
      console.log("⚠️ Usando respuesta de fallback");
      $.export("gemini_response", fallbackResponse);
      $.export("gemini_response_length", fallbackResponse.length);
      $.export("error", error.message);
      $.export("processed_at", new Date().toISOString());
    }
  },
}); 