# Sistema de Artículos Generados por IA - HGARUNA News

## 🎯 Descripción

Este sistema permite mostrar automáticamente en la página principal todos los artículos HTML generados por Piper/Pipedream en la carpeta `/articulos/`. Los artículos se muestran como tarjetas modernas con funcionalidad de paginación y actualización automática.

## 🚀 Características

### ✅ Funcionalidades Implementadas

1. **Carga Dinámica**: Detecta automáticamente todos los archivos HTML en `/articulos/`
2. **Extracción de Metadatos**: Extrae título, descripción e imagen de cada artículo
3. **Tarjetas Modernas**: Diseño responsive con efectos hover y animaciones
4. **Paginación**: Muestra 6 artículos por página con botón "Ver más"
5. **Actualización Automática**: Verifica nuevos artículos cada 5 minutos
6. **Actualización Manual**: Botón para refrescar manualmente
7. **Ordenamiento**: Los artículos más recientes aparecen primero
8. **Responsive**: Funciona perfectamente en móviles y tablets

### 🎨 Diseño Visual

- **Tarjetas con gradientes** y efectos de sombra
- **Badge de IA** sobre cada imagen
- **Animaciones suaves** al cargar y hacer hover
- **Iconos de Bootstrap** para mejor UX
- **Colores consistentes** con el tema del sitio

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `assets/js/ai-articles-manager.js` - Manager principal
- `assets/js/ai-articles-auto-refresh.js` - Auto-refresh
- `assets/img/ai-article-default.jpg` - Imagen por defecto
- `AI_ARTICLES_SETUP.md` - Este archivo

### Archivos Modificados
- `index.html` - Agregado scripts y inicialización
- `main.css` - Agregados estilos para las tarjetas
- `linkedin-zapier-webhook.js` - Corregido nombre del paso

## 🔧 Configuración

### 1. Imagen por Defecto
Reemplaza `assets/img/ai-article-default.jpg` con una imagen real:
- **Dimensiones**: 800x450 píxeles (16:9)
- **Formato**: JPG, PNG o WebP
- **Tamaño**: Máximo 200KB
- **Contenido**: Imagen genérica de IA/tecnología

### 2. Estructura de Artículos
Los artículos deben estar en `/articulos/` con:
- **Formato**: HTML
- **Nombre**: `slug-fecha.html` (ej: `noticia-ejemplo-2024-06-14.html`)
- **Metadatos**: title, meta description, og:image

### 3. Flujo de Piper/Pipedream
Asegúrate de que tu flujo exporte:
- `titulo_articulo_final`
- `article_final_url`
- `meta_description_final`
- `article_image_url_final`

## 🎮 Uso

### Para Usuarios
1. **Ver artículos**: Se cargan automáticamente en la página principal
2. **Navegar**: Usa el botón "Ver más" para cargar más artículos
3. **Actualizar**: El botón "Actualizar" refresca la lista manualmente
4. **Leer**: Haz clic en "Leer Artículo" para abrir el contenido completo

### Para Desarrolladores
```javascript
// Acceder al manager
const manager = window.aiArticlesManager;

// Actualizar manualmente
await manager.refresh();

// Obtener artículos actuales
console.log(manager.articles);
```

## 🔄 Actualización Automática

### Cómo Funciona
1. **Cada 5 minutos** verifica si hay nuevos archivos en `/articulos/`
2. **Si encuentra nuevos** artículos, actualiza automáticamente
3. **Muestra notificación** de éxito o error
4. **Mantiene el estado** de paginación actual

### Configuración
```javascript
// Cambiar intervalo de actualización (en milisegundos)
this.refreshInterval = 5 * 60 * 1000; // 5 minutos
```

## 🎯 SEO y Rendimiento

### Optimizaciones Implementadas
- **Lazy loading** de imágenes
- **Metadatos extraídos** automáticamente
- **URLs amigables** para SEO
- **Carga asíncrona** sin bloquear la página
- **Caché inteligente** para evitar requests innecesarios

### Meta Tags Generados
- `title` - Título del artículo
- `meta description` - Descripción para SEO
- `og:image` - Imagen para redes sociales
- `og:title` - Título para redes sociales

## 🐛 Solución de Problemas

### Problema: No se cargan artículos
**Solución**: Verifica que:
- Los archivos estén en `/articulos/`
- Los archivos tengan extensión `.html`
- El servidor permita listar directorios

### Problema: Imágenes no se muestran
**Solución**: 
- Verifica que las URLs de imagen sean accesibles
- La imagen por defecto se usará como fallback

### Problema: No se actualizan automáticamente
**Solución**:
- Verifica la consola del navegador para errores
- El auto-refresh funciona cada 5 minutos
- Usa el botón manual si es necesario

### Problema: Errores en consola
**Solución**:
- Verifica que todos los scripts se carguen correctamente
- Asegúrate de que el orden de carga sea correcto
- Revisa que no haya conflictos con otros managers

## 📊 Monitoreo

### Logs en Consola
El sistema genera logs detallados:
```
🤖 Iniciando AIArticlesManager...
📂 Cargando artículos de IA...
📄 Encontrados 2 archivos HTML
✅ 2 artículos cargados exitosamente
🔄 Verificando nuevos artículos de IA...
```

### Métricas Disponibles
- Número total de artículos
- Artículos mostrados por página
- Tiempo de carga
- Errores de carga

## 🔮 Futuras Mejoras

### Posibles Extensiones
1. **Filtros por categoría** - Filtrar artículos por tema
2. **Búsqueda** - Buscar dentro de los artículos de IA
3. **Estadísticas** - Contador de lecturas, tiempo de lectura
4. **Comentarios** - Sistema de comentarios para artículos de IA
5. **Compartir** - Botones de compartir en redes sociales
6. **Modo oscuro** - Tema oscuro para las tarjetas

### Optimizaciones Técnicas
1. **Service Worker** - Cache offline de artículos
2. **WebSocket** - Actualizaciones en tiempo real
3. **IndexedDB** - Almacenamiento local de metadatos
4. **Compresión** - Optimización de imágenes automática

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la consola del navegador para errores
2. Verifica que todos los archivos estén en su lugar
3. Asegúrate de que el flujo de Piper funcione correctamente
4. Contacta al equipo de desarrollo si persisten los problemas

---

**¡El sistema está listo para usar!** 🎉
Los artículos generados por Piper aparecerán automáticamente en la página principal con un diseño moderno y funcionalidad completa. 