// Configuración de feeds RSS
const RSS_CONFIG = {
  // Feeds principales que funcionan bien
  feeds: [
    // BBC News
    {
      id: 'bbc-world',
      title: 'BBC World News',
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      containerId: 'bbc-mundo-container',
      fuente: 'BBC',
      categoria: 'Internacional'
    },
    {
      id: 'bbc-tech',
      title: 'BBC Technology',
      url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
      containerId: 'bbc-tech-container',
      fuente: 'BBC',
      categoria: 'Tecnología'
    },
    {
      id: 'bbc-sport',
      title: 'BBC Sport',
      url: 'https://feeds.bbci.co.uk/sport/rss.xml',
      containerId: 'bbc-sport-container',
      fuente: 'BBC',
      categoria: 'Deportes'
    },
    
    // El País España
    {
      id: 'elpais-portada',
      title: 'El País Portada',
      url: 'https://elpais.com/rss/elpais/portada.xml',
      containerId: 'elpais-portada-container',
      fuente: 'El País',
      categoria: 'España'
    },
    {
      id: 'elpais-internacional',
      title: 'El País Internacional',
      url: 'https://elpais.com/rss/internacional/portada.xml',
      containerId: 'elpais-internacional-container',
      fuente: 'El País',
      categoria: 'Internacional'
    },
    {
      id: 'elpais-populares',
      title: 'El País Lo Más Visto',
      url: 'https://elpais.com/rss/tags/noticias_mas_vistas.xml',
      containerId: 'elpais-populares-container',
      fuente: 'El País',
      categoria: 'Destacadas'
    },

    // Clarín Argentina (usando proxy)
    {
      id: 'clarin-politica',
      title: 'Clarín Política',
      url: 'https://www.clarin.com/rss/politica/',
      containerId: 'categoria5-news-container',
      fuente: 'Clarín',
      categoria: 'Política'
    },
    {
      id: 'clarin-internacional',
      title: 'Clarín Internacional',
      url: 'https://www.clarin.com/rss/mundo/',
      containerId: 'categoria7-news-container',
      fuente: 'Clarín',
      categoria: 'Internacional'
    },
    {
      id: 'clarin-tecnologia',
      title: 'Clarín Tecnología',
      url: 'https://www.clarin.com/rss/tecnologia/',
      containerId: 'tecnologia-news-container',
      fuente: 'Clarín',
      categoria: 'Tecnología'
    },
    {
      id: 'clarin-cultura',
      title: 'Clarín Cultura',
      url: 'https://www.clarin.com/rss/cultura/',
      containerId: 'categoria6-news-container',
      fuente: 'Clarín',
      categoria: 'Cultura'
    },
    {
      id: 'clarin-autos',
      title: 'Clarín Autos',
      url: 'https://www.clarin.com/rss/autos/',
      containerId: 'categoria8-news-container',
      fuente: 'Clarín',
      categoria: 'Autos'
    },
    {
      id: 'clarin-deportes',
      title: 'Clarín Deportes',
      url: 'https://www.clarin.com/rss/deportes/',
      containerId: 'categoria3-news-container',
      fuente: 'Clarín',
      categoria: 'Deportes'
    },
    {
      id: 'clarin-espectaculos',
      title: 'Clarín Espectáculos',
      url: 'https://www.clarin.com/rss/espectaculos/',
      containerId: 'categoria1-news-container',
      fuente: 'Clarín',
      categoria: 'Espectáculos'
    },
    {
      id: 'clarin-cine',
      title: 'Clarín Cine',
      url: 'https://www.clarin.com/rss/espectaculos/cine/',
      containerId: 'categoria2-news-container',
      fuente: 'Clarín',
      categoria: 'Cine'
    },
    {
      id: 'clarin-tecnologia-alt',
      title: 'Clarín Tecnología (Alternativo)',
      url: 'https://www.clarin.com/rss/tecnologia/',
      containerId: 'categoria4-news-container',
      fuente: 'Clarín',
      categoria: 'Tecnología'
    },

    // La Nación Colombia
    {
      id: 'lanacion-general',
      title: 'La Nación Colombia',
      url: 'https://lanacion.com.co/feed',
      containerId: 'lanacion-container',
      fuente: 'La Nación',
      categoria: 'Colombia'
    },

    // El Tiempo Colombia - Secciones principales
    {
      id: 'eltiempo-colombia',
      title: 'El Tiempo Colombia',
      url: 'https://www.eltiempo.com/rss/colombia.xml',
      containerId: 'eltiempo-container',
      fuente: 'El Tiempo',
      categoria: 'Colombia'
    },
    {
      id: 'eltiempo-bogota',
      title: 'El Tiempo Bogotá',
      url: 'https://www.eltiempo.com/rss/bogota.xml',
      containerId: 'eltiempo-bogota-container',
      fuente: 'El Tiempo',
      categoria: 'Bogotá'
    },
    {
      id: 'eltiempo-medellin',
      title: 'El Tiempo Medellín',
      url: 'https://www.eltiempo.com/rss/colombia_medellin.xml',
      containerId: 'eltiempo-medellin-container',
      fuente: 'El Tiempo',
      categoria: 'Medellín'
    },
    {
      id: 'eltiempo-cali',
      title: 'El Tiempo Cali',
      url: 'https://www.eltiempo.com/rss/colombia_cali.xml',
      containerId: 'eltiempo-cali-container',
      fuente: 'El Tiempo',
      categoria: 'Cali'
    },
    {
      id: 'eltiempo-barranquilla',
      title: 'El Tiempo Barranquilla',
      url: 'https://www.eltiempo.com/rss/colombia_barranquilla.xml',
      containerId: 'eltiempo-barranquilla-container',
      fuente: 'El Tiempo',
      categoria: 'Barranquilla'
    },
    {
      id: 'eltiempo-mundo',
      title: 'El Tiempo Mundo',
      url: 'https://www.eltiempo.com/rss/mundo.xml',
      containerId: 'eltiempo-mundo-container',
      fuente: 'El Tiempo',
      categoria: 'Internacional'
    },
    {
      id: 'eltiempo-latinoamerica',
      title: 'El Tiempo Latinoamérica',
      url: 'https://www.eltiempo.com/rss/mundo_latinoamerica.xml',
      containerId: 'eltiempo-latinoamerica-container',
      fuente: 'El Tiempo',
      categoria: 'Latinoamérica'
    },
    {
      id: 'eltiempo-tecnosfera',
      title: 'El Tiempo Tecnósfera',
      url: 'https://www.eltiempo.com/rss/tecnosfera.xml',
      containerId: 'eltiempo-tecnosfera-container',
      fuente: 'El Tiempo',
      categoria: 'Tecnología'
    },
    {
      id: 'eltiempo-economia',
      title: 'El Tiempo Economía',
      url: 'https://www.eltiempo.com/rss/economia.xml',
      containerId: 'eltiempo-economia-container',
      fuente: 'El Tiempo',
      categoria: 'Economía'
    },
    {
      id: 'eltiempo-cultura',
      title: 'El Tiempo Cultura',
      url: 'https://www.eltiempo.com/rss/cultura.xml',
      containerId: 'eltiempo-cultura-container',
      fuente: 'El Tiempo',
      categoria: 'Cultura'
    },
    {
      id: 'eltiempo-entretenimiento',
      title: 'El Tiempo Entretenimiento',
      url: 'https://www.eltiempo.com/rss/cultura_entretenimiento.xml',
      containerId: 'eltiempo-entretenimiento-container',
      fuente: 'El Tiempo',
      categoria: 'Entretenimiento'
    },
    {
      id: 'clarin-viajes',
      title: 'Clarín Viajes',
      url: 'https://www.clarin.com/rss/viajes/',
      containerId: 'categoria9-news-container',
      fuente: 'Clarín',
      categoria: 'Viajes'
    }
  ],

  // Configuración de proxies CORS
  proxies: [
    'https://api.allorigins.win/get?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ],

  // Configuración de imágenes por defecto
  defaultImages: [
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop'
  ],

  // Configuración de retry
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  },

  // Configuración de cache
  cacheConfig: {
    enabled: true,
    duration: 5 * 60 * 1000 // 5 minutos
  }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RSS_CONFIG;
} 