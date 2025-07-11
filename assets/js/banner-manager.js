// Sistema de banner para el carrusel principal
class BannerManager {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.autoPlayInterval = null;
    this.init();
  }

  async init() {
    console.log('🎬 Iniciando Banner Manager...');
    this.renderPlaceholderBanner();
    try {
      // Intentar cargar contenido real del banner
      await this.loadBannerContent();
      this.startAutoPlay();
      this.setupControls();
    } catch (error) {
      console.error('Error en Banner Manager:', error);
      this.loadFallbackBanner();
      this.startAutoPlay();
      this.setupControls();
    }
  }

  renderPlaceholderBanner() {
    const container = document.getElementById('carousel-inner-news');
    if (!container) return;

    container.innerHTML = `
      <div class="banner-skeleton">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>`;
  }

  async loadBannerContent() {
    try {
      // Cargar contenido del banner desde múltiples fuentes
      const bannerFeeds = [
        {
          url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
          title: 'BBC Technology'
        },
        {
          url: 'https://elpais.com/rss/elpais/portada.xml',
          title: 'El País'
        },
        {
          url: 'https://elpais.com/rss/internacional/portada.xml',
          title: 'El País Internacional'
        }
      ];

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
          
          const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 5).map(item => {
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
              imageUrl: imageUrl || this.getDefaultImage(),
              source: feed.title
            };
          });

          allItems.push(...items);
        } catch (error) {
          console.error(`Error cargando banner de ${feed.title}:`, error);
        }
      }

      // Ordenar por fecha y tomar las más recientes
      this.slides = allItems
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 5);

      this.renderBanner();
    } catch (error) {
      console.error('Error cargando contenido del banner:', error);
      this.loadFallbackBanner();
    }
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remover HTML tags
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    // Limitar longitud
    if (cleanText.length > 100) {
      return cleanText.substring(0, 100) + '...';
    }
    
    return cleanText;
  }

  getDefaultImage() {
    const defaultImages = [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=1200&h=600&fit=crop'
    ];
    
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  loadFallbackBanner() {
    this.slides = [
      {
        title: 'Inteligencia Artificial revoluciona el sector tecnológico',
        description: 'Las empresas líderes presentan innovaciones revolucionarias en IA que cambiarán el futuro de la tecnología.',
        link: 'https://elpais.com/tecnologia/',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
        source: 'El País'
      },
      {
        title: 'Fútbol: Nuevas transferencias en la ventana de mercado',
        description: 'Los equipos europeos se preparan para la próxima temporada con importantes fichajes millonarios.',
        link: 'https://elpais.com/deportes/',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop',
        source: 'El País'
      },
      {
        title: 'Crisis económica global: Análisis de expertos',
        description: 'Los economistas analizan las tendencias del mercado internacional y sus implicaciones.',
        link: 'https://elpais.com/economia/',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=600&fit=crop',
        source: 'El País'
      },
      {
        title: 'Cumbre mundial sobre cambio climático',
        description: 'Los líderes mundiales se reúnen para discutir medidas contra el calentamiento global.',
        link: 'https://elpais.com/internacional/',
        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop',
        source: 'El País'
      },
      {
        title: 'Apple presenta nuevos productos innovadores',
        description: 'La empresa tecnológica revela sus últimas innovaciones en el evento anual.',
        link: 'https://www.bbc.com/news/technology',
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&h=600&fit=crop',
        source: 'BBC'
      }
    ];
    
    this.renderBanner();
  }

  renderBanner() {
    const container = document.getElementById('carousel-inner-news');
    if (!container) return;

    container.innerHTML = '';

    this.slides.forEach((slide, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      
      carouselItem.innerHTML = `
        <div class="position-relative">
          <img src="${slide.imageUrl}" class="d-block w-100" alt="${slide.title}">
          <div class="carousel-caption d-none d-md-block">
            <h2>${slide.title}</h2>
            <p>${slide.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small><i class="bi bi-newspaper"></i> ${slide.source}</small>
              <a href="${slide.link}" class="btn btn-primary" target="_blank">
                <i class="bi bi-arrow-right"></i> Leer más
              </a>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(carouselItem);
    });

    // Agregar controles del carrusel
    this.addCarouselControls();
  }

  addCarouselControls() {
    const container = document.getElementById('carousel-inner-news');
    if (!container) return;

    // Botones de navegación
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-control-prev';
    prevButton.type = 'button';
    prevButton.setAttribute('data-bs-target', '#carousel-inner-news');
    prevButton.setAttribute('data-bs-slide', 'prev');
    prevButton.innerHTML = `
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Anterior</span>
    `;

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-control-next';
    nextButton.type = 'button';
    nextButton.setAttribute('data-bs-target', '#carousel-inner-news');
    nextButton.setAttribute('data-bs-slide', 'next');
    nextButton.innerHTML = `
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Siguiente</span>
    `;

    container.appendChild(prevButton);
    container.appendChild(nextButton);

    // Indicadores
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    indicatorsContainer.setAttribute('data-bs-target', '#carousel-inner-news');

    this.slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.setAttribute('data-bs-target', '#carousel-inner-news');
      indicator.setAttribute('data-bs-slide-to', index);
      indicator.className = index === 0 ? 'active' : '';
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);
      
      indicatorsContainer.appendChild(indicator);
    });

    container.appendChild(indicatorsContainer);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambiar cada 5 segundos
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(this.currentSlide);
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.showSlide(this.currentSlide);
  }

  showSlide(index) {
    const items = document.querySelectorAll('#carousel-inner-news .carousel-item');
    const indicators = document.querySelectorAll('#carousel-inner-news .carousel-indicators button');
    
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    this.currentSlide = index;
  }

  setupControls() {
    // Pausar autoplay al hacer hover
    const carousel = document.getElementById('carousel-inner-news');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
      carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // Controles de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.bannerManager = new BannerManager();
}); 