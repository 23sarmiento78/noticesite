// Sistema de banner para el carrusel principal
class BannerManager {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.autoPlayInterval = null;
    this.init();
  }

  async init() {
    await this.loadBannerContent();
    this.startAutoPlay();
    this.setupControls();
  }

  async loadBannerContent() {
    try {
      // Cargar contenido del banner desde múltiples fuentes
      const bannerFeeds = [
        {
          url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
          title: 'BBC World News'
        },
        {
          url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
          title: 'El País'
        }
      ];

      const allItems = [];

      for (const feed of bannerFeeds) {
        try {
          let xmlContent;
          
          // Intentar fetch directo para BBC
          if (feed.url.includes('bbci.co.uk')) {
            try {
              const response = await fetch(feed.url);
              if (response.ok) {
                xmlContent = await response.text();
              } else {
                throw new Error('Fetch directo falló');
              }
            } catch (error) {
              // Usar proxy como fallback
              const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
              const data = await proxyResponse.json();
              xmlContent = data.contents;
            }
          } else {
            // Usar proxy para otros feeds
            const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const data = await proxyResponse.json();
            xmlContent = data.contents;
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
        title: 'Noticias Destacadas',
        description: 'Mantente informado con las últimas noticias del mundo',
        link: '#',
        imageUrl: this.getDefaultImage(),
        source: 'HGARUNA News'
      },
      {
        title: 'Tecnología y Innovación',
        description: 'Descubre las últimas tendencias en tecnología',
        link: '#',
        imageUrl: this.getDefaultImage(),
        source: 'HGARUNA News'
      },
      {
        title: 'Deportes Internacionales',
        description: 'Toda la información deportiva que necesitas',
        link: '#',
        imageUrl: this.getDefaultImage(),
        source: 'HGARUNA News'
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
          <img src="${slide.imageUrl}" class="d-block w-100" alt="${slide.title}" 
               style="height: 500px; object-fit: cover; filter: brightness(0.7);">
          <div class="carousel-caption d-none d-md-block" 
               style="background: rgba(0, 0, 0, 0.6); padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #bfa046; font-weight: 700; margin-bottom: 15px;">${slide.title}</h2>
            <p style="color: #fff; font-size: 1.1rem; margin-bottom: 20px;">${slide.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small style="color: #ccc;">
                <i class="bi bi-newspaper"></i> ${slide.source}
              </small>
              <a href="${slide.link}" class="btn btn-warning" target="_blank" 
                 style="background: #bfa046; border: none; font-weight: 600;">
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