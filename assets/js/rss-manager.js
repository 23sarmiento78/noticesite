// Sistema de manejo de RSS mejorado
class RSSManager {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
    this.parser = null;
    this.init();
  }

  async init() {
    // Cargar el parser RSS dinámicamente
    this.renderAllPlaceholders();
    await this.loadRSSParser();
    this.startLoading();
  }

  async loadRSSParser() {
    try {
      // Crear un parser RSS simple sin dependencias externas
      this.parser = {
        parseString: (xmlText) => this.parseRSSXML(xmlText)
      };
    } catch (error) {
      console.error('Error cargando parser RSS:', error);
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
          
          // Buscar imagen en enclosure o media:content
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

  async fetchWithProxy(url, proxyIndex = 0) {
    const { proxies } = RSS_CONFIG;
    
    if (proxyIndex >= proxies.length) {
      throw new Error('Todos los proxies fallaron');
    }

    const proxy = proxies[proxyIndex];
    let proxyUrl;
    
    // Manejar diferentes formatos de proxy
    if (proxy.includes('allorigins.win')) {
      proxyUrl = proxy + encodeURIComponent(url);
    } else if (proxy.includes('corsproxy.io')) {
      proxyUrl = proxy + url;
    } else if (proxy.includes('codetabs.com')) {
      proxyUrl = proxy + url;
    } else {
      proxyUrl = proxy + encodeURIComponent(url);
    }
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)'
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Manejar diferentes formatos de respuesta de proxy
      if (typeof data === 'object' && data.contents) {
        return data.contents;
      } else if (typeof data === 'object' && data.data) {
        return data.data;
      } else if (typeof data === 'string') {
        return data;
      } else {
        throw new Error('Formato de respuesta de proxy no reconocido');
      }
    } catch (error) {
      console.warn(`Proxy ${proxyIndex + 1} falló (${error.message}), intentando siguiente...`);
      return this.fetchWithProxy(url, proxyIndex + 1);
    }
  }

  async fetchFeed(feed) {
    const cacheKey = `${feed.id}_${Date.now()}`;
    
    // Verificar cache
    if (RSS_CONFIG.cacheConfig.enabled) {
      const cached = this.cache.get(feed.id);
      if (cached && Date.now() - cached.timestamp < RSS_CONFIG.cacheConfig.duration) {
        return cached.data;
      }
    }

    // Evitar múltiples requests simultáneos al mismo feed
    if (this.loadingStates.get(feed.id)) {
      return this.loadingStates.get(feed.id);
    }

    const loadingPromise = this.loadFeed(feed);
    this.loadingStates.set(feed.id, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Guardar en cache
      if (RSS_CONFIG.cacheConfig.enabled) {
        this.cache.set(feed.id, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } finally {
      this.loadingStates.delete(feed.id);
    }
  }

  async loadFeed(feed) {
    const { retryConfig } = RSS_CONFIG;
    
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        console.log(`🔄 Cargando ${feed.title} (intento ${attempt}/${retryConfig.maxRetries})`);
        
        let xmlContent;
        
        // Intentar fetch directo primero para feeds que lo permiten
        if (feed.url.includes('bbci.co.uk')) {
          try {
            const response = await fetch(feed.url, {
              method: 'GET',
              headers: {
                'Accept': 'application/xml, text/xml, */*'
              }
            });
            
            if (response.ok) {
              xmlContent = await response.text();
              console.log(`✓ Fetch directo exitoso para ${feed.title}`);
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (error) {
            console.log(`⚠️ Fetch directo falló para ${feed.title}, usando proxy...`);
            xmlContent = await this.fetchWithProxy(feed.url);
          }
        } else {
          // Usar proxy para feeds que requieren CORS
          xmlContent = await this.fetchWithProxy(feed.url);
        }

        const parsedFeed = await this.parser.parseString(xmlContent);
        console.log(`✓ Cargado feed: ${feed.title} (${parsedFeed.items.length} noticias)`);
        
        return {
          ...parsedFeed,
          feedInfo: feed
        };
        
      } catch (error) {
        console.error(`❌ Error cargando ${feed.title}:`, error);
        
        if (attempt === retryConfig.maxRetries) {
          // Usar contenido de ejemplo como fallback
          return this.getFallbackContent(feed);
        }
        
        // Esperar antes del siguiente intento
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt - 1),
          retryConfig.maxDelay
        );
        
        console.log(`⏳ Esperando ${delay}ms antes del reintento...`);
        await this.delay(delay);
      }
    }
  }

  getFallbackContent(feed) {
    console.log(`🔄 Usando contenido de ejemplo para: ${feed.title}`);
    
    const fallbackItems = [
      {
        title: `Noticia de ejemplo - ${feed.categoria}`,
        description: 'Esta es una noticia de ejemplo mientras se resuelven los problemas de conexión.',
        link: '#',
        pubDate: new Date().toISOString(),
        enclosure: null
      },
      {
        title: `Otra noticia - ${feed.categoria}`,
        description: 'Contenido temporal mientras se restaura la conexión con la fuente.',
        link: '#',
        pubDate: new Date().toISOString(),
        enclosure: null
      }
    ];

    return {
      title: feed.title,
      description: `Contenido temporal de ${feed.fuente}`,
      link: '#',
      items: fallbackItems,
      feedInfo: feed
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startLoading() {
    console.log('🔄 Iniciando carga de noticias en paralelo...');
    const feeds = RSS_CONFIG.feeds;

    const feedPromises = feeds.map(feed =>
      this.fetchFeed(feed)
        .then(result => {
          this.renderFeed(result);
        })
        .catch(error => {
          console.error(`❌ Falló la carga para ${feed.title}:`, error);
          this.renderError(feed.containerId);
        })
    );

    // Esperar a que todos los feeds terminen (exitosos o fallidos)
    await Promise.allSettled(feedPromises);

    // Cargar noticias destacadas después de que todos los feeds estén listos
    this.loadDestacadas();
  }

  renderAllPlaceholders() {
    const feeds = RSS_CONFIG.feeds;
    feeds.forEach(feed => {
      const container = document.getElementById(feed.containerId);
      if (container) {
        const rowContainer = container.querySelector('.row');
        if (rowContainer) {
          rowContainer.innerHTML = this.getPlaceholderHTML(6); // Mostrar 6 placeholders
        }
      }
    });
  }

  getPlaceholderHTML(count = 1) {
    let placeholderHTML = '';
    for (let i = 0; i < count; i++) {
      placeholderHTML += `
        <div class="col">
          <div class="card h-100 news-card is-loading">
            <div class="skeleton card-img-top" style="height: 200px;"></div>
            <div class="card-body">
              <div class="skeleton" style="height: 24px; width: 80%; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 0.5rem;"></div>
              <div class="skeleton" style="height: 16px; width: 90%; margin-bottom: 0.5rem;"></div>
              <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 38px; width: 100%;"></div>
            </div>
          </div>
        </div>
      `;
    }
    return placeholderHTML;
  }

  renderError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar las noticias. Intente de nuevo más tarde.</div></div>`;
    }
  }

  getBadgeClasses(type, value) {
    let classes = `badge ${type}-badge`;
    if (!value) return classes;

    const normalizedValue = value.toLowerCase();

    // Clase especial para "Internacional"
    if (type === 'category' && normalizedValue.includes('internacional')) {
        classes += ' category-international';
    } 
    // Clase especial para "El País"
    else if (type === 'source' && normalizedValue.includes('el país')) {
        classes += ' source-elpais';
    }
    
    return classes;
  }

  renderFeed(feedData) {
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
      
      const categoriaClass = this.getBadgeClasses('category', feedInfo.categoria);
      const fuenteClass = this.getBadgeClasses('source', feedInfo.fuente);
      const imagenNoticia = this.getImageUrl(item);
      
      col.innerHTML = `
        <article class="card h-100 news-card" itemscope itemtype="http://schema.org/NewsArticle">
          <div class="position-relative">
            <img src="${imagenNoticia}" class="card-img-top news-image" alt="${item.title}" loading="lazy" itemprop="image">
            <div class="overlay-gradient"></div>
            <span class="${categoriaClass}">${feedInfo.categoria}</span>
            <span class="${fuenteClass}">${feedInfo.fuente}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title news-headline" itemprop="headline">${item.title}</h5>
            <p class="card-text news-description flex-grow-1" itemprop="description">${this.cleanDescription(item.description)}</p>
            <div class="mt-auto">
              <small class="text-muted d-block mb-2"><i class="bi bi-clock"></i> ${this.formatDate(item.pubDate)}</small>
              <a href="${item.link}" class="btn btn-outline-primary btn-sm w-100" itemprop="url" target="_blank">
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

  getImageUrl(item) {
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    
    // Seleccionar imagen aleatoria de las predeterminadas
    const randomIndex = Math.floor(Math.random() * RSS_CONFIG.defaultImages.length);
    return RSS_CONFIG.defaultImages[randomIndex];
  }

  cleanDescription(description) {
    if (!description) return 'Sin descripción disponible.';
    
    // Remover HTML tags
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    // Limitar longitud para respetar derechos de autor (máximo 150 caracteres)
    if (cleanText.length > 150) {
      return cleanText.substring(0, 150) + '... <em>(fragmento)</em>';
    }
    
    return cleanText + ' <em>(fragmento)</em>';
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

  loadDestacadas() {
    // Recopilar noticias destacadas de todos los feeds
    const allItems = [];
    
    this.cache.forEach((cached, feedId) => {
      if (cached.data && cached.data.items) {
        allItems.push(...cached.data.items.map(item => ({
          ...item,
          feedInfo: cached.data.feedInfo
        })));
      }
    });
    
    // Ordenar por fecha y tomar las más recientes
    const destacadas = allItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 6);
    
    this.renderDestacadas(destacadas);
  }

  renderDestacadas(items) {
    const container = document.getElementById('destacadas-news-row');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
      const col = document.createElement('div');
      col.classList.add('col');
      
      const categoriaClass = this.getBadgeClasses('category', item.feedInfo?.categoria || 'Destacada');
      const fuenteClass = this.getBadgeClasses('source', item.feedInfo?.fuente || 'Fuente');
      const imagenNoticia = this.getImageUrl(item);
      
      col.innerHTML = `
        <article class="card h-100 news-card featured-news-card" itemscope itemtype="http://schema.org/NewsArticle">
          <div class="position-relative">
            <img src="${imagenNoticia}" class="card-img-top news-image" alt="${item.title}" loading="lazy" itemprop="image">
            <div class="overlay-gradient"></div>
            <span class="${categoriaClass}">${item.feedInfo?.categoria || 'Destacada'}</span>
            <span class="${fuenteClass}">${item.feedInfo?.fuente || 'Fuente'}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title news-headline" itemprop="headline">${item.title}</h5>
            <p class="card-text news-description flex-grow-1" itemprop="description">${this.cleanDescription(item.description)}</p>
            <div class="mt-auto">
              <small class="text-muted d-block mb-2"><i class="bi bi-clock"></i> ${this.formatDate(item.pubDate)}</small>
              <a href="${item.link}" class="btn btn-primary btn-sm w-100" itemprop="url" target="_blank">
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
      
      container.appendChild(col);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.rssManager = new RSSManager();
}); 