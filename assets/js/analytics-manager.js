// Gestor de Analytics para mejorar SEO y tracking
class AnalyticsManager {
  constructor() {
    this.trackingId = 'G-XXXXXXXXXX'; // Reemplazar con tu ID de Google Analytics
    this.init();
  }

  init() {
    this.loadGoogleAnalytics();
    this.setupEventTracking();
    this.setupEnhancedEcommerce();
    this.setupCustomDimensions();
  }

  loadGoogleAnalytics() {
    // Cargar Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', this.trackingId, {
      'page_title': document.title,
      'page_location': window.location.href,
      'custom_map': {
        'dimension1': 'news_category',
        'dimension2': 'news_source',
        'dimension3': 'user_type'
      }
    });

    window.gtag = gtag;
  }

  setupEventTracking() {
    // Tracking de clicks en noticias
    document.addEventListener('click', (e) => {
      const newsCard = e.target.closest('.news-card');
      if (newsCard) {
        const link = newsCard.querySelector('a[target="_blank"]');
        if (link) {
          this.trackNewsClick(link);
        }
      }

      // Tracking de búsquedas
      const searchInput = e.target.closest('#buscador-global');
      if (searchInput) {
        this.trackSearch(searchInput.value);
      }

      // Tracking de navegación por categorías
      const categoryLink = e.target.closest('a[href*=".html"]');
      if (categoryLink) {
        this.trackCategoryNavigation(categoryLink);
      }
    });

    // Tracking de tiempo en página
    this.trackTimeOnPage();
    
    // Tracking de scroll
    this.trackScrollDepth();
  }

  trackNewsClick(link) {
    const newsData = this.extractNewsData(link);
    
    gtag('event', 'news_click', {
      'event_category': 'News',
      'event_label': newsData.category,
      'custom_parameter': {
        'news_title': newsData.title,
        'news_source': newsData.source,
        'news_category': newsData.category
      }
    });
  }

  trackSearch(query) {
    if (query && query.length > 2) {
      gtag('event', 'search', {
        'event_category': 'Search',
        'event_label': query,
        'search_term': query
      });
    }
  }

  trackCategoryNavigation(link) {
    const category = this.extractCategoryFromUrl(link.href);
    
    gtag('event', 'category_navigation', {
      'event_category': 'Navigation',
      'event_label': category,
      'custom_parameter': {
        'category': category,
        'page_type': 'category'
      }
    });
  }

  trackTimeOnPage() {
    let startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      gtag('event', 'time_on_page', {
        'event_category': 'Engagement',
        'event_label': 'Page View',
        'value': timeOnPage,
        'custom_parameter': {
          'time_seconds': timeOnPage,
          'page_url': window.location.href
        }
      });
    });
  }

  trackScrollDepth() {
    let maxScroll = 0;
    let scrollTrackingSent = false;
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Enviar eventos en puntos específicos
        if (scrollPercent >= 25 && maxScroll < 50) {
          this.sendScrollEvent(25);
        } else if (scrollPercent >= 50 && maxScroll < 75) {
          this.sendScrollEvent(50);
        } else if (scrollPercent >= 75 && maxScroll < 90) {
          this.sendScrollEvent(75);
        } else if (scrollPercent >= 90 && !scrollTrackingSent) {
          this.sendScrollEvent(90);
          scrollTrackingSent = true;
        }
      }
    });
  }

  sendScrollEvent(depth) {
    gtag('event', 'scroll_depth', {
      'event_category': 'Engagement',
      'event_label': `${depth}%`,
      'custom_parameter': {
        'scroll_depth': depth,
        'page_url': window.location.href
      }
    });
  }

  extractNewsData(link) {
    const card = link.closest('.news-card');
    const title = card?.querySelector('.news-headline')?.textContent || 'Sin título';
    const category = card?.querySelector('.category-badge')?.textContent || 'Noticias';
    const source = card?.querySelector('.source-badge')?.textContent || 'Fuente';
    
    return {
      title: title.trim(),
      category: category.trim(),
      source: source.trim()
    };
  }

  extractCategoryFromUrl(url) {
    const match = url.match(/\/([^\/]+)\.html/);
    return match ? match[1] : 'general';
  }

  setupEnhancedEcommerce() {
    // Configurar Enhanced Ecommerce para tracking de contenido
    gtag('config', this.trackingId, {
      'enhanced_ecommerce': true
    });
  }

  setupCustomDimensions() {
    // Configurar dimensiones personalizadas
    const userType = this.getUserType();
    const pageType = this.getPageType();
    
    gtag('config', this.trackingId, {
      'custom_map': {
        'dimension1': 'user_type',
        'dimension2': 'page_type',
        'dimension3': 'content_category'
      },
      'user_type': userType,
      'page_type': pageType,
      'content_category': this.getContentCategory()
    });
  }

  getUserType() {
    // Determinar tipo de usuario
    if (localStorage.getItem('returning_user')) {
      return 'returning';
    } else {
      localStorage.setItem('returning_user', 'true');
      return 'new';
    }
  }

  getPageType() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'home';
    if (path.includes('.html')) return 'category';
    return 'other';
  }

  getContentCategory() {
    const path = window.location.pathname;
    if (path.includes('deportes')) return 'sports';
    if (path.includes('tecnologia')) return 'technology';
    if (path.includes('cultura')) return 'culture';
    if (path.includes('autos')) return 'automotive';
    if (path.includes('ultimo')) return 'breaking_news';
    return 'general';
  }

  // Método para enviar datos de rendimiento
  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          gtag('event', 'performance', {
            'event_category': 'Performance',
            'event_label': 'Page Load',
            'custom_parameter': {
              'load_time': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              'dom_content_loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              'first_paint': Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0)
            }
          });
        }, 0);
      });
    }
  }

  // Método para tracking de errores
  trackErrors() {
    window.addEventListener('error', (e) => {
      gtag('event', 'error', {
        'event_category': 'Error',
        'event_label': e.message,
        'custom_parameter': {
          'error_message': e.message,
          'error_filename': e.filename,
          'error_lineno': e.lineno
        }
      });
    });
  }

  // Método para enviar datos de engagement
  trackEngagement() {
    // Tracking de tiempo de lectura
    let readingStartTime = Date.now();
    let isReading = false;
    
    document.addEventListener('scroll', () => {
      if (!isReading) {
        isReading = true;
        readingStartTime = Date.now();
      }
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isReading) {
        const readingTime = Math.round((Date.now() - readingStartTime) / 1000);
        
        gtag('event', 'reading_time', {
          'event_category': 'Engagement',
          'event_label': 'Content Reading',
          'value': readingTime,
          'custom_parameter': {
            'reading_time_seconds': readingTime,
            'page_url': window.location.href
          }
        });
        
        isReading = false;
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.analyticsManager = new AnalyticsManager();
}); 