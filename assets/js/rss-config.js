// Configuración de feeds RSS
const RSS_CONFIG = {
  // Feeds principales que funcionan bien
  feeds: [
    // BBC News (funciona bien con CORS)
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
    
    // El País España (usando proxy confiable)
    {
      id: 'elpais-portada',
      title: 'El País Portada',
      url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
      containerId: 'elpais-portada-container',
      fuente: 'El País',
      categoria: 'España'
    },
    {
      id: 'elpais-internacional',
      title: 'El País Internacional',
      url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/internacional',
      containerId: 'elpais-internacional-container',
      fuente: 'El País',
      categoria: 'Internacional'
    },
    {
      id: 'elpais-populares',
      title: 'El País Lo Más Visto',
      url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
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
    }
  ],

  // Configuración de proxies CORS
  proxies: [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
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