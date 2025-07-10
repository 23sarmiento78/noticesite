# Sistema RSS Mejorado - HGARUNA News

## Descripción

Este es un sistema RSS completamente reescrito desde cero para solucionar los problemas de CORS y mejorar la funcionalidad del sitio de noticias HGARUNA.

## Archivos del Sistema

### Archivos de Configuración
- `assets/js/rss-config.js` - Configuración central de feeds RSS
- `assets/js/rss-manager.js` - Sistema principal de manejo de RSS
- `assets/js/banner-manager.js` - Gestión del carrusel principal
- `assets/js/search-manager.js` - Sistema de búsqueda mejorado
- `assets/js/category-manager.js` - Gestión específica para páginas de categorías

### Características Principales

#### 1. Manejo Mejorado de CORS
- **Fetch directo** para feeds que lo permiten (BBC)
- **Sistema de proxies múltiples** como fallback
- **Retry automático** con backoff exponencial
- **Cache inteligente** para reducir requests

#### 2. Feeds Soportados
- **BBC News**: World, Technology, Sport
- **El País España**: Portada, Internacional, Lo Más Visto
- **Clarín Argentina**: Política, Internacional, Tecnología, Cultura, Autos, Deportes, Espectáculos, Cine

#### 3. Funcionalidades
- **Carrusel automático** con controles
- **Búsqueda en tiempo real** con debounce
- **Navegación por teclado** en resultados de búsqueda
- **Imágenes por defecto** de Unsplash
- **Contenido de fallback** cuando los feeds fallan

## Configuración

### RSS_CONFIG
```javascript
{
  feeds: [...],           // Array de feeds RSS
  proxies: [...],         // Lista de proxies CORS
  defaultImages: [...],   // Imágenes por defecto
  retryConfig: {...},     // Configuración de reintentos
  cacheConfig: {...}      // Configuración de cache
}
```

### Agregar un Nuevo Feed
1. Agregar el feed a `RSS_CONFIG.feeds` en `rss-config.js`
2. Definir el `containerId` que debe existir en el HTML
3. El sistema automáticamente lo cargará y renderizará

## Uso

### Página Principal (index.html)
- Carga todos los feeds configurados
- Muestra noticias destacadas
- Incluye carrusel automático

### Páginas de Categorías
- `deportes.html` - Solo feeds de deportes
- `tecnologia.html` - Solo feeds de tecnología
- `cultura.html` - Solo feeds de cultura
- `autos.html` - Solo feeds de autos
- `ultimo.html` - Solo feeds de noticias generales

### Búsqueda
- Búsqueda en tiempo real
- Navegación con flechas del teclado
- Resultados destacados con términos de búsqueda

## Estructura de Datos

### Feed Object
```javascript
{
  id: 'unique-id',
  title: 'Nombre del Feed',
  url: 'URL del RSS',
  containerId: 'id-del-contenedor-html',
  fuente: 'Nombre de la fuente',
  categoria: 'Categoría de noticias'
}
```

### News Item
```javascript
{
  title: 'Título de la noticia',
  description: 'Descripción de la noticia',
  link: 'URL de la noticia',
  pubDate: 'Fecha de publicación',
  enclosure: { url: 'URL de la imagen' }
}
```

## Manejo de Errores

### Estrategias de Fallback
1. **Fetch directo** → **Proxy 1** → **Proxy 2** → **Proxy 3**
2. **Contenido de ejemplo** si todos los métodos fallan
3. **Cache** para evitar requests repetidos
4. **Retry automático** con delays progresivos

### Logs
- ✅ Éxito: `✓ Cargado feed: [nombre] ([cantidad] noticias)`
- ⚠️ Advertencia: `⚠️ Fetch directo falló, usando proxy...`
- ❌ Error: `❌ Error cargando [nombre]: [error]`
- 🔄 Proceso: `🔄 Cargando [nombre] (intento [X]/[Y])`

## Optimizaciones

### Rendimiento
- **Lazy loading** de imágenes
- **Debounce** en búsqueda (300ms)
- **Cache** de 5 minutos
- **Batch loading** de feeds (3 por vez)

### UX
- **Loading states** para feedback visual
- **Contenido de fallback** inmediato
- **Navegación por teclado** completa
- **Responsive design** en todas las tarjetas

## Mantenimiento

### Agregar Nuevo Proxy
1. Agregar URL al array `proxies` en `rss-config.js`
2. El sistema automáticamente lo usará como fallback

### Cambiar Imágenes por Defecto
1. Modificar array `defaultImages` en `rss-config.js`
2. Usar URLs de Unsplash con parámetros de tamaño

### Modificar Cache
1. Ajustar `cacheConfig.duration` en `rss-config.js`
2. Deshabilitar con `cacheConfig.enabled: false`

## Troubleshooting

### Problemas Comunes
1. **CORS errors**: El sistema automáticamente usa proxies
2. **Feeds vacíos**: Se muestra contenido de ejemplo
3. **Imágenes rotas**: Se usan imágenes por defecto
4. **Búsqueda lenta**: Verificar debounce (300ms)

### Debug
- Abrir consola del navegador
- Buscar logs con emojis (🔄, ✓, ⚠️, ❌)
- Verificar que los `containerId` existan en el HTML

## Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **JavaScript**: ES6+ (requiere fetch API)
- **Bootstrap**: 5.3.3 