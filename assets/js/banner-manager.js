// Sistema de banner profesional para periódico digital
class BannerManager {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.autoPlayInterval = null;
    this.isLoading = true;
    this.init();
  }

  async init() {
    console.log('🎬 Iniciando Banner Manager Profesional...');
    this.renderPlaceholderBanner();
    try {
      await this.loadBannerContent();
      this.startAutoPlay();
      this.setupControls();
      this.isLoading = false;
    } catch (error) {
      console.error('Error en Banner Manager:', error);
      this.loadFallbackBanner();
      this.startAutoPlay();
      this.setupControls();
      this.isLoading = false;
    }
  }

  renderPlaceholderBanner() {
    const container = document.getElementById('carousel-inner-news');
    if (!container) return;

    container.innerHTML = `
      <div class="banner-placeholder">
        <div class="banner-skeleton-content">
          <div class="skeleton-image"></div>
          <div class="skeleton-text">
            <div class="skeleton-title"></div>
            <div class="skeleton-description"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      </div>`;
  }

  async loadBannerContent() {
    try {
      // Cargar contenido del banner desde múltiples fuentes con categorías específicas
      const bannerFeeds = this.getBannerFeedsByPage();
      const allItems = [];

      for (const feed of bannerFeeds) {
        try {
          let xmlContent;
          
          // Intentar con múltiples proxies
          const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://corsproxy.io/?'
          ];
          
          for (const proxy of proxies) {
            try {
              console.log(`🔄 Banner: Intentando ${feed.title} con ${proxy}`);
              
              const proxyResponse = await fetch(`${proxy}${encodeURIComponent(feed.url)}`);
              const data = await proxyResponse.json();
              xmlContent = data.contents || data.data || data;
              
              if (xmlContent) {
                console.log(`✅ Banner: ${feed.title} cargado con ${proxy}`);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Banner: Proxy falló para ${feed.title} - ${error.message}`);
              continue;
            }
          }
          
          if (!xmlContent) {
            throw new Error(`No se pudo cargar ${feed.title}`);
          }

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
          
          const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 8).map(item => {
            const title = item.querySelector('title')?.textContent || 'Sin título';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            
            // Buscar imagen
            let imageUrl = null;
            const enclosure = item.querySelector('enclosure[type^="image"]');
            if (enclosure) {
              imageUrl = enclosure.getAttribute('url');
            }
            
            return {
              title,
              description: this.cleanDescription(description),
              link,
              pubDate,
              imageUrl: imageUrl || this.getDefaultImage(feed.category),
              source: feed.title,
              category: feed.category,
              priority: feed.priority || 1
            };
          });

          allItems.push(...items);
        } catch (error) {
          console.error(`Error cargando banner de ${feed.title}:`, error);
        }
      }

      // Ordenar por prioridad y fecha, tomar las mejores
      this.slides = allItems
        .sort((a, b) => {
          // Primero por prioridad, luego por fecha
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return new Date(b.pubDate) - new Date(a.pubDate);
        })
        .slice(0, 6);

      this.renderBanner();
    } catch (error) {
      console.error('Error cargando contenido del banner:', error);
      this.loadFallbackBanner();
    }
  }

  getBannerFeedsByPage() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop().replace('.html', '');
    
    const feedsByPage = {
      'deportes': [
        {
          url: 'https://feeds.bbci.co.uk/sport/rss.xml',
          title: 'BBC Sport',
          category: 'Deportes',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/deportes/',
          title: 'Clarín Deportes',
          category: 'Deportes',
          priority: 2
        },
        {
          url: 'https://www.eltiempo.com/rss/deportes.xml',
          title: 'El Tiempo Deportes',
          category: 'Deportes',
          priority: 1
        }
      ],
      'tecnologia': [
        {
          url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
          title: 'BBC Technology',
          category: 'Tecnología',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/tecnologia/',
          title: 'Clarín Tecnología',
          category: 'Tecnología',
          priority: 2
        },
        {
          url: 'https://www.eltiempo.com/rss/tecnosfera.xml',
          title: 'El Tiempo Tecnósfera',
          category: 'Tecnología',
          priority: 1
        }
      ],
      'cultura': [
        {
          url: 'https://www.clarin.com/rss/cultura/',
          title: 'Clarín Cultura',
          category: 'Cultura',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/espectaculos/',
          title: 'Clarín Espectáculos',
          category: 'Cultura',
          priority: 2
        },
        {
          url: 'https://www.eltiempo.com/rss/cultura.xml',
          title: 'El Tiempo Cultura',
          category: 'Cultura',
          priority: 1
        }
      ],
      'autos': [
        {
          url: 'https://www.clarin.com/rss/autos/',
          title: 'Clarín Autos',
          category: 'Autos',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/viajes/',
          title: 'Clarín Viajes',
          category: 'Autos',
          priority: 2
        },
        {
          url: 'https://www.eltiempo.com/rss/economia.xml',
          title: 'El Tiempo Economía',
          category: 'Autos',
          priority: 1
        }
      ],
      'index': [
        {
          url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
          title: 'BBC World News',
          category: 'Internacional',
          priority: 3
        },
        {
          url: 'https://elpais.com/rss/elpais/portada.xml',
          title: 'El País Portada',
          category: 'España',
          priority: 3
        },
        {
          url: 'https://www.clarin.com/rss/politica/',
          title: 'Clarín Política',
          category: 'Política',
          priority: 2
        },
        {
          url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
          title: 'BBC Technology',
          category: 'Tecnología',
          priority: 2
        },
        {
          url: 'https://feeds.bbci.co.uk/sport/rss.xml',
          title: 'BBC Sport',
          category: 'Deportes',
          priority: 2
        }
      ]
    };
    
    return feedsByPage[pageName] || feedsByPage['index'];
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remover HTML tags
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    // Limitar longitud
    if (cleanText.length > 120) {
      return cleanText.substring(0, 120) + '...';
    }
    
    return cleanText;
  }

  getDefaultImage(category) {
    const defaultImages = {
      'Deportes': [
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop'
      ],
      'Tecnología': [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=600&fit=crop'
      ],
      'Cultura': [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop'
      ],
      'Autos': [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=600&fit=crop'
      ],
      'default': [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop',
        'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=1200&h=600&fit=crop'
      ]
    };
    
    const images = defaultImages[category] || defaultImages['default'];
    return images[Math.floor(Math.random() * images.length)];
  }

  loadFallbackBanner() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop().replace('.html', '');
    
    const fallbackContent = {
      'deportes': [
        {
          title: 'Fútbol: Nuevas transferencias millonarias en Europa',
          description: 'Los equipos europeos se preparan para la próxima temporada con fichajes récord que superan los 200 millones de euros.',
          link: 'https://elpais.com/deportes/',
          imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop',
          source: 'El País',
          category: 'Deportes',
          priority: 3
        },
        {
          title: 'NBA: Playoffs con emocionantes finales',
          description: 'Las series de playoffs de la NBA llegan a su punto más álgido con partidos que definen el camino al campeonato.',
          link: 'https://www.bbc.com/sport/basketball',
          imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop',
          source: 'BBC Sport',
          category: 'Deportes',
          priority: 2
        }
      ],
      'tecnologia': [
        {
          title: 'Inteligencia Artificial revoluciona el sector tecnológico',
          description: 'Las empresas líderes presentan innovaciones revolucionarias en IA que cambiarán el futuro de la tecnología y la sociedad.',
          link: 'https://elpais.com/tecnologia/',
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
          source: 'El País',
          category: 'Tecnología',
          priority: 3
        },
        {
          title: 'Apple presenta nuevos productos innovadores',
          description: 'La empresa tecnológica revela sus últimas innovaciones en el evento anual con características revolucionarias.',
          link: 'https://www.bbc.com/news/technology',
          imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&h=600&fit=crop',
          source: 'BBC',
          category: 'Tecnología',
          priority: 2
        }
      ],
      'cultura': [
        {
          title: 'Festival de Cannes: Las películas más esperadas',
          description: 'El prestigioso festival de cine presenta las producciones más innovadoras y polémicas de la temporada.',
          link: 'https://elpais.com/cultura/',
          imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop',
          source: 'El País',
          category: 'Cultura',
          priority: 3
        },
        {
          title: 'Exposición de arte contemporáneo en Madrid',
          description: 'Los mejores artistas contemporáneos presentan sus obras más impactantes en una muestra sin precedentes.',
          link: 'https://www.clarin.com/cultura/',
          imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=600&fit=crop',
          source: 'Clarín',
          category: 'Cultura',
          priority: 2
        }
      ],
      'autos': [
        {
          title: 'Tesla presenta su nuevo modelo revolucionario',
          description: 'La empresa de Elon Musk revela su vehículo más avanzado con tecnología de conducción autónoma de nivel 5.',
          link: 'https://www.clarin.com/autos/',
          imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=600&fit=crop',
          source: 'Clarín',
          category: 'Autos',
          priority: 3
        },
        {
          title: 'Fórmula 1: Nueva temporada con cambios radicales',
          description: 'Los equipos de F1 presentan sus monoplazas con las nuevas regulaciones técnicas que prometen carreras más emocionantes.',
          link: 'https://www.bbc.com/sport/formula1',
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop',
          source: 'BBC Sport',
          category: 'Autos',
          priority: 2
        }
      ],
      'index': [
        {
          title: 'Crisis económica global: Análisis de expertos',
          description: 'Los economistas analizan las tendencias del mercado internacional y sus implicaciones para el futuro económico mundial.',
          link: 'https://elpais.com/economia/',
          imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop',
          source: 'El País',
          category: 'Economía',
          priority: 3
        },
        {
          title: 'Cumbre mundial sobre cambio climático',
          description: 'Los líderes mundiales se reúnen para discutir medidas urgentes contra el calentamiento global y sus consecuencias.',
          link: 'https://elpais.com/internacional/',
          imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop',
          source: 'El País',
          category: 'Internacional',
          priority: 3
        }
      ]
    };
    
    this.slides = fallbackContent[pageName] || fallbackContent['index'];
    this.renderBanner();
  }

  renderBanner() {
    const container = document.getElementById('carousel-inner-news');
    if (!container) return;

    container.innerHTML = '';

    // Crear el carrusel principal con Bootstrap
    const carousel = document.createElement('div');
    carousel.className = 'carousel slide';
    carousel.id = 'mainBannerCarousel';
    carousel.setAttribute('data-bs-ride', 'carousel');
    carousel.setAttribute('data-bs-interval', '5000');

    // Contenido del carrusel
    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    this.slides.forEach((slide, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      
      carouselItem.innerHTML = `
        <div class="banner-slide">
          <div class="banner-image-container">
            <img src="${slide.imageUrl}" class="banner-image" alt="${slide.title}" loading="${index === 0 ? 'eager' : 'lazy'}">
            <div class="banner-overlay"></div>
          </div>
          <div class="banner-content">
            <div class="banner-badges">
              <span class="banner-category-badge">${slide.category}</span>
              <span class="banner-source-badge">
                <i class="bi bi-newspaper"></i> ${slide.source}
              </span>
            </div>
            <div class="banner-text">
              <h1 class="banner-title">${slide.title}</h1>
              <p class="banner-description">${slide.description}</p>
              <div class="banner-actions">
                <a href="${slide.link}" class="btn btn-primary btn-lg banner-btn" target="_blank">
                  <i class="bi bi-arrow-right"></i> Leer completo
                </a>
                <div class="banner-meta">
                  <small class="text-light">
                    <i class="bi bi-clock"></i> ${this.formatDate(slide.pubDate)}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselInner);

    // Controles del carrusel
    const controls = `
      <button class="carousel-control-prev banner-control" type="button" data-bs-target="#mainBannerCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next banner-control" type="button" data-bs-target="#mainBannerCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
      <div class="carousel-indicators banner-indicators">
        ${this.slides.map((_, index) => `
          <button type="button" data-bs-target="#mainBannerCarousel" data-bs-slide-to="${index}" 
                  class="${index === 0 ? 'active' : ''}" aria-label="Slide ${index + 1}"></button>
        `).join('')}
      </div>
    `;

    carousel.innerHTML += controls;
    container.appendChild(carousel);

    // Inicializar el carrusel de Bootstrap
    if (typeof bootstrap !== 'undefined') {
      new bootstrap.Carousel(carousel, {
        interval: 5000,
        wrap: true,
        keyboard: true,
        pause: 'hover'
      });
    }
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Hace poco';
    }
  }

  startAutoPlay() {
    // El autoplay ahora se maneja por Bootstrap Carousel
  }

  stopAutoPlay() {
    // El autoplay ahora se maneja por Bootstrap Carousel
  }



  setupControls() {
    // Los controles ahora se manejan por Bootstrap Carousel
    const carousel = document.getElementById('mainBannerCarousel');
    if (carousel) {
      // Pausar en hover
      carousel.addEventListener('mouseenter', () => {
        if (typeof bootstrap !== 'undefined') {
          const bsCarousel = bootstrap.Carousel.getInstance(carousel);
          if (bsCarousel) bsCarousel.pause();
        }
      });
      
      carousel.addEventListener('mouseleave', () => {
        if (typeof bootstrap !== 'undefined') {
          const bsCarousel = bootstrap.Carousel.getInstance(carousel);
          if (bsCarousel) bsCarousel.cycle();
        }
      });
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.bannerManager = new BannerManager();
}); 