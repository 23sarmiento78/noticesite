// Gestor específico para páginas de categorías
class CategoryManager {
  constructor() {
    this.currentCategory = this.detectCategory();
    this.init();
  }

  detectCategory() {
    const path = window.location.pathname;
    if (path.includes('deportes')) return 'deportes';
    if (path.includes('tecnologia')) return 'tecnologia';
    if (path.includes('cultura')) return 'cultura';
    if (path.includes('autos')) return 'autos';
    if (path.includes('ultimo')) return 'ultimo';
    return 'general';
  }

  getCategoryFeeds() {
    const categoryFeeds = {
      deportes: [
        {
          id: 'bbc-sport',
          title: 'BBC Sport',
          url: 'https://feeds.bbci.co.uk/sport/rss.xml',
          containerId: 'categoria3-news-container',
          fuente: 'BBC',
          categoria: 'Deportes'
        },
        {
          id: 'clarin-deportes',
          title: 'Clarín Deportes',
          url: 'https://www.clarin.com/rss/deportes/',
          containerId: 'buena-vida-news-container',
          fuente: 'Clarín',
          categoria: 'Deportes'
        }
      ],
      tecnologia: [
        {
          id: 'bbc-tech',
          title: 'BBC Technology',
          url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
          containerId: 'tecnologia-news-container',
          fuente: 'BBC',
          categoria: 'Tecnología'
        },
        {
          id: 'clarin-tecnologia',
          title: 'Clarín Tecnología',
          url: 'https://www.clarin.com/rss/tecnologia/',
          containerId: 'categoria1-news-container',
          fuente: 'Clarín',
          categoria: 'Tecnología'
        }
      ],
      cultura: [
        {
          id: 'clarin-cultura',
          title: 'Clarín Cultura',
          url: 'https://www.clarin.com/rss/cultura/',
          containerId: 'categoria1-news-container',
          fuente: 'Clarín',
          categoria: 'Cultura'
        },
        {
          id: 'clarin-espectaculos',
          title: 'Clarín Espectáculos',
          url: 'https://www.clarin.com/rss/espectaculos/',
          containerId: 'categoria2-news-container',
          fuente: 'Clarín',
          categoria: 'Espectáculos'
        },
        {
          id: 'clarin-cine',
          title: 'Clarín Cine',
          url: 'https://www.clarin.com/rss/espectaculos/cine/',
          containerId: 'categoria3-news-container',
          fuente: 'Clarín',
          categoria: 'Cine'
        }
      ],
      autos: [
        {
          id: 'clarin-autos',
          title: 'Clarín Autos',
          url: 'https://www.clarin.com/rss/autos/',
          containerId: 'categoria1-news-container',
          fuente: 'Clarín',
          categoria: 'Autos'
        }
      ],
      ultimo: [
        {
          id: 'bbc-world',
          title: 'BBC World News',
          url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
          containerId: 'categoria1-news-container',
          fuente: 'BBC',
          categoria: 'Internacional'
        },
        {
          id: 'elpais-portada',
          title: 'El País Portada',
          url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
          containerId: 'categoria2-news-container',
          fuente: 'El País',
          categoria: 'España'
        }
      ]
    };

    return categoryFeeds[this.currentCategory] || [];
  }

  async init() {
    if (this.currentCategory === 'general') return;
    
    const feeds = this.getCategoryFeeds();
    if (feeds.length === 0) return;

    console.log(`🔄 Iniciando carga para categoría: ${this.currentCategory}`);
    
    // Cargar feeds de la categoría
    for (const feed of feeds) {
      try {
        await this.loadCategoryFeed(feed);
      } catch (error) {
        console.error(`Error cargando feed ${feed.title}:`, error);
      }
    }
  }

  async loadCategoryFeed(feed) {
    try {
      console.log(`🔄 Cargando ${feed.title}...`);
      
      let xmlContent;
      
      // Intentar fetch directo para BBC
      if (feed.url.includes('bbci.co.uk')) {
        try {
          const response = await fetch(feed.url);
          if (response.ok) {
            xmlContent = await response.text();
            console.log(`✓ Fetch directo exitoso para ${feed.title}`);
          } else {
            throw new Error('Fetch directo falló');
          }
        } catch (error) {
          console.log(`⚠️ Fetch directo falló para ${feed.title}, usando proxy...`);
          xmlContent = await this.fetchWithProxy(feed.url);
        }
      } else {
        // Usar proxy para otros feeds
        xmlContent = await this.fetchWithProxy(feed.url);
      }

      const parsedFeed = await this.parseRSSXML(xmlContent);
      console.log(`✓ Cargado feed: ${feed.title} (${parsedFeed.items.length} noticias)`);
      
      this.renderCategoryFeed({
        ...parsedFeed,
        feedInfo: feed
      });
      
    } catch (error) {
      console.error(`❌ Error cargando ${feed.title}:`, error);
      this.renderFallbackContent(feed);
    }
  }

  async fetchWithProxy(url) {
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];

    for (let i = 0; i < proxies.length; i++) {
      try {
        const proxy = proxies[i];
        const proxyUrl = proxy + encodeURIComponent(url);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, */*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.contents) {
          return data.contents;
        } else if (data.data) {
          return data.data;
        } else if (typeof data === 'string') {
          return data;
        } else {
          throw new Error('Formato de respuesta de proxy no reconocido');
        }
      } catch (error) {
        console.warn(`Proxy ${i + 1} falló, intentando siguiente...`);
        if (i === proxies.length - 1) {
          throw error;
        }
      }
    }
  }

  parseRSSXML(xmlText) {
    return new Promise((resolve, reject) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
          throw new Error('Error parsing XML');
        }

        const channel = xmlDoc.querySelector('channel');
        if (!channel) {
          throw new Error('No se encontró el canal RSS');
        }

        const title = channel.querySelector('title')?.textContent || 'Sin título';
        const description = channel.querySelector('description')?.textContent || '';
        const link = channel.querySelector('link')?.textContent || '';

        const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => {
          const itemTitle = item.querySelector('title')?.textContent || 'Sin título';
          const itemDescription = item.querySelector('description')?.textContent || '';
          const itemLink = item.querySelector('link')?.textContent || '#';
          const itemPubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          
          let imageUrl = null;
          const enclosure = item.querySelector('enclosure[type^="image"]');
          if (enclosure) {
            imageUrl = enclosure.getAttribute('url');
          } else {
            const mediaContent = item.querySelector('media\\:content, content');
            if (mediaContent) {
              imageUrl = mediaContent.getAttribute('url');
            }
          }

          return {
            title: itemTitle,
            description: itemDescription,
            link: itemLink,
            pubDate: itemPubDate,
            enclosure: imageUrl ? { url: imageUrl } : null
          };
        });

        resolve({
          title,
          description,
          link,
          items
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  renderCategoryFeed(feedData) {
    const { feedInfo } = feedData;
    const container = document.getElementById(feedInfo.containerId);
    
    if (!container) {
      console.warn(`Contenedor no encontrado: ${feedInfo.containerId}`);
      return;
    }

    const rowContainer = container.querySelector('.row');
    if (!rowContainer) {
      console.warn(`Row container no encontrado en: ${feedInfo.containerId}`);
      return;
    }

    rowContainer.innerHTML = '';
    
    if (!feedData.items || feedData.items.length === 0) {
      rowContainer.innerHTML = `
        <div class="col">
          <div class="alert alert-warning text-center">
            No se encontraron noticias en este momento.
          </div>
        </div>
      `;
      return;
    }

    // Mostrar máximo 6 noticias por sección
    const itemsToShow = feedData.items.slice(0, 6);
    
    itemsToShow.forEach(item => {
      const col = document.createElement('div');
      col.classList.add('col');
      
      const imagenNoticia = this.getImageUrl(item);
      
      col.innerHTML = `
        <article class="card h-100 news-card" itemscope itemtype="http://schema.org/NewsArticle" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="${imagenNoticia}" class="card-img-top news-image" alt="${item.title}" loading="lazy" itemprop="image" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${feedInfo.categoria}</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${feedInfo.fuente}</span>
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
            <h5 class="card-title news-headline" itemprop="headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.title}</h5>
            <p class="card-text news-description flex-grow-1" itemprop="description" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">${this.cleanDescription(item.description)}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted" style="color: #888 !important;">
                  <i class="bi bi-clock"></i> ${this.formatDate(item.pubDate)}
                </small>
              </div>
              <a href="${item.link}" class="btn btn-outline-warning btn-sm w-100" itemprop="url" target="_blank" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                <i class="bi bi-arrow-right"></i> Leer completo
              </a>
            </div>
          </div>
          <meta itemprop="datePublished" content="${item.pubDate}" />
          <meta itemprop="dateModified" content="${item.pubDate}" />
          <div itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
            <meta itemprop="url" content="${imagenNoticia}" />
          </div>
        </article>
      `;
      
      rowContainer.appendChild(col);
    });
  }

  renderFallbackContent(feed) {
    console.log(`🔄 Usando contenido de ejemplo para: ${feed.title}`);
    
    const container = document.getElementById(feed.containerId);
    if (!container) return;

    const rowContainer = container.querySelector('.row');
    if (!rowContainer) return;

    rowContainer.innerHTML = `
      <div class="col">
        <article class="card h-100 news-card" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="${this.getDefaultImage()}" class="card-img-top news-image" alt="Noticia de ejemplo" loading="lazy" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${feed.categoria}</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${feed.fuente}</span>
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1.5rem;">
            <h5 class="card-title news-headline" style="color: #bfa046; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; font-size: 1.1rem;">Noticia de ejemplo - ${feed.categoria}</h5>
            <p class="card-text news-description flex-grow-1" style="color: #ccc; line-height: 1.5; font-size: 0.9rem; margin-bottom: 1rem;">Esta es una noticia de ejemplo mientras se resuelven los problemas de conexión.</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <small class="text-muted" style="color: #888 !important;">
                  <i class="bi bi-clock"></i> Hace unos minutos
                </small>
              </div>
              <a href="#" class="btn btn-outline-warning btn-sm w-100" style="border-color: #bfa046; color: #bfa046; font-weight: 600; transition: all 0.3s ease;">
                <i class="bi bi-arrow-right"></i> Leer completo
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  getImageUrl(item) {
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    
    return this.getDefaultImage();
  }

  getDefaultImage() {
    const defaultImages = [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495020683877-95802f6f647a?w=800&h=600&fit=crop'
    ];
    
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  cleanDescription(description) {
    if (!description) return 'Sin descripción disponible.';
    
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    if (cleanText.length > 150) {
      return cleanText.substring(0, 150) + '...';
    }
    
    return cleanText;
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
      return 'Fecha no disponible';
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.categoryManager = new CategoryManager();
}); 