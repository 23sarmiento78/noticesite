# Configuración del Flujo de Pipedream para HGARUNA News

## Estructura del Flujo

El flujo debe tener los siguientes pasos en orden:

### 1. **code2** - Paso RSS (rss-step.js)
- **Función**: Descarga y parsea el feed RSS de Clarín
- **Exporta**: 
  - `prompt_for_gemini` - Prompt estructurado para Gemini
  - `article_content` - Contenido extraído del RSS
  - `article_title` - Título del artículo
  - `article_link` - URL del artículo original
  - `article_image_url` - URL de la imagen del artículo

### 2. **gemini_step** - Paso Gemini AI (gemini-step.js)
- **Función**: Procesa el contenido con Gemini AI usando el prompt del paso RSS
- **Exporta**:
  - `gemini_response` - Respuesta JSON de Gemini
  - `gemini_response_length` - Longitud de la respuesta
  - `processed_at` - Timestamp de procesamiento

### 3. **plantilla** - Generación HTML (plantilla.html)
- **Función**: Genera el archivo HTML final del artículo
- **Exporta**:
  - `html_content` - HTML completo del artículo
  - `file_name` - Nombre del archivo generado
  - `article_final_url` - URL final del artículo
  - `titulo_articulo_final` - Título final
  - `meta_description_final` - Meta descripción
  - `article_image_url_final` - URL de la imagen

### 4. **twitter_publisher** - Publicación en Twitter (twitter-publisher.js)
- **Función**: Publica el artículo en Twitter
- **Exporta**:
  - `tweet_id` - ID del tweet publicado
  - `tweet_text` - Texto del tweet
  - `tweet_url` - URL del tweet

## Variables de Entorno Requeridas

### Para Gemini AI:
```
GEMINI_API_KEY=tu_api_key_de_gemini
```

### Para Twitter:
```
TWITTER_APP_KEY=tu_app_key_de_twitter
TWITTER_APP_SECRET=tu_app_secret_de_twitter
TWITTER_ACCESS_TOKEN=tu_access_token_de_twitter
TWITTER_ACCESS_SECRET=tu_access_secret_de_twitter
```

## Configuración de Netlify

### Archivo `_redirects`:
```
/articulos/* /articulos/:splat 200
```

### Archivo `netlify.toml`:
```toml
[[redirects]]
  from = "/articulos/*"
  to = "/articulos/:splat"
  status = 200
  force = true
```

## Solución de Problemas

### Problema: Contenido muestra "[object Object]"
**Causa**: El contenido no se está procesando correctamente como string
**Solución**: Usar el paso `gemini_step` en lugar de `generate_content_from_text`

### Problema: Nombre de archivo incorrecto
**Causa**: El slug no se está generando correctamente
**Solución**: Verificar que Gemini genere un slug válido en el campo `slug`

### Problema: Imagen no se muestra
**Causa**: La URL de la imagen no es accesible o no se extrajo correctamente
**Solución**: Verificar los logs del paso RSS para la extracción de imágenes

### Problema: Tweet no se publica
**Causa**: Credenciales de Twitter incorrectas o API rate limit
**Solución**: Verificar credenciales y logs de error

## Logs de Depuración

Cada paso incluye logs detallados para debugging:

- **RSS Step**: Muestra contenido extraído y URLs de imágenes
- **Gemini Step**: Muestra prompt y respuesta de Gemini
- **Plantilla Step**: Muestra datos procesados y HTML generado
- **Twitter Step**: Muestra texto del tweet y resultado de publicación

## Flujo de Datos

```
RSS Feed → code2 (RSS) → gemini_step (AI) → plantilla (HTML) → twitter_publisher (Social)
```

Cada paso toma los datos exportados del paso anterior y los procesa para el siguiente. 