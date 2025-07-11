# 📄 Páginas Estáticas - HGARUNA News

## Propósito
Esta carpeta contiene las páginas HTML estáticas generadas automáticamente por Pipedream y Gemini.

## Estructura Esperada
```
static-pages/
├── README.md
├── analisis-noticias/
│   ├── 2025-01-07-analisis-mundial.html
│   ├── 2025-01-08-tendencias-tecnologia.html
│   └── ...
├── resumenes-diarios/
│   ├── 2025-01-07-resumen.html
│   ├── 2025-01-08-resumen.html
│   └── ...
└── reportes-especiales/
    ├── crisis-economica-2025.html
    ├── elecciones-2025.html
    └── ...
```

## Tipos de Páginas
- **Análisis de Noticias:** Análisis profundos generados por IA
- **Resúmenes Diarios:** Resúmenes automáticos de las noticias del día
- **Reportes Especiales:** Análisis de eventos importantes
- **Tendencias:** Análisis de tendencias y patrones

## Configuración Pipedream
- **Trigger:** RSS Feed (BBC World News, El País, etc.)
- **Procesamiento:** Gemini AI para análisis y generación de contenido
- **Output:** Páginas HTML estáticas con diseño consistente
- **Frecuencia:** Diaria o según eventos importantes

## Integración con el Sitio
Las páginas generadas se pueden:
1. Enlazar desde el menú principal
2. Mostrar en secciones especiales
3. Incluir en el sistema de búsqueda
4. Compartir en redes sociales

## Formato de Archivos
- **Nomenclatura:** `YYYY-MM-DD-tipo-contenido.html`
- **Encoding:** UTF-8
- **Diseño:** Consistente con el tema de HGARUNA News
- **SEO:** Optimizado para motores de búsqueda

## Mantenimiento
- Revisar regularmente la calidad del contenido generado
- Actualizar prompts de IA según sea necesario
- Monitorear el rendimiento y engagement
- Backup regular de páginas importantes 