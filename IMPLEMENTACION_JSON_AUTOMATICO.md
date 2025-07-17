# 🚀 Implementación: JSON Automático para Artículos de IA

## 📋 **¿Qué hace este sistema?**

Actualiza automáticamente el archivo `articulos-list.json` cada vez que Piper genera un nuevo artículo, usando las mismas variables que ya tienes en tu flujo.

## 🔧 **Cómo implementarlo en tu flujo de Piper**

### **Paso 1: Agregar el script a tu flujo**

1. **En tu flujo de Piper**, agrega un **nuevo paso** después de `plantilla.html`
2. **Copia el código** de `update-articles-json.js` o `update-articles-json-alternative.js`
3. **Pega el código** en el nuevo paso de Piper

### **Paso 2: Orden del flujo**

Tu flujo debería quedar así:
```
1. code2 (RSS) → 
2. gemini_step (IA) → 
3. plantilla (HTML) → 
4. [NUEVO] update-articles-json → 
5. linkedin-zapier-webhook → 
6. twitter-publisher
```

### **Paso 3: Variables que usa el script**

El script usa las mismas variables que tu webhook de LinkedIn:

```javascript
// Variables principales (de plantilla o code1)
const articleTitle = steps.plantilla?.titulo_articulo_final || steps.code1?.titulo_articulo_final;
const articleUrl = steps.plantilla?.article_final_url || steps.code1?.article_final_url;
const articleDescription = steps.plantilla?.meta_description_final || steps.code1?.meta_description_final;
const articleImageUrl = steps.plantilla?.article_image_url_final || steps.code1?.article_image_url_final;
const fileName = steps.plantilla?.file_name || steps.code1?.file_name;
```

## 🎯 **¿Cuál script usar?**

### **Opción A: `update-articles-json.js`** (Recomendado)
- Usa las variables de `plantilla` o `code1`
- Más simple y directo
- Funciona con tu flujo actual

### **Opción B: `update-articles-json-alternative.js`** (Respaldo)
- Usa múltiples fuentes de variables
- Incluye debugging detallado
- Útil si hay problemas con las variables

## 📊 **Qué hace el script**

1. **Lee** el `articulos-list.json` actual
2. **Obtiene** los datos del nuevo artículo del paso anterior
3. **Agrega** el nuevo artículo al JSON
4. **Ordena** por fecha (más recientes primero)
5. **Actualiza** metadatos (total, última actualización)
6. **Guarda** el JSON actualizado

## 🔍 **Logs que verás en Piper**

```
🔄 Iniciando actualización del JSON de artículos...
📋 Datos del artículo obtenidos: { title: "...", url: "...", fileName: "..." }
📄 JSON actual leído: 2 artículos existentes
📝 Nuevo artículo a agregar: { fileName: "...", title: "...", ... }
➕ Agregando nuevo artículo...
✅ JSON actualizado exitosamente:
   - Total de artículos: 3
   - Última actualización: 2024-06-14T12:00:00Z
   - Nuevo artículo: Título del Artículo
📋 Contenido actual del JSON:
   1. Nuevo Artículo (2024-06-14)
   2. Artículo Anterior (2024-06-13)
   3. Artículo Más Antiguo (2024-06-12)
```

## 🎯 **Resultado final**

### **Antes del script:**
```json
{
  "articles": [
    {
      "fileName": "articulo-1.html",
      "title": "Artículo 1",
      // ...
    }
  ],
  "totalArticles": 1
}
```

### **Después del script:**
```json
{
  "articles": [
    {
      "fileName": "nuevo-articulo-2024-06-14.html",
      "title": "Nuevo Artículo Generado por IA",
      "description": "Descripción del nuevo artículo...",
      "imageUrl": "https://...",
      "url": "https://news.hgaruna.org/articulos/nuevo-articulo-2024-06-14.html",
      "date": "2024-06-14",
      "isAI": true
    },
    {
      "fileName": "articulo-1.html",
      "title": "Artículo 1",
      // ...
    }
  ],
  "lastUpdated": "2024-06-14T12:00:00Z",
  "totalArticles": 2
}
```

## 🌐 **Funcionamiento en Netlify**

1. **Piper genera** un nuevo artículo HTML
2. **El script actualiza** `articulos-list.json`
3. **Netlify se despliega** automáticamente
4. **La página principal** carga el JSON actualizado
5. **El nuevo artículo aparece** en las tarjetas de IA

## 🛠️ **Solución de problemas**

### **Problema: "Faltan datos críticos"**
**Solución**: Verifica que el paso anterior exporte:
- `titulo_articulo_final`
- `article_final_url`
- `file_name`

### **Problema: "No se pudo leer el JSON"**
**Solución**: El script creará un nuevo JSON automáticamente

### **Problema: Variables undefined**
**Solución**: Usa `update-articles-json-alternative.js` que tiene mejor debugging

## 📝 **Variables exportadas por el script**

```javascript
$.export("json_updated", true);           // Confirmación de actualización
$.export("total_articles", 3);            // Total de artículos
$.export("new_article_title", "...");     // Título del nuevo artículo
$.export("json_file_path", "./articulos-list.json"); // Ruta del archivo
$.export("data_source", "plantilla");     // Fuente de datos usada
```

## 🎉 **¡Listo para usar!**

Una vez implementado:
- **Cada nuevo artículo** se agregará automáticamente al JSON
- **La página principal** mostrará todos los artículos actualizados
- **Funciona tanto en local como en Netlify**
- **No necesitas actualizar manualmente** nada

**¡El sistema está completo y automático!** 🚀 