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
    const proxyUrl = proxy + encodeURIComponent(url);
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Manejar diferentes formatos de respuesta de proxy
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
      console.warn(`Proxy ${proxyIndex + 1} falló, intentando siguiente...`);
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
    console.log('🔄 Iniciando carga de noticias...');
    
    // Cargar feeds en paralelo con limitación
    const batchSize = 3;
    const feeds = RSS_CONFIG.feeds;
    
    for (let i = 0; i < feeds.length; i += batchSize) {
      const batch = feeds.slice(i, i + batchSize);
      
      const promises = batch.map(async (feed) => {
        try {
          const result = await this.fetchFeed(feed);
          this.renderFeed(result);
        } catch (error) {
          console.error(`Error procesando ${feed.title}:`, error);
        }
      });
      
      await Promise.all(promises);
      
      // Esperar entre lotes para evitar sobrecarga
      if (i + batchSize < feeds.length) {
        await this.delay(1000);
      }
    }
    
    // Cargar noticias destacadas después de que todos los feeds estén listos
    this.loadDestacadas();
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
      
      const imagenNoticia = this.getImageUrl(item);
      
      col.innerHTML = `
        <article class="card h-100 news-card" itemscope itemtype="http://schema.org/NewsArticle" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: all 0.3s ease;">
          <div class="position-relative">
            <img src="${imagenNoticia}" class="card-img-top news-image" alt="${item.title}" loading="lazy" itemprop="image" style="height: 200px; object-fit: cover; transition: transform 0.3s ease;">
            <div class="overlay-gradient" style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(0,0,0,0.7)); pointer-events: none;"></div>
            <span class="badge category-badge" style="position: absolute; top: 12px; left: 12px; background: #bfa046; color: #111; font-weight: 600; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;">${item.feedInfo?.categoria || 'Destacada'}</span>
            <span class="badge source-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #111; font-weight: 500; padding: 4px 8px; border-radius: 15px; font-size: 0.7rem;">${item.feedInfo?.fuente || 'Fuente'}</span>
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
      
      container.appendChild(col);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.rssManager = new RSSManager();
}); 